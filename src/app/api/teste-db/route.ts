import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const result = await db.query("SELECT NOW()");

        return NextResponse.json({
            conectado: true,
            horarioBanco: result.rows[0],
        });
    } catch (error) {
        console.error("ERRO DO BANCO:", error);

        console.log("HOST:", process.env.DB_HOST);
        console.log("PORT:", process.env.DB_PORT);
        console.log("DATABASE:", process.env.DB_NAME);
        console.log("USER:", process.env.DB_USER);
        console.log(
            "PASSWORD CONFIGURADA:",
            process.env.DB_PASSWORD ? "SIM" : "NÃO"
        );

        return NextResponse.json(
            {
                conectado: false,
                erro: String(error),
            },
            { status: 500 }
        );
    }
}