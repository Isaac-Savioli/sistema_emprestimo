"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Equipamento = {
    id: number;
    numero: string;
};

type Emprestimo = {
    id: number;
    professor: string;
    data_emprestimo: string;
    tipo_emprestimo: "notebook" | "celular";
    quantidade: number;
    equipamentos: Equipamento[];
};

export default function Emprestimos() {
    const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function buscarEmprestimos() {
            try {
                const response = await fetch("/api/emprestimos");

                if (!response.ok) {
                    throw new Error("Erro ao buscar empréstimos");
                }

                const dados = await response.json();

                setEmprestimos(dados);
            } catch (error) {
                console.error("Erro ao buscar empréstimos:", error);
                setErro("Não foi possível carregar os empréstimos.");
            } finally {
                setCarregando(false);
            }
        }

        buscarEmprestimos();
    }, []);

    if (carregando) {
        return (
            <main className="loans-page">
                <section className="loans-container">
                    <p>Carregando empréstimos...</p>
                </section>
            </main>
        );
    }

    if (erro) {
        return (
            <main className="loans-page">
                <section className="loans-container">
                    <div className="loans-error">
                        {erro}
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="loans-page">
            <section className="loans-container">
                <div className="loans-header">
                    <h1>Empréstimos ativos</h1>
                    <p>
                        Consulte os equipamentos que estão atualmente emprestados.
                    </p>
                </div>

                {emprestimos.length === 0 ? (
                    <div className="empty-loans">
                        <h2>Nenhum empréstimo ativo</h2>
                        <p>
                            Não há equipamentos emprestados no momento.
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
                                    <h2>{emprestimo.professor}</h2>

                                    <div className="loan-notebooks">
                                        {emprestimo.equipamentos.map((equipamento) => (
                                            <span key={equipamento.id}>
                                                {
                                                    emprestimo.tipo_emprestimo === "notebook"
                                                    ? "notebook"
                                                    : "celular"}{" "}
                                                {equipamento.numero}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <Link
                                    href={`/emprestimos/${emprestimo.id}`}
                                    className="loan-details-button"
                                >
                                    Ver mais
                                </Link>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}