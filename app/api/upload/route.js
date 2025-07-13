import dbConnect from "@/lib/mongodb";
import Report from "@/models/Report";

function cleanValue(value) {
  if (typeof value === "object" && value !== null) {
    if ("$" in value) return "";
    return "";
  }
  return value || "";
}

function normalizeItem(item) {
    return {
        CodeSort: cleanValue(item.CodeSort),
        Acct: cleanValue(item.Acct),
        Date: item.Date ? new Date(item.Date) : new Date(),
        OperTypeInvisible: cleanValue(item.OperTypeInvisible),
        Code: cleanValue(item.Code),
        ItemID: cleanValue(item.ItemID),
        GoodName: cleanValue(item.GoodName),
        ItemGroupCode: cleanValue(item.ItemGroupCode),
        GroupName: cleanValue(item.GroupName),
        PartnerID: cleanValue(item.PartnerID),
        Partner: cleanValue(item.Partner),
        PartnerGroupCode: cleanValue(item.PartnerGroupCode),
        PartnerGroupName: cleanValue(item.PartnerGroupName),
        LocationID: cleanValue(item.LocationID),
        Object: cleanValue(item.Object),
        OperatorID: cleanValue(item.OperatorID),
        UserName: cleanValue(item.UserName),
        Qtty: parseFloat(item.Qtty) || 0,
        Measure1: cleanValue(item.Measure1),
        PriceIN: parseFloat(item.PriceIN) || 0,
        VATIn1: parseFloat(item.VATIn1) || 0,
        deliverysum: parseFloat(item.deliverysum) || 0,
        VATIn: parseFloat(item.VATIn) || 0,
        BG: cleanValue(item.BG),
        IsTotal: parseInt(item.IsTotal, 10) || 0,
    };
}

export async function POST(req) {
    try {
        await dbConnect();

        const body = await req.json();

        if (!Array.isArray(body.reports)) {
            return new Response(JSON.stringify({ status: "error", message: "reports трябва да е масив" }), { status: 400 });
        }

        const results = [];

        for (const rawItem of body.reports) {
            const item = normalizeItem(rawItem);

            // Проверка дали запис с този ItemID съществува
            const existing = await Report.findOne({ ItemID: item.ItemID });

            if (existing) {
                // Ако има, актуализирай количеството (сумирай)
                existing.Qtty = parseFloat(existing.Qtty || 0) + parseFloat(item.Qtty || 0);

                // Ако искаш, можеш да актуализираш и други полета по избор
                existing.PriceIN = Number(item.PriceIN); // примерно актуализирай цена
                existing.Date = item.Date; // актуализирай дата и т.н.

                await existing.save();
                results.push({ ItemID: item.ItemID, status: "updated" });
            } else {
                // Ако няма, създай нов запис
                const created = await Report.create({ ...item, Qtty: Number(item.Qtty) });
                results.push({ ItemID: item.ItemID, status: "created", id: created._id });
            }
        }

        return new Response(JSON.stringify({ message: "Успешно обработени записи", status: "success", results }),{ status: 200 })
    } catch (error) {
        return new Response(JSON.stringify({ error: "Грешка при качване", status: "error", details: error.message }),{ status: 500 });
    }
}
