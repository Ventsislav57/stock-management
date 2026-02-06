import { prisma } from "@/lib/prisma";

function cleanStr(v) {
    if (v === null || v === undefined) return "";
    if (typeof v === "object") return "";
    return String(v).trim();
}

function toFloat(v, fallback = 0) {
    const s = cleanStr(v);
    const n = Number.parseFloat(s.replace(",", "."));
    return Number.isFinite(n) ? n : fallback;
}

function toInt(v, fallback = 1) {
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) ? n : fallback;
}

function normalizeItem(item) {
    return {
        itemId: cleanStr(item.ItemID),
        codeSort: cleanStr(item.CodeSort),
        acct: cleanStr(item.Acct),
        date: new Date(item.Date || Date.now()),
        operTypeInvisible: cleanStr(item.OperTypeInvisible),
        goodName: cleanStr(item.GoodName),
        partnerId: cleanStr(item.PartnerID),
        locationId: cleanStr(item.LocationID),
        operatorId: cleanStr(item.OperatorID),

        priceOut: toFloat(item.PriceOut),
        vatOut1: toFloat(item.VATOut1),
        saleSum: toFloat(item.SaleSum),
        vatOut: toFloat(item.VATOut),

        priceIn: toFloat(item.PriceIn),
        vatIn1: toFloat(item.VATIn1),
        deliverySum: toFloat(item.DeliverySum),
        vatIn: toFloat(item.VATIn),

        profit: toFloat(item.Profit),
        isTotal: toInt(item.IsTotal, 0),

        qtty: toInt(item.Qtty, 1),
    };
}

export async function POST(req) {
    try {
        const { reports } = await req.json();

        if (!Array.isArray(reports)) {
            return Response.json(
                { status: "error", message: "reports трябва да е масив" },
                { status: 400 }
            );
        }

        await prisma.$transaction(async (tx) => {
            for (const raw of reports) {
                const sale = normalizeItem(raw);

                if (!sale.itemId || sale.operTypeInvisible !== "2") continue;

                await tx.sale.create({ data: sale });

                await tx.product.update({
                    where: { itemId: sale.itemId },
                    data: {
                        stock: {
                            decrement: sale.qtty,
                        },
                    },
                });
            }
        });

        return Response.json({ status: "success" });
    } catch (err) {
        console.error(err);
        return Response.json(
            { status: "error", message: "Грешка при качване на продажби" },
            { status: 500 }
        );
    }
}
