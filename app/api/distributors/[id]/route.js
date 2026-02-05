import { prisma } from "@/lib/prisma";

function toInt(v) {
    const s = v === null || v === undefined ? "" : String(v).trim();
    if (!s) return null;
    const n = Number.parseInt(s, 10);
    return Number.isFinite(n) ? n : null;
}

export async function GET(_, { params }) {
    const id = toInt(params?.id);
    if (id === null) return Response.json({ error: "Invalid id" }, { status: 400 });

    const distributor = await prisma.distributors.findUnique({
        where: { id },
    });

    if (!distributor) return Response.json({ error: "Not found" }, { status: 404 });

    return Response.json(distributor);
}

export async function PUT(req, { params }) {
    const id = toInt(params?.id);
    if (id === null) return Response.json({ error: "Invalid id" }, { status: 400 });

    const data = await req.json();

    const updated = await prisma.distributors.update({
        where: { id },
        data,
    });

    return Response.json(updated);
}

export async function DELETE(_, { params }) {
    const id = toInt(params?.id);
    if (id === null) return Response.json({ error: "Invalid id" }, { status: 400 });

    await prisma.distributors.delete({
        where: { id },
    });

    return Response.json({ status: "deleted" });
}
