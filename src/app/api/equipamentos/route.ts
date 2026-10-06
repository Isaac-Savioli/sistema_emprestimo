import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    const inicio = performance.now();

    try {
        const inicioBanco = performance.now();

        const [notebooksResult, celularesResult] =
            await Promise.all([
                db.query(`
                    SELECT
                        n.id,
                        n.numero,
                        CASE
                            WHEN en.notebook_id IS NULL THEN true
                            ELSE false
                        END AS disponivel
                    FROM notebooks n
                    LEFT JOIN emprestimo_notebooks en
                        ON n.id = en.notebook_id
                        AND en.devolvido_em IS NULL
                    ORDER BY n.id;
                `),

                db.query(`
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
                `),
            ]);

        console.log(
            `Tempo do banco: ${(performance.now() - inicioBanco).toFixed(2)}ms`
        );

        console.log(
            `Tempo total da API: ${(performance.now() - inicio).toFixed(2)}ms`
        );

        console.log(
            `Tempo da consulta de equipamentos: ${(performance.now() - inicio).toFixed(2)}ms`
        );

        return NextResponse.json({
            notebooks: notebooksResult.rows,
            celulares: celularesResult.rows,
        });

    } catch (error) {
        console.error(
            "ERRO AO BUSCAR EQUIPAMENTOS:",
            error
        );

        return NextResponse.json(
            {
                erro: "Não foi possível carregar os equipamentos.",
            },
            {
                status: 500,
            }
        );
    }
}