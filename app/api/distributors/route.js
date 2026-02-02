import { prisma } from "@/lib/prisma";

export async function GET() {
    const distributors = await prisma.distributors.findMany({
        orderBy: { name: "asc" }
    });

    return Response.json(distributors);
}

export async function POST(req) {
    console.log(Object.keys(prisma));

    const data = await req.json();
    console.log(data);
    

    const created = await prisma.distributors.create({
        data
    });

    return Response.json(created);
}
