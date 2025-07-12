import dbConnect from "@/lib/mongodb";
import Report from "@/models/Report";

export async function GET(request) {
    try {
        await dbConnect();

        const url = new URL(request.url);
        // Прочитаме параметрите от query string
        // Ако няма, слагаме default стойности: limit=10, skip=0
        const limit = parseInt(url.searchParams.get("limit")) || 10;
        const skip = parseInt(url.searchParams.get("skip")) || 0;

        // Вземаме общия брой записи (за да знаем колко има общо)
        const total = await Report.countDocuments();

        // Взимаме резултатите с pagination
        const results = await Report.find().skip(skip).limit(limit).lean();

        return new Response(JSON.stringify({ message: "Успешно заредени записи", status: "success", results, total, limit, skip, }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Грешка при зареждане", status: "error", details: error.message, }), { status: 500 });
    }
}
