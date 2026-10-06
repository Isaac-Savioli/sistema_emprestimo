import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type Params = {
    params: Promise<{
        id: string;
    }>;
};

export async function DELETE(request: Request, { params }: Params) {
    try {
        const { id } = await params;

        const idNumerico = Number(id);

        if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
            return NextResponse.json(
                {
                    erro: "ID do empréstimo inválido.",
                },
                {
                    status: 400,
                }
            );
        }

        const body = await request.json();

        const { senha } = body;

        if (!senha) {
            return NextResponse.json(
                {
                    erro: "Senha não informada.",
                },
                {
                    status: 401,
                }
            );
        }

        if (senha !== process.env.SENHA_DE_EXCLUSAO) {
            return NextResponse.json(
                {
                    erro: "Senha incorreta.",
                },
                {
                    status: 401,
                }
            );
        }

        const client = await db.connect();

        try {
            await client.query("BEGIN");

            const result = await client.query(
                `
                    DELETE FROM emprestimos
                    WHERE id = $1
                    RETURNING id;
                `,
                [idNumerico]
            );

            if (result.rowCount === 0) {
                await client.query("ROLLBACK");

                return NextResponse.json(
                    {
                        erro: "Empréstimo não encontrado.",
                    },
                    {
                        status: 404,
                    }
                );
            }

            await client.query("COMMIT");

            return NextResponse.json({
                sucesso: true,
                mensagem: "Empréstimo excluído com sucesso.",
            });

        } catch (error) {
            await client.query("ROLLBACK");
            throw error;

        } finally {
            client.release();
        }

    } catch (error) {
        console.error(
            "ERRO AO EXCLUIR EMPRÉSTIMO:",
            error
        );

        return NextResponse.json(
            {
                erro: "Não foi possível excluir o empréstimo.",
            },
            {
                status: 500,
            }
        );
    }
}