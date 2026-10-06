import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type Params = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(request: Request, { params }: Params) {
    try {
        const { id } = await params;

        const result = await db.query(
            `
                WITH equipamentos AS (
                    SELECT
                        en.emprestimo_id,
                        n.id,
                        n.numero
                    FROM emprestimo_notebooks en
                    JOIN notebooks n
                        ON n.id = en.notebook_id

                    UNION ALL

                    SELECT
                        ec.emprestimo_id,
                        c.id,
                        c.numero
                    FROM emprestimo_celulares ec
                    JOIN celulares c
                        ON c.id = ec.celular_id
                )

                SELECT
                    e.id,
                    e.professor,
                    e.data_emprestimo,
                    e.tipo_emprestimo,

                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'id', eq.id,
                            'numero', eq.numero
                        )
                        ORDER BY eq.id
                    ) AS equipamentos

                FROM emprestimos e

                JOIN equipamentos eq
                    ON eq.emprestimo_id = e.id

                WHERE e.id = $1

                GROUP BY
                    e.id,
                    e.professor,
                    e.data_emprestimo,
                    e.tipo_emprestimo;
            `,
            [id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                {
                    erro: "Empréstimo não encontrado.",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json(result.rows[0]);

    } catch (error) {
        console.error(
            "ERRO AO BUSCAR EMPRÉSTIMO:",
            error
        );

        return NextResponse.json(
            {
                erro: "Não foi possível buscar o empréstimo.",
            },
            {
                status: 500,
            }
        );
    }
}

export async function PATCH(request: Request, { params }: Params) {
    try {
        const { id } = await params;

        const client = await db.connect();

        try {
            await client.query("BEGIN");

            const emprestimoResult = await client.query(
                `
                    SELECT tipo_emprestimo
                    FROM emprestimos
                    WHERE id = $1;
                `,
                [id]
            );

            if (emprestimoResult.rowCount === 0) {
                await client.query("ROLLBACK");

                return NextResponse.json(
                    {
                        erro: "Este empréstimo não existe.",
                    },
                    {
                        status: 404,
                    }
                );
            }

            const tipoEmprestimo =
                emprestimoResult.rows[0].tipo_emprestimo;

            let result;

            if (tipoEmprestimo === "notebook") {
                result = await client.query(
                    `
                        UPDATE emprestimo_notebooks
                        SET devolvido_em = NOW()
                        WHERE emprestimo_id = $1
                          AND devolvido_em IS NULL
                        RETURNING id;
                    `,
                    [id]
                );
            } else {
                result = await client.query(
                    `
                        UPDATE emprestimo_celulares
                        SET devolvido_em = NOW()
                        WHERE emprestimo_id = $1
                          AND devolvido_em IS NULL
                        RETURNING id;
                    `,
                    [id]
                );
            }

            if (result.rowCount === 0) {
                await client.query("ROLLBACK");

                return NextResponse.json(
                    {
                        erro: "Este empréstimo já foi devolvido.",
                    },
                    {
                        status: 404,
                    }
                );
            }

            await client.query("COMMIT");

            return NextResponse.json({
                sucesso: true,
                mensagem: "Empréstimo devolvido com sucesso.",
            });

        } catch (error) {
            await client.query("ROLLBACK");
            throw error;

        } finally {
            client.release();
        }

    } catch (error) {
        console.error(
            "ERRO AO DEVOLVER EMPRÉSTIMO:",
            error
        );

        return NextResponse.json(
            {
                erro: "Não foi possível registrar a devolução.",
            },
            {
                status: 500,
            }
        );
    }
}