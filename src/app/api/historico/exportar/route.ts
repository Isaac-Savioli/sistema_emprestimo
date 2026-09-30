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
            SELECT
                e.id AS emprestimo_id,
                e.professor,
                e.data_emprestimo,
                n.numero AS notebook,
                CASE
                    WHEN en.devolvido_em IS NULL
                        THEN 'Em andamento'
                    ELSE 'Devolvido'
                    END AS status,
                en.devolvido_em
            FROM emprestimos e
                     JOIN emprestimo_notebooks en
                          ON e.id = en.emprestimo_id
                     JOIN notebooks n
                          ON n.id = en.notebook_id
            ORDER BY e.id DESC, n.id;
        `);

        const dados = result.rows.map((item) => ({
            "ID Empréstimo": item.emprestimo_id,
            "Professor": item.professor,
            "Data do empréstimo": formatarData(item.data_emprestimo),
            "Notebook": item.notebook,
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