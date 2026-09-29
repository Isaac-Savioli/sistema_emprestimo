import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const { professor, data, notebooks } = body;

        if (!professor || !data || !Array.isArray(notebooks)) {
            return NextResponse.json(
                {
                    erro: "Dados do empréstimo inválidos.",
                },
                { status: 400 }
            );
        }

        if (notebooks.length === 0) {
            return NextResponse.json(
                {
                    erro: "Selecione pelo menos um notebook.",
                },
                { status: 400 }
            );
        }

        const client = await db.connect();

        try {
            await client.query("BEGIN");

            const emprestimoResult = await client.query(
                `
        INSERT INTO emprestimos (professor, data_emprestimo)
        VALUES ($1, $2)
        RETURNING id
        `,
                [professor, data]
            );

            const emprestimoId = emprestimoResult.rows[0].id;

            for (const notebookId of notebooks) {
                await client.query(
                    `
          INSERT INTO emprestimo_notebooks
            (emprestimo_id, notebook_id)
          VALUES
            ($1, $2)
          `,
                    [emprestimoId, notebookId]
                );
            }

            await client.query("COMMIT");

            return NextResponse.json(
                {
                    sucesso: true,
                    emprestimoId,
                },
                { status: 201 }
            );
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("ERRO AO REGISTRAR EMPRÉSTIMO:", error);

        return NextResponse.json(
            {
                erro: "Não foi possível registrar o empréstimo.",
            },
            { status: 500 }
        );
    }
}