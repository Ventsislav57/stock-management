import { prisma } from "@/lib/prisma";

function clean(value) {
    if (typeof value === "object" && value !== null) return "";
    return value ?? "";
}

function normalize(item) {
    return {
        operation_type: clean(item.OperTypeInvisible) || "unknown",
        code: item.Code ? Number(item.Code) : null,
        acct: item.Acct ? Number(item.Acct) : null,
        date: item.Date ? new Date(item.Date) : new Date(),

        product_id: item.ItemID ? Number(item.ItemID) : 0,
        product_name: clean(item.GoodName),
        measure: clean(item.Measure1),

        distributor_id: item.PartnerID ? Number(item.PartnerID) : null,
        location_id: item.LocationID ? Number(item.LocationID) : null,
        location_name: clean(item.Object),

        user_id: item.OperatorID ? Number(item.OperatorID) : null,
        user_name: clean(item.UserName),

        quantity: parseFloat(item.Qtty) || 0,
        price: parseFloat(item.PriceIN) || 0,
        vat: parseFloat(item.VATIn) || 0,
        total: parseFloat(item.deliverysum) || 0,

        note: clean(item.BG),
        raw_xml: JSON.stringify(item),
    };
}

export async function POST(req) {
    try {
        const body = await req.json();

        if (!Array.isArray(body.reports)) {
            return new Response(
                JSON.stringify({ status: "error", message: "reports трябва да е масив" }),
                { status: 400 }
            );
        }

        const userId = body.user_id || null; // ID на потребителя, който качва файла

        const results = [];

        for (const raw of body.reports) {
            const item = normalize(raw);

            const existing = await prisma.operations.findFirst({
                where: {
                    code: item.code,
                    product_id: item.product_id,
                    date: item.date,
                },
            });

            if (existing) {
                const updated = await prisma.operations.update({
                    where: { id: existing.id },
                    data: {
                        quantity: existing.quantity + item.quantity,
                        price: item.price,
                        vat: item.vat,
                        total: item.total,
                        note: item.note,
                        raw_xml: item.raw_xml,
                        updated_at: new Date(),
                    },
                });

                // ЛОГ ЗА UPDATE
                await prisma.logs.create({
                    data: {
                        user_id: userId,
                        action: "update_operation",
                        entity_type: "operation",
                        entity_id: updated.id,
                        details: {
                            old_quantity: existing.quantity,
                            new_quantity: updated.quantity,
                            product_id: updated.product_id,
                            code: updated.code,
                        },
                    },
                });

                results.push({ code: item.code, product_id: item.product_id, status: "updated" });
            } else {
                const created = await prisma.operations.create({
                    data: item,
                });

                // ЛОГ ЗА CREATE
                await prisma.logs.create({
                    data: {
                        user_id: userId,
                        action: "create_operation",
                        entity_type: "operation",
                        entity_id: created.id,
                        details: {
                            product_id: created.product_id,
                            code: created.code,
                            quantity: created.quantity,
                        },
                    },
                });

                results.push({ code: item.code, product_id: item.product_id, status: "created" });
            }
        }

        return new Response(
            JSON.stringify({
                status: "success",
                message: "Операциите са обработени успешно",
                results,
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({
                status: "error",
                message: "Грешка при обработка",
                details: error.message,
            }),
            { status: 500 }
        );
    }
}
