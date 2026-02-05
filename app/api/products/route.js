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

        // Distributor filter
        const distributorIdParam = cleanStr(params.get("distributorId"));
        const selectedDistributorId = await resolveDistributorId(prisma, distributorIdParam);

        if (distributorIdParam && selectedDistributorId === null) {
            return new Response(
                JSON.stringify({ status: "error", error: "Invalid distributorId" }),
                { status: 400 }
            );
        }

        const limit = toInt(params.get("limit"), 50);
        const skip = toInt(params.get("skip"), 0);

        // Filters
        const goodName = cleanStr(params.get("goodName"));
        const partner = cleanStr(params.get("partner"));

        // NEW: stock range
        const stockMin = toFloat(params.get("stockMin"), null);
        const stockMax = toFloat(params.get("stockMax"), null);

        // Date filters
        const date = params.get("Date");
        const dateFrom = params.get("dateFrom");
        const dateTo = params.get("dateTo");

        // Price filters
        const priceIn = toFloat(params.get("priceIn"), null);
        const priceMin = toFloat(params.get("priceMin"), null);
        const priceMax = toFloat(params.get("priceMax"), null);

        // Delivery qty filters (legacy)
        const deliveryMin = toFloat(params.get("deliveryMin"), null);
        const deliveryMax = toFloat(params.get("deliveryMax"), null);

        // ---------------- WHERE ----------------
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

        // Stock range
        if (stockMin !== null || stockMax !== null) {
            where.stock = {};
            if (stockMin !== null) where.stock.gte = stockMin;
            if (stockMax !== null) where.stock.lte = stockMax;
        }

        // Date filters → last_restocked_at
        if (date) {
            const r = parseDayRangeUTC(date);
            if (r) where.last_restocked_at = { gte: r.start, lte: r.end };
        } else if (dateFrom || dateTo) {
            where.last_restocked_at = {};
            if (dateFrom) where.last_restocked_at.gte = new Date(dateFrom);
            if (dateTo) where.last_restocked_at.lte = new Date(dateTo);
        }

        // Price filters
        if (priceIn !== null) {
            where.delivery_price = priceIn;
        } else if (priceMin !== null || priceMax !== null) {
            where.delivery_price = {};
            if (priceMin !== null) where.delivery_price.gte = priceMin;
            if (priceMax !== null) where.delivery_price.lte = priceMax;
        }

        // ---------------- FETCH PRODUCTS ----------------
        const matched = await prisma.products.findMany({
            where,
            orderBy: { updated_at: "desc" },
            include: {
                distributor: { select: { id: true, name: true, external_partner_id: true } },
            },
        });

        const total = matched.length;

        // ---------------- LAST DELIVERY OPS ----------------
        const productIds = matched.map((p) => p.product_id);

        const lastOps = productIds.length
            ? await prisma.operations.findMany({
                  where: {
                      product_id: { in: productIds },
                      operation_type: "delivery",
                  },
                  orderBy: [{ product_id: "asc" }, { date: "desc" }],
                  select: { product_id: true, quantity: true, date: true },
              })
            : [];

        const lastByProductId = new Map();
        for (const op of lastOps) {
            if (!lastByProductId.has(op.product_id)) lastByProductId.set(op.product_id, op);
        }

        // ---------------- ENRICH ----------------
        const enriched = matched.map((p) => {
            const last = lastByProductId.get(p.product_id) || null;

            const stock = Number(p.stock ?? 0);
            const lastQty = last ? Number(last.quantity ?? 0) : 0;

            let percent = last && lastQty > 0 ? Math.round((stock / lastQty) * 100) : null;
            if (percent !== null) percent = Math.max(0, Math.min(100, percent));

            const color = getColor(percent);
            const partnerName = p.distributor?.name ?? null;

            return {
                ...p,
                distributor_name: partnerName,
                last_delivery_qty: last ? lastQty : null,
                last_delivery_date: last ? last.date : null,
                stock_percent: percent,
                color,

                // legacy
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

        // ---------------- DELIVERY FILTER ----------------
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

        const totalAfter = filtered.length;

        // ---------------- STOCK RANGE CALC ----------------
        let minStock = Infinity;
        let maxStock = -Infinity;

        let minPrice = Infinity;
        let maxPrice = -Infinity;


        for (const p of matched) {
            const s = Number(p.stock ?? 0);
            if (s < minStock) minStock = s;
            if (s > maxStock) maxStock = s;

            const price = Number(p.delivery_price ?? 0);
            if (price < minPrice) minPrice = price;
            if (price > maxPrice) maxPrice = price;
        }

        if (minStock === Infinity) minStock = 0;
        if (maxStock === -Infinity) maxStock = 0;

        if (minPrice === Infinity) minPrice = 0;
        if (maxPrice === -Infinity) maxPrice = 0;


        // ---------------- SORT ----------------
        filtered.sort((a, b) => {
            const r = colorRank(a.color) - colorRank(b.color);
            if (r !== 0) return r;

            const ap = a.stock_percent ?? 999999;
            const bp = b.stock_percent ?? 999999;
            if (ap !== bp) return ap - bp;

            return String(a.product_name || "").localeCompare(String(b.product_name || ""), "bg");
        });

        // ---------------- PAGINATION ----------------
        const results = filtered.slice(skip, skip + limit);

        return new Response(
            JSON.stringify({
                message: "Успешно заредени записи",
                status: "success",
                results,
                total: totalAfter,
                limit,
                skip,
                minStock,
                maxStock,
                minPrice,
                maxPrice,
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
