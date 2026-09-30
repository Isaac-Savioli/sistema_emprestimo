import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const result = await db.query(`
            SELECT
                e.id,
                e.professor,
                e.data_emprestimo,

                CASE
                    WHEN COUNT(en.id) FILTER (
                        WHERE en.devolvido_em IS NULL
                    ) = 0
                    THEN true
                    ELSE false
                    END AS devolvido,

                MAX(en.devolvido_em) AS devolvido_em,

                JSON_AGG(
                        JSON_BUILD_OBJECT(
                                'id', n.id,
                                'numero', n.numero
                        )
                            ORDER BY n.id
                ) AS notebooks

            FROM emprestimos e

                     JOIN emprestimo_notebooks en
                          ON e.id = en.emprestimo_id

                     JOIN notebooks n
                          ON n.id = en.notebook_id

            GROUP BY
                e.id,
                e.professor,
                e.data_emprestimo

            ORDER BY e.id DESC;
        `);

        return NextResponse.json(result.rows);

    } catch (error) {
        console.error(
            "ERRO AO BUSCAR HISTÓRICO DE EMPRÉSTIMOS:",
            error
        );

        return NextResponse.json(
            {
                erro: "Não foi possível buscar o histórico de empréstimos."
            },
            {
                status: 500
            }
        );
    }
}