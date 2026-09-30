import { NextResponse } from "next/server";
import { db } from "@/lib/db";



export async function GET() {
    try {
        const result = await db.query(`
            SELECT
                e.id,
                e.professor,
                e.data_emprestimo,
                ARRAY_AGG(n.numero ORDER BY n.numero) AS notebooks
            FROM emprestimos e
            JOIN emprestimo_notebooks en
                ON e.id = en.emprestimo_id
            JOIN notebooks n
                ON n.id = en.notebook_id
            WHERE en.devolvido_em IS NULL
            GROUP BY
                e.id,
                e.professor,
                e.data_emprestimo
            ORDER BY e.id DESC;
        `);

        return NextResponse.json(result.rows);

    } catch (error) {
        console.error("ERRO AO BUSCAR EMPRÉSTIMOS:", error);

        return NextResponse.json(
            {
                erro: "Não foi possível buscar os empréstimos.",
            },
            { status: 500 }
        );
    }
}