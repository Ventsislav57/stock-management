import { prisma } from "@/lib/prisma";

export async function GET(_, { params }) {
    const distributor = await prisma.distributors.findUnique({
        where: { id: Number(params.id) }
    });

    return Response.json(distributor);
}

export async function PUT(req, { params }) {
    const data = await req.json();

    const updated = await prisma.distributors.update({
        where: { id: Number(params.id) },
        data
    });

    return Response.json(updated);
}

export async function DELETE(_, { params }) {
    await prisma.distributors.delete({
        where: { id: Number(params.id) }
    });

    return Response.json({ status: "deleted" });
}
