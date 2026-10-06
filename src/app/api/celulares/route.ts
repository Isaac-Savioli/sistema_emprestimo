import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const result = await db.query(`
            SELECT
                c.id,
                c.numero,
                CASE
                    WHEN ec.celular_id IS NULL THEN true
                    ELSE false
                END AS disponivel
            FROM celulares c
            LEFT JOIN emprestimo_celulares ec
                ON c.id = ec.celular_id
                AND ec.devolvido_em IS NULL
            ORDER BY c.id;
        `);

        return NextResponse.json(result.rows);

    } catch (error) {
        console.error(
            "ERRO AO BUSCAR CELULARES:",
            error
        );

        return NextResponse.json(
            {
                erro: "Não foi possível buscar os celulares."
            },
            {
                status: 500
            }
        );
    }
}