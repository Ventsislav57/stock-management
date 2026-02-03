import { prisma } from "@/lib/prisma";

/**
 * Client payload:
 * { reports: [ { operation_type, code, acct, date, product_id, product_name, measure,
 *               partner_id, partner_name, location_id, location_name,
 *               user_id, user_name, quantity, price, vat, total, partner, note, raw_xml } ] }
 */

function toNumber(v, fallback = null) {
    if (v === null || v === undefined || v === "") return fallback;
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
}

function toFloat(v, fallback = 0) {
    if (v === null || v === undefined || v === "") return fallback;
    const n = parseFloat(String(v).replace(",", "."));
    return Number.isFinite(n) ? n : fallback;
}

function toDate(v) {
    const d = v ? new Date(v) : new Date();
    return isNaN(d.getTime()) ? new Date() : d;
}

function cleanStr(v, fallback = "") {
    if (v === null || v === undefined) return fallback;
    if (typeof v === "object") return fallback;
    return String(v);
}

async function getOrCreateDistributorIdByExternalPartnerId(partnerId, partnerName) {
    const externalPartnerId = partnerId ? Number(partnerId) : null;
    if (!externalPartnerId) return null;

    const name = (partnerName ?? "").trim() || `Distributor ${externalPartnerId}`;

    const dist = await prisma.distributors.upsert({
        where: { external_partner_id: externalPartnerId },
        update: { name },
        create: {
            external_partner_id: externalPartnerId,
            name,
            is_active: true,
            // country: "Bulgaria" // ако нямаш default в DB
        },
        select: { id: true },
    });

    return dist.id;
}

/**
 * Validate + coerce a client report into the DB shape expected by prisma.operations.create/update.
 * NOTE: keeps names aligned with your DB columns (distributor_id, location_name, etc.)
 */
function coerceClientReport(r) {
    const operation_type = cleanStr(r.operation_type, "unknown");

    const code = toNumber(r.code, null);
    const acct = toNumber(r.acct, null);
    const date = toDate(r.date);

    const product_id = toNumber(r.product_id, 0);
    const product_name = cleanStr(r.product_name, "");
    const measure = r.measure === null ? null : cleanStr(r.measure, null);

    // client sends partner_id; DB uses distributor_id
    const distributor_id = toNumber(r.partner_id, null);
    const location_id = toNumber(r.location_id, null);
    const location_name = cleanStr(r.location_name, "");

    // operator from XML (client sends user_id)
    const user_id = toNumber(r.user_id, null);
    const user_name = cleanStr(r.user_name, "");

    const quantity = toFloat(r.quantity, 0);
    const price = toFloat(r.price, 0);
    const vat = toFloat(r.vat, 0);
    const total = toFloat(r.total, 0);

    const note = r.note === null ? null : cleanStr(r.note, null);
    const raw_xml = typeof r.raw_xml === "string" ? r.raw_xml : JSON.stringify(r.raw_xml ?? r);

    // Minimal validation
    const errors = [];
    if (code === null) errors.push("code is required (number)");
    if (!product_id) errors.push("product_id is required (>0)");
    if (!quantity && quantity !== 0) errors.push("quantity invalid");
    if (!date) errors.push("date invalid");

    return {
        ok: errors.length === 0,
        errors,
        data: {
            operation_type,
            code,
            acct,
            date,
            product_id,
            product_name,
            measure,
            distributor_id,
            location_id,
            location_name,
            user_id,
            user_name,
            quantity,
            price,
            vat,
            total,
            note,
            raw_xml,
        },
    };
}

export async function POST(req) {
    try {
        const body = await req.json();

        if (!Array.isArray(body?.reports)) {
            return new Response(
                JSON.stringify({ status: "error", message: "reports трябва да е масив" }),
                { status: 400 }
            );
        }

        // Debug: виж ключове при нужда
        // console.log("UPLOAD first report keys:", Object.keys(body.reports?.[0] || {}));

        const results = [];

        for (let i = 0; i < body.reports.length; i++) {
            const raw = body.reports[i];
            const coerced = coerceClientReport(raw);

            if (!coerced.ok) {
                results.push({
                    index: i,
                    status: "skipped_invalid",
                    errors: coerced.errors,
                    code: raw?.code ?? null,
                    product_id: raw?.product_id ?? null,
                });
                continue;
            }

            const item = coerced.data;

            // IMPORTANT: date equality is fragile; leaving as-is for now, because you already use it.
            // If you see duplicates, we’ll change matching to day-range or to code+product_id only.
            const existing = await prisma.operations.findFirst({
                where: {
                    code: item.code,
                    product_id: item.product_id,
                    date: item.date,
                },
            });

            if (existing) {
                const partnerId = raw.partner_id ?? null;
                const partnerName = raw.partner_name ?? raw.partner ?? null;

                item.distributor_id = await getOrCreateDistributorIdByExternalPartnerId(partnerId, partnerName);
                const updated = await prisma.operations.update({
                    where: { id: existing.id },
                    data: {
                        quantity: existing.quantity + item.quantity,
                        price: item.price,
                        vat: item.vat,
                        total: item.total,
                        note: item.note,
                        raw_xml: item.raw_xml,
                        distributor_id: item.distributor_id,
                    },
                });

                // LOG UPDATE: use report.user_id (operator) because client does not send body.user_id
                const logUserId = item.user_id ?? null;

                if (logUserId) {
                    await prisma.logs.create({
                        data: {
                            user_id: logUserId,
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
                } else {
                    console.warn("Skipping log (update): no user_id in report");
                }

                results.push({ index: i, code: item.code, product_id: item.product_id, status: "updated" });
            } else {
                const partnerId = raw.partner_id ?? null;
                const partnerName = raw.partner_name ?? raw.partner ?? null;

                item.distributor_id = await getOrCreateDistributorIdByExternalPartnerId(partnerId, partnerName);
                const created = await prisma.operations.create({
                    data: item,
                });

                // LOG CREATE: use report.user_id
                const logUserId = item.user_id ?? null;

                if (logUserId) {
                    await prisma.logs.create({
                        data: {
                            user_id: logUserId,
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
                } else {
                    console.warn("Skipping log (create): no user_id in report");
                }

                results.push({ index: i, code: item.code, product_id: item.product_id, status: "created" });
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
        console.error("UPLOAD error:", error);
        return new Response(
            JSON.stringify({
                status: "error",
                message: "Грешка при обработка",
                details: error?.message ?? String(error),
            }),
            { status: 500 }
        );
    }
}