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
            SELECT
                e.id,
                e.professor,
                e.data_emprestimo,
                n.id AS notebook_id,
                n.numero AS notebook,
                en.devolvido_em
            FROM emprestimos e
            JOIN emprestimo_notebooks en
                ON e.id = en.emprestimo_id
            JOIN notebooks n
                ON n.id = en.notebook_id
            WHERE e.id = $1
              AND en.devolvido_em IS NULL
            ORDER BY n.numero;
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                {
                    erro: "Empréstimo não encontrado.",
                },
                { status: 404 }
            );
        }

        const primeiro = result.rows[0];

        const emprestimo = {
            id: primeiro.id,
            professor: primeiro.professor,
            data_emprestimo: primeiro.data_emprestimo,
            notebooks: result.rows.map((row) => ({
                id: row.notebook_id,
                numero: row.notebook,
            })),
        };

        return NextResponse.json(emprestimo);

    } catch (error) {
        console.error(
            "ERRO AO BUSCAR EMPRÉSTIMO:",
            error
        );

        return NextResponse.json(
            {
                erro: "Não foi possível buscar o empréstimo.",
            },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request, { params }: Params) {
    try {
        const { id } = await params;

        const client = await db.connect();

        try {
            await client.query("BEGIN");

            const result = await client.query(
                `
                UPDATE emprestimo_notebooks
                SET devolvido_em = NOW()
                WHERE emprestimo_id = $1
                  AND devolvido_em IS NULL
                RETURNING id;
                `,
                [id]
            );

            if (result.rowCount === 0) {
                await client.query("ROLLBACK");

                return NextResponse.json(
                    {
                        erro: "Este empréstimo já foi devolvido ou não existe.",
                    },
                    { status: 404 }
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
            { status: 500 }
        );
    }
}