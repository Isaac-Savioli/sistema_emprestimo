"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Loading from "@/components/Loading";


type Notebook = {
    id: number;
    numero: string;
};

type Emprestimo = {
    id: number;
    professor: string;
    data_emprestimo: string;
    notebooks: Notebook[];
};

function formatarData(data: string) {
    const dataParte = data.split("T")[0];

    const [ano, mes, dia] = dataParte.split("-");

    return `${dia}/${mes}/${ano}`;
}
//Função para devolução de empréstimo

export default function EmprestimoDetalhes() {
    const params = useParams();
    const router = useRouter();

    const [emprestimo, setEmprestimo] = useState<Emprestimo | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
    const [sucesso, setSucesso] = useState(false);
    const [devolvendo, setDevolvendo] = useState(false);
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function buscarEmprestimo() {
            try {
                const response = await fetch(
                    `/api/emprestimos/${params.id}`
                );

                const dados = await response.json();

                if (!response.ok) {
                    throw new Error(
                        dados.erro || "Empréstimo não encontrado."
                    );
                }

                setEmprestimo(dados);

            } catch (error) {
                console.error(
                    "Erro ao buscar empréstimo:",
                    error
                );

                setErro(
                    error instanceof Error
                        ? error.message
                        : "Não foi possível carregar o empréstimo."
                );

            } finally {
                setCarregando(false);
            }
        }

        buscarEmprestimo();
    }, [params.id]);

    function abrirConfirmacao() {
        setMostrarConfirmacao(true);
    }

    async function devolverEmprestimo() {

        try {
            setDevolvendo(true);

            const response = await fetch(
                `/api/emprestimos/${params.id}`,
                {
                    method: "PATCH",
                }
            );

            const dados = await response.json();

            if (!response.ok) {
                throw new Error(
                    dados.erro || "Não foi possível registrar a devolução."
                );
            }

            setMostrarConfirmacao(false);
            setDevolvendo(false);
            setSucesso(true);

            setTimeout(() => {
                router.push("/emprestimos");
            }, 2000);

        } catch (error) {
            console.error(
                "Erro ao devolver empréstimo:",
                error
            );

            setErro(
                error instanceof Error
                    ? error.message
                    : "Não foi possível registrar a devolução."
            );

        } finally {
            setDevolvendo(false);
        }
    }


    if (carregando) {
        return (
            <main className="loan-details-page loading-page">
                <Loading mensagem="Carregamdo empréstimos..."/>
            </main>
        );
    }

    if (erro || !emprestimo) {
        return (
            <main className="loan-details-page">
                <div className="loans-error">
                    {erro || "Empréstimo não encontrado."}
                </div>
            </main>
        );
    }

    return (

        <main className="loan-details-page">
            <section className="loan-details-container">

                <button
                    type="button"
                    className="back-button"
                    onClick={() => router.push("/emprestimos")}
                >
                    <ArrowLeft size={18} />
                    <span>Voltar para empréstimos</span>
                </button>

                <div className="loan-details-card">

                    <div className="loan-details-header">
                        <span>Empréstimo #{emprestimo.id}</span>

                        <h1>{emprestimo.professor}</h1>
                    </div>

                    <div className="loan-details-info">
                        <div>
                            <span className="info-label">
                                Data do empréstimo
                            </span>

                            <strong>
                                {formatarData(emprestimo.data_emprestimo)}
                            </strong>
                        </div>

                        <div>
                            <span className="info-label">
                                Notebooks
                            </span>

                            <strong>
                                {emprestimo.notebooks.length}
                            </strong>
                        </div>
                    </div>

                    <div className="loan-details-notebooks">
                        <h2>Notebooks emprestados</h2>

                        <div className="notebooks-detail-grid">
                            {emprestimo.notebooks.map((notebook) => (
                                <div
                                    key={notebook.id}
                                    className="notebook-detail-card"
                                >
                                    Notebook {notebook.numero}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="loan-details-actions">
                        <button
                            type="button"
                            className="devolver-button"
                            onClick={abrirConfirmacao}
                            disabled={devolvendo}
                        >
                            Devolver
                        </button>
                    </div>

                </div>
            </section>
            {mostrarConfirmacao && (
                <div className="confirmation-overlay">
                    <div
                        className="confirmation-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="confirmation-title"
                    >
                        <h2 id="confirmation-title">
                            Confirmar devolução
                        </h2>

                        <p>
                            Tem certeza que deseja registrar a devolução
                            deste empréstimo?
                        </p>

                        <div className="confirmation-actions">
                            <button
                                type="button"
                                className="confirmation-cancel"
                                onClick={() => setMostrarConfirmacao(false)}
                                disabled={devolvendo}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="devolver-button"
                                onClick={devolverEmprestimo}
                                disabled={devolvendo}
                            >
                                {devolvendo
                                    ? "Registrando..."
                                    : "Confirmar devolução"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {devolvendo && (
                <div className="loading-overlay">
                    <div className="loading-modal">
                        <Loading mensagem="Registrando devolução..." />
                    </div>
                </div>
            )}

            {sucesso && (
                <div className="loading-overlay">
                    <div className="success-modal">
                        <div className="success-icon">✓</div>

                        <h2>Devolução registrada!</h2>

                        <p>
                            Retornando para a página de empréstimos.
                        </p>
                    </div>
                </div>
            )}
        </main>
    );
}