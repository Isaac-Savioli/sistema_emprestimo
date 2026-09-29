import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const result = await db.query(`
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
    `);

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("ERRO AO BUSCAR NOTEBOOKS:", error);

        return NextResponse.json(
            {
                erro: "Não foi possível buscar os notebooks.",
            },
            { status: 500 }
        );
    }
}