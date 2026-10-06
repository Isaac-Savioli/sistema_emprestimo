import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const result = await db.query(`
            WITH equipamentos_ativos AS (
                SELECT
                    en.emprestimo_id,
                    n.id,
                    n.numero
                FROM emprestimo_notebooks en
                         JOIN notebooks n
                              ON n.id = en.notebook_id
                WHERE en.devolvido_em IS NULL

                UNION ALL

                SELECT
                    ec.emprestimo_id,
                    c.id,
                    c.numero
                FROM emprestimo_celulares ec
                         JOIN celulares c
                              ON c.id = ec.celular_id
                WHERE ec.devolvido_em IS NULL
            )

            SELECT
                e.id,
                e.professor,
                e.data_emprestimo,
                e.tipo_emprestimo,

                COUNT(ea.id) AS quantidade,

                JSON_AGG(
                        JSON_BUILD_OBJECT(
                                'id', ea.id,
                                'numero', ea.numero
                        )
                            ORDER BY ea.id
                ) AS equipamentos

            FROM emprestimos e

                     JOIN equipamentos_ativos ea
                          ON ea.emprestimo_id = e.id

            GROUP BY
                e.id,
                e.professor,
                e.data_emprestimo,
                e.tipo_emprestimo

            ORDER BY e.id DESC;
        `);

        return NextResponse.json(result.rows);

    } catch (error) {
        console.error(
            "ERRO AO BUSCAR EMPRÉSTIMOS:",
            error
        );

        return NextResponse.json(
            {
                erro: "Não foi possível buscar os empréstimos.",
            },
            {
                status: 500,
            }
        );
    }
}