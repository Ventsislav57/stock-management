import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        // 1) Намираме потребителя
        const user = await prisma.users.findUnique({
            where: { username },
        });

        console.log("Намерен потребител:", user);

        if (!user) {
            return new Response(
                JSON.stringify({ message: "Грешно потребителско име или парола", status: "error" }),
                { status: 401 }
            );
        }

        // 2) Проверяваме паролата
        const isMatch = await bcrypt.compare(password, user.password_hash);

        console.log("Паролата съвпада ли:", isMatch);

        if (!isMatch) {
            return new Response(
                JSON.stringify({ message: "Грешно потребителско име или парола", status: "error" }),
                { status: 401 }
            );
        }

        // 3) Успешно влизане
        return new Response(
            JSON.stringify({
                message: "Успешно влизане",
                status: "success",
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    role: user.role,
                },
            }),
            { status: 200 }
        );

    } catch (error) {
        console.error("Login error:", error);
        return new Response(
            JSON.stringify({ message: "Грешка на сървъра", status: "error" }),
            { status: 500 }
        );
    }
}
