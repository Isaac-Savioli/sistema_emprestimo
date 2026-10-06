import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const result = await db.query(`
            WITH equipamentos AS (
                SELECT
                    en.emprestimo_id,
                    en.id AS equipamento_emprestimo_id,
                    n.id,
                    n.numero,
                    en.devolvido_em
                FROM emprestimo_notebooks en
                         JOIN notebooks n
                              ON n.id = en.notebook_id

                UNION ALL

                SELECT
                    ec.emprestimo_id,
                    ec.id AS equipamento_emprestimo_id,
                    c.id,
                    c.numero,
                    ec.devolvido_em
                FROM emprestimo_celulares ec
                         JOIN celulares c
                              ON c.id = ec.celular_id
            )

            SELECT
                e.id,
                e.professor,
                e.data_emprestimo,
                e.tipo_emprestimo,

                CASE
                    WHEN COUNT(eq.id) FILTER (
                        WHERE eq.devolvido_em IS NULL
                    ) = 0
                    THEN true
                    ELSE false
                    END AS devolvido,

                MAX(eq.devolvido_em) AS devolvido_em,

                JSON_AGG(
                        JSON_BUILD_OBJECT(
                                'id', eq.id,
                                'numero', eq.numero
                        )
                            ORDER BY eq.id
                ) AS equipamentos

            FROM emprestimos e

                     JOIN equipamentos eq
                          ON e.id = eq.emprestimo_id

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