import dbConnect from "@/lib/mongodb";
import Report from "@/models/Report";

function normalizeItem(item) {
    return {
        CodeSort: item.CodeSort || "",
        Acct: item.Acct || "",
        Date: item.Date || new Date().toISOString(),
        OperTypeInvisible: item.OperTypeInvisible || "",
        ItemID: item.ItemID || "",
        GoodName: item.GoodName || "",
        PartnerID: item.PartnerID || "",
        LocationID: item.LocationID || "",
        OperatorID: item.OperatorID || "",
        PriceOut: parseFloat(item.PriceOut) || 0,
        VATOut1: parseFloat(item.VATOut1) || 0,
        SaleSum: parseFloat(item.SaleSum) || 0,
        VATOut: parseFloat(item.VATOut) || 0,
        PriceIn: parseFloat(item.PriceIn) || 0,
        VATIn1: parseFloat(item.VATIn1) || 0,
        DeliverySum: parseFloat(item.DeliverySum) || 0,
        VATIn: parseFloat(item.VATIn) || 0,
        Profit: parseFloat(item.Profit) || 0,
        IsTotal: parseInt(item.IsTotal, 10) || 0,
    };
}

export async function POST(req) {
    try {
        await dbConnect();

        const body = await req.json();

        if (!Array.isArray(body.reports)) {
        return new Response(JSON.stringify({ status: "error", message: "reports трябва да е масив",}), { status: 400 });}


        for (const rawItem of body.reports) {
            const item = normalizeItem(rawItem);

            // Проверка дали запис с този ItemID съществува
            const existing = await Report.findOne({ ItemID: item.ItemID });

            const qttyDelta = parseFloat(item.Qtty || 0);

            if (existing && existing.Qtty > 1 && item.OperTypeInvisible === "2") {
                existing.Qtty -= 1;
                existing.Date = item.Date;
                await existing.save();
                console.log('refresh count -> ', existing);
            } else {
                console.log('nqma takyv, bate!!!');
            }
        }

        return new Response(JSON.stringify({ message: "Успешно обработени записи", status: "success" }),{ status: 200 });
    } catch (error) {
        console.log(error);
        
        return new Response(JSON.stringify({ status: "error", message: "Грешка при качване"}), { status: 500 } );
    }
}
