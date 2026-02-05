import { prisma } from "@/lib/prisma";

function cleanStr(v) {
    if (v === null || v === undefined) return "";
    if (typeof v === "object") return "";
    return String(v).trim();
}

function toInt(v, fallback) {
    const s = cleanStr(v);
    if (!s) return fallback;
    const n = Number.parseInt(s, 10);
    return Number.isFinite(n) ? n : fallback;
}

function toFloat(v, fallback = null) {
    const s = cleanStr(v);
    if (!s || s === "undefined") return fallback;
    const n = Number.parseFloat(s.replace(",", "."));
    return Number.isFinite(n) ? n : fallback;
}
function parseDayRangeUTC(v) {
    const s = cleanStr(v);
    if (!s) return null;
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return null;

    // като в стария код: UTC day range
    const start = new Date(d);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(d);
    end.setUTCHours(23, 59, 59, 999);

    return { start, end };
}

function getColor(percent) {
    if (percent === null) return "green";
    if (percent < 15) return "red";
    if (percent <= 50) return "yellow";
    return "green";
}

function colorRank(color) {
    if (color === "red") return 0;
    if (color === "yellow") return 1;
    return 2;
}

async function resolveDistributorId(prisma, distributorIdParam) {
    if (distributorIdParam) {
        const n = Number.parseInt(String(distributorIdParam), 10);
        return Number.isFinite(n) ? n : null;
    }

    const first = await prisma.distributors.findFirst({
        select: { id: true },
        orderBy: { name: "asc" },
    });

    return first?.id ?? null;
}

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const params = url.searchParams;

        const distributorIdParam = cleanStr(params.get("distributorId"));
        const selectedDistributorId = await resolveDistributorId(prisma, distributorIdParam);
        
        if (distributorIdParam && selectedDistributorId === null) {
            return new Response(
                JSON.stringify({ status: "error", error: "Invalid distributorId" }),
                { status: 400 }
            );
        }
        
        const limit = toInt(params.get("limit"), 10);
        const skip = toInt(params.get("skip"), 0);

        // ------- OLD FILTERS (same param names) -------
        const goodName = cleanStr(params.get("goodName"));
        const partner = cleanStr(params.get("partner"));

        const itemId = cleanStr(params.get("itemId"));
        const ItemID = cleanStr(params.get("ItemID")); // legacy alias
        const itemIdValue = itemId || ItemID;

        const date = params.get("Date");
        const dateFrom = params.get("dateFrom");
        const dateTo = params.get("dateTo");

        const priceIn = toFloat(params.get("priceIn"), null);
        const priceMin = toFloat(params.get("priceMin"), null);
        const priceMax = toFloat(params.get("priceMax"), null);

        const qttyMin = toFloat(params.get("qttyMin"), null);
        const qttyMax = toFloat(params.get("qttyMax"), null);

        // deliverysum filters (legacy) -> ще филтрираме по last_delivery_qty
        const deliveryMin = toFloat(params.get("deliveryMin"), null);
        const deliveryMax = toFloat(params.get("deliveryMax"), null);
        
        // ------- Prisma where for Product -------
        const where = {};

        if (selectedDistributorId !== null) {
            where.distributor_id = selectedDistributorId;
        }

        if (goodName) {
            where.product_name = { contains: goodName, mode: "insensitive" };
        }

        if (partner) {
            where.distributor = { name: { contains: partner, mode: "insensitive" } };
        }

        if (itemIdValue) {
            // в Mongo беше точно съвпадение
            where.item_id = itemIdValue;
        }

        // Date / dateFrom / dateTo — ще ги вържем към last_restocked_at (логично за products)
        if (date) {
            const r = parseDayRangeUTC(date);
            if (r) where.last_restocked_at = { gte: r.start, lte: r.end };
        } else if (dateFrom || dateTo) {
            where.last_restocked_at = {};
            if (dateFrom) where.last_restocked_at.gte = new Date(dateFrom);
            if (dateTo) where.last_restocked_at.lte = new Date(dateTo);
        }

        // PriceIN
        if (priceIn !== null) {
            // Mongo: exact match
            where.delivery_price = priceIn;
        } else if (priceMin !== null || priceMax !== null) {
            where.delivery_price = {};
            if (priceMin !== null) where.delivery_price.gte = priceMin;
            if (priceMax !== null) where.delivery_price.lte = priceMax;
        }

        // Qtty -> stock
        if (qttyMin !== null || qttyMax !== null) {
            where.stock = {};
            if (qttyMin !== null) where.stock.gte = qttyMin;
            if (qttyMax !== null) where.stock.lte = qttyMax;
        }

        // 1) взимаме ВСИЧКИ matching продукти (за да сортираме глобално red/yellow/other)
        // ако по-нататък стане много голямо — ще го оптимизираме със SQL DISTINCT ON + CASE + LIMIT/OFFSET
        const matched = await prisma.products.findMany({
            where,
            orderBy: { updated_at: "desc" },
            include: {
                distributor: { select: { id: true, name: true, external_partner_id: true } },
            },
        });

        const total = matched.length;

        // 2) last delivery за всеки product_id
        const productIds = matched.map((p) => p.product_id);

        const lastOps = productIds.length
            ? await prisma.operations.findMany({
                where: { product_id: { in: productIds } },
                orderBy: [{ product_id: "asc" }, { date: "desc" }],
                select: { product_id: true, quantity: true, date: true },
            })
            : [];

        const lastByProductId = new Map();
        for (const op of lastOps) {
            if (!lastByProductId.has(op.product_id)) lastByProductId.set(op.product_id, op);
        }
        
        // 3) enrich + legacy aliases (за да не пипаш page.jsx)
        const enriched = matched.map((p) => {
            const last = lastByProductId.get(p.product_id) || null;

            const stock = Number(p.stock ?? 0);
            const lastQty = last ? Number(last.quantity ?? 0) : 0;

            let percent = last && lastQty > 0 ? Math.round((stock / lastQty) * 100) : null;
            if (percent !== null) percent = Math.max(0, Math.min(100, percent));
            const color = getColor(percent);

            const partnerName = p.distributor?.name ?? null;

            return {
                // ---- original (new world) ----
                ...p,
                distributor_name: partnerName,
                last_delivery_qty: last ? lastQty : null,
                last_delivery_date: last ? last.date : null,
                stock_percent: percent,
                color,

                // ---- legacy keys (old world) ----
                GoodName: p.product_name,
                Partner: partnerName,
                PriceIN: p.delivery_price ?? null,
                Qtty: p.stock ?? 0,
                Date: p.last_restocked_at ?? null,
                itemId: p.item_id ?? null,
                ItemID: p.item_id ?? null,
                deliverysum: last ? lastQty : null,
            };
        });

        // 4) deliverysum filters (legacy) – прилагаме ги СЛЕД като имаме last_delivery_qty
        let filtered = enriched;
        if (deliveryMin !== null || deliveryMax !== null) {
            filtered = filtered.filter((x) => {
                const v = x.last_delivery_qty;
                if (v === null || v === undefined) return false;
                if (deliveryMin !== null && v < deliveryMin) return false;
                if (deliveryMax !== null && v > deliveryMax) return false;
                return true;
            });
        }

        // total след delivery filters (за да е честно към UI)
        const totalAfter = filtered.length;

        // 5) Stats (като Mongo aggregate)
        // min/max за PriceIN, Qtty, Delivery
        let minPrice = Infinity,
            maxPrice = -Infinity,
            minQtty = Infinity,
            maxQtty = -Infinity,
            minDelivery = Infinity,
            maxDelivery = -Infinity;

        for (const x of filtered) {
            const price = x.PriceIN;
            if (typeof price === "number" && Number.isFinite(price)) {
                if (price < minPrice) minPrice = price;
                if (price > maxPrice) maxPrice = price;
            }

            const qtty = Number(x.Qtty ?? 0);
            if (Number.isFinite(qtty)) {
                if (qtty < minQtty) minQtty = qtty;
                if (qtty > maxQtty) maxQtty = qtty;
            }

            const del = x.deliverysum;
            if (typeof del === "number" && Number.isFinite(del)) {
                if (del < minDelivery) minDelivery = del;
                if (del > maxDelivery) maxDelivery = del;
            }
        }

        const stats = {
            minPrice: minPrice === Infinity ? 0 : minPrice,
            maxPrice: maxPrice === -Infinity ? 0 : maxPrice,
            minQtty: minQtty === Infinity ? 0 : minQtty,
            maxQtty: maxQtty === -Infinity ? 0 : maxQtty,
            minDelivery: minDelivery === Infinity ? 0 : minDelivery,
            maxDelivery: maxDelivery === -Infinity ? 0 : maxDelivery,
        };

        // 6) Global sort: red -> yellow -> other, after that by % asc, then by name
        filtered.sort((a, b) => {
            const r = colorRank(a.color) - colorRank(b.color);
            if (r !== 0) return r;

            const ap = a.stock_percent ?? 999999;
            const bp = b.stock_percent ?? 999999;
            if (ap !== bp) return ap - bp;

            return String(a.product_name || "").localeCompare(String(b.product_name || ""), "bg");
        });

        // 7) pagination (както беше: skip/limit)
        const results = filtered.slice(skip, skip + limit);

        return new Response(
            JSON.stringify({
                message: "Успешно заредени записи",
                status: "success",
                results,
                total: totalAfter,
                limit,
                skip,
                stats,
                selectedDistributorId,
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("GET /api/products error:", error);
        return new Response(
            JSON.stringify({
                error: "Грешка при зареждане",
                status: "error",
                details: error?.message ?? String(error),
            }),
            { status: 500 }
        );
    }
}