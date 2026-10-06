"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Download  } from "lucide-react";
import Loading from "@/components/Loading";

type Equipamento = {
    id: number;
    numero: string;
};

type Emprestimo = {
    id: number;
    professor: string;
    data_emprestimo: string;
    tipo_emprestimo: "notebook" | "celular";
    devolvido: boolean;
    devolvido_em: string | null;
    equipamentos: Equipamento[];
};

function formatarData(data: string) {
    const dataParte = data.split("T")[0];
    const [ano, mes, dia] = dataParte.split("-");

    return `${dia}/${mes}/${ano}`;
}

function formatarDataHora(data: string) {
    const dataObjeto = new Date(data);

    return dataObjeto.toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    });
}

export default function GerenciamentoInterno() {

    function exportarPlanilha() {
        window.location.href = "/api/historico/exportar";
    }

    const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function buscarHistorico() {
            try {
                const response = await fetch("/api/historico");

                const dados = await response.json();

                if (!response.ok) {
                    throw new Error(
                        dados.erro ||
                        "Não foi possível carregar o histórico."
                    );
                }

                setEmprestimos(dados);

            } catch (error) {
                console.error(
                    "Erro ao buscar histórico:",
                    error
                );

                setErro(
                    error instanceof Error
                        ? error.message
                        : "Não foi possível carregar o histórico."
                );

            } finally {
                setCarregando(false);
            }
        }

        buscarHistorico();
    }, []);

    if (carregando) {
        return (
            <main className="loans-page loading-page">
                <Loading mensagem="Carregando histórico..." />
            </main>
        );
    }

    if (erro) {
        return (
            <main className="loans-page">
                <div className="loans-container">
                    <div className="loans-error">
                        {erro}
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="loans-page">

            <section className="loans-container">

                <div className="loans-header">
                    <div>
                        <h1>Histórico de empréstimos</h1>

                        <p>
                            Consulte todos os empréstimos registrados
                            no sistema.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="export-button"
                        onClick={exportarPlanilha}
                    >
                        <Download size={18} />
                        Exportar planilha
                    </button>
                </div>
                {emprestimos.length === 0 ? (

                    <div className="empty-loans">

                        <h2>
                            Nenhum empréstimo registrado
                        </h2>

                        <p>
                            Ainda não existem registros no histórico.
                        </p>

                    </div>

                ) : (

                    <div className="loans-list">

                        {emprestimos.map((emprestimo) => (

                            <article
                                key={emprestimo.id}
                                className="loan-card"
                            >

                                <div className="loan-card-content">

                                    <div className="loan-card-top">

                                        <h2>
                                            {emprestimo.professor}
                                        </h2>

                                        <span
                                            className={
                                                emprestimo.devolvido
                                                    ? "loan-status returned"
                                                    : "loan-status active"
                                            }
                                        >
                                            {emprestimo.devolvido
                                                ? "Devolvido"
                                                : "Em andamento"}
                                        </span>

                                    </div>

                                    <p className="loan-date">
                                        Empréstimo em{" "}
                                        {formatarData(
                                            emprestimo.data_emprestimo
                                        )}
                                    </p>

                                    {emprestimo.devolvido &&
                                        emprestimo.devolvido_em && (
                                            <p className="loan-return-date">
                                                Devolvido em{" "}
                                                {formatarDataHora(
                                                    emprestimo.devolvido_em
                                                )}
                                            </p>
                                        )}

                                    <div className="loan-notebooks">

                                        {emprestimo.equipamentos.map(
                                            (equipamento) => (
                                                <span key={equipamento.id}>
                                                     {emprestimo.tipo_emprestimo === "notebook"
                                                        ? "Notebook"
                                                        : "Celular"}{" "}
                                                     {equipamento.numero}
                                                </span>
                                            )
                                        )}

                                    </div>

                                </div>

                                <Link
                                    href={`/emprestimos/${emprestimo.id}`}
                                    className="loan-details-button"
                                >
                                    Ver detalhes
                                    <ArrowRight size={18} />
                                </Link>

                            </article>

                        ))}

                    </div>

                )}

            </section>

        </main>
    );
}