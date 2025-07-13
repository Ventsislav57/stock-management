import dbConnect from "@/lib/mongodb";
import Report from "@/models/Report";

export async function GET(request) {
    try {
        await dbConnect();

        const url = new URL(request.url);
        const params = url.searchParams;

        const limit = parseInt(params.get("limit")) || 10;
        const skip = parseInt(params.get("skip")) || 0;

        const filter = {};

        // Филтри по име
        const goodName = params.get("goodName");
        if (goodName) {
            filter.GoodName = { $regex: goodName, $options: "i" };
        }

        // Филтри по партньор
        const partner = params.get("partner");
        if (partner) {
            filter.Partner = { $regex: partner, $options: "i" };
        }

        // itemId (точно съвпадение)
        const itemId = params.get("itemId");
        if (itemId) {
            filter.itemId = itemId;
        }

        // ItemID (може би с главна буква, зависи от базата)
        const ItemID = params.get("ItemID");
        if (ItemID) {
            filter.ItemID = ItemID;
        }

        // Date (или интервал)
        const date = params.get("Date");
        const dateFrom = params.get("dateFrom");
        const dateTo = params.get("dateTo");
        if (date) {
            const start = new Date(date);
            start.setUTCHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setUTCHours(23, 59, 59, 999);

            filter.Date = { $gte: start, $lte: end };
        } else if (dateFrom || dateTo) {
            filter.Date = {};
            if (dateFrom) filter.Date.$gte = new Date(dateFrom);
            if (dateTo) filter.Date.$lte = new Date(dateTo);
        }

        // Цена IN
        const priceIn = parseFloat(params.get("priceIn"));
        const priceMin = parseFloat(params.get("priceMin"));
        const priceMax = parseFloat(params.get("priceMax"));
        if (!isNaN(priceIn)) {
            filter.PriceIN = priceIn;
        } else if (!isNaN(priceMin) || !isNaN(priceMax)) {
            filter.PriceIN = {};
            if (!isNaN(priceMin)) filter.PriceIN.$gte = priceMin;
            if (!isNaN(priceMax)) filter.PriceIN.$lte = priceMax;
        }

        // Количество (Qtty)
        const qttyMin = parseFloat(params.get("qttyMin"));
        const qttyMax = parseFloat(params.get("qttyMax"));
        if (!isNaN(qttyMin) || !isNaN(qttyMax)) {
            filter.Qtty = {};
            if (!isNaN(qttyMin)) filter.Qtty.$gte = qttyMin;
            if (!isNaN(qttyMax)) filter.Qtty.$lte = qttyMax;
        }

        // Доставка
        const deliveryMin = parseFloat(params.get("deliveryMin"));
        const deliveryMax = parseFloat(params.get("deliveryMax"));
        if (!isNaN(deliveryMin) || !isNaN(deliveryMax)) {
            filter.deliverysum = {};
            if (!isNaN(deliveryMin)) filter.deliverysum.$gte = deliveryMin;
            if (!isNaN(deliveryMax)) filter.deliverysum.$lte = deliveryMax;
        }

        // Агрегации за минимуми и максимуми
        const priceStats = await Report.aggregate([
            {
                $group: {
                    _id: null,
                    minPrice: { $min: "$PriceIN" },
                    maxPrice: { $max: "$PriceIN" },
                    minQtty: { $min: "$Qtty" },
                    maxQtty: { $max: "$Qtty" },
                    minDelivery: { $min: "$deliverysum" },
                    maxDelivery: { $max: "$deliverysum" },
                },
            },
        ]);

        const stats = priceStats[0] || {
            minPrice: 0,
            maxPrice: 0,
            minQtty: 0,
            maxQtty: 0,
            minDelivery: 0,
            maxDelivery: 0,
        };

        const total = await Report.countDocuments(filter);

        const results = await Report.find(filter)
            .skip(skip)
            .limit(limit)
            .lean();

        return new Response(JSON.stringify({
            message: "Успешно заредени записи",
            status: "success",
            results,
            total,
            limit,
            skip,
            stats,
        }), { status: 200 });

    } catch (error) {
        return new Response(JSON.stringify({
            error: "Грешка при зареждане",
            status: "error",
            details: error.message,
        }), { status: 500 });
    }
}
