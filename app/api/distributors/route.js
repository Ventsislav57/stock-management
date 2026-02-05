import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const items = await prisma.distributors.findMany({
            select: { id: true, name: true, city: true, phone: true, email: true, bulstat: true },
            orderBy: { name: "asc" },
        });

        const defaultDistributorId = items[0]?.id ?? null;

        return Response.json({
            status: "success",
            defaultDistributorId,
            items,
        });
    } catch (e) {
        console.error("GET /api/distributors error:", e);
        return Response.json(
            { status: "error", error: e?.message ?? String(e) },
            { status: 500 }
        );
    }
}
