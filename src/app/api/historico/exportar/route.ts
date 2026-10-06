import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { db } from "@/lib/db";

function formatarData(data: string | Date) {
    const dataObjeto = new Date(data);

    return dataObjeto.toLocaleDateString("pt-BR");
}

function formatarDataHora(data: string | Date) {
    const dataObjeto = new Date(data);

    return dataObjeto.toLocaleString("pt-BR");
}

export async function GET() {
    try {
        const result = await db.query(`
            WITH equipamentos AS (
                SELECT
                    en.emprestimo_id,
                    n.id AS equipamento_id,
                    n.numero,
                    'notebook' AS tipo,
                    en.devolvido_em
                FROM emprestimo_notebooks en

                         JOIN notebooks n
                              ON n.id = en.notebook_id

                UNION ALL

                SELECT
                    ec.emprestimo_id,
                    c.id AS equipamento_id,
                    c.numero,
                    'celular' AS tipo,
                    ec.devolvido_em
                FROM emprestimo_celulares ec

                         JOIN celulares c
                              ON c.id = ec.celular_id
            )

            SELECT
                e.id AS emprestimo_id,
                e.professor,
                e.data_emprestimo,
                eq.tipo,
                eq.numero AS equipamento,
                CASE
                    WHEN eq.devolvido_em IS NULL
                        THEN 'Em andamento'
                    ELSE 'Devolvido'
                    END AS status,
                eq.devolvido_em

            FROM emprestimos e

                     JOIN equipamentos eq
                          ON e.id = eq.emprestimo_id

            ORDER BY
                e.id DESC,
                eq.equipamento_id;
        `);

        const dados = result.rows.map((item) => ({
            "ID Empréstimo": item.emprestimo_id,
            "Professor": item.professor,
            "Data do empréstimo": formatarData(
                item.data_emprestimo
            ),
            "Tipo": item.tipo === "notebook"
                ? "Notebook"
                : "Celular",
            "Equipamento": item.equipamento,
            "Status": item.status,
            "Data da devolução": item.devolvido_em
                ? formatarDataHora(item.devolvido_em)
                : "",
        }));

        const planilha = XLSX.utils.json_to_sheet(dados);

        planilha["!cols"] = [
            { wch: 15 },
            { wch: 25 },
            { wch: 22 },
            { wch: 12 },
            { wch: 15 },
            { wch: 18 },
            { wch: 22 },
        ];

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            planilha,
            "Histórico"
        );

        const arquivo = XLSX.write(workbook, {
            type: "buffer",
            bookType: "xlsx",
        });

        return new NextResponse(arquivo, {
            status: 200,
            headers: {
                "Content-Type":
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

                "Content-Disposition":
                    'attachment; filename="historico-emprestimos.xlsx"',
            },
        });

    } catch (error) {
        console.error(
            "ERRO AO EXPORTAR HISTÓRICO:",
            error
        );

        return NextResponse.json(
            {
                erro: "Não foi possível gerar a planilha."
            },
            {
                status: 500
            }
        );
    }
}