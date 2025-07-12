import { MongoClient } from "mongodb";
const bcrypt = require("bcrypt");

const uri = process.env.CONNECTION_STRING;
const client = new MongoClient(uri);

export async function POST(request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        await client.connect();
        const db = client.db("test");

        const user = await db.collection("admins").findOne({ username });
        
        if (!user) {
            return new Response(JSON.stringify({ message: "Грешно потребителско име или парола", status: 'error' }), { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return new Response(JSON.stringify({ message: "Грешно потребителско име или парола", status: 'error' }), { status: 401 });
        }

        return new Response(JSON.stringify({ message: "Успешно влизане", status: "success" }), { status: 200 });

    } catch (error) {
        return new Response(JSON.stringify({ message: "Грешка на сървъра" }), { status: 500 });
    } finally {
        await client.close();
    }
}
