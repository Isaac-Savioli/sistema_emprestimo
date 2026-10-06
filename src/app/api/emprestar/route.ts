import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const {
            professor,
            data,
            tipo,
            notebooks,
            celulares,
        } = body;

        if (
            !professor ||
            !data ||
            !["notebook", "celular"].includes(tipo)
        ) {
            return NextResponse.json(
                {
                    erro: "Dados do empréstimo inválidos.",
                },
                {
                    status: 400,
                }
            );
        }

        const equipamentos =
            tipo === "notebook"
                ? notebooks
                : celulares;

        if (
            !Array.isArray(equipamentos) ||
            equipamentos.length === 0
        ) {
            return NextResponse.json(
                {
                    erro: `Selecione pelo menos um ${
                        tipo === "notebook"
                            ? "notebook"
                            : "celular"
                    }.`,
                },
                {
                    status: 400,
                }
            );
        }

        const client = await db.connect();

        try {
            await client.query("BEGIN");

            const emprestimoResult = await client.query(
                `
                    INSERT INTO emprestimos
                    (
                        professor,
                        data_emprestimo,
                        tipo_emprestimo
                    )
                    VALUES
                        ($1, $2, $3)
                        RETURNING id;
                `,
                [professor, data, tipo]
            );

            const emprestimoId =
                emprestimoResult.rows[0].id;

            if (tipo === "notebook") {
                await client.query(
                    `
                        INSERT INTO emprestimo_notebooks
                        (
                            emprestimo_id,
                            notebook_id
                        )
                        SELECT
                            $1,
                            UNNEST($2::INTEGER[]);
                    `,
                    [emprestimoId, equipamentos]
                );
            } else {
                await client.query(
                    `
                        INSERT INTO emprestimo_celulares
                        (
                            emprestimo_id,
                            celular_id
                        )
                        SELECT
                            $1,
                            UNNEST($2::INTEGER[]);
                    `,
                    [emprestimoId, equipamentos]
                );
            }

            await client.query("COMMIT");

            return NextResponse.json(
                {
                    sucesso: true,
                    emprestimoId,
                },
                {
                    status: 201,
                }
            );

        } catch (error) {
            await client.query("ROLLBACK");
            throw error;

        } finally {
            client.release();
        }

    } catch (error) {
        console.error(
            "ERRO AO REGISTRAR EMPRÉSTIMO:",
            error
        );

        return NextResponse.json(
            {
                erro: "Não foi possível registrar o empréstimo.",
            },
            {
                status: 500,
            }
        );
    }
}