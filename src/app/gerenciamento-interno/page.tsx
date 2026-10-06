"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Download, Trash2  } from "lucide-react";
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
    const [emprestimoSelecionado, setEmprestimoSelecionado] = useState<Emprestimo | null>(null);
    const [etapaExclusao, setEtapaExclusao] = useState<"confirmacao" | "detalhes" | "senha" | "sucesso" | null>(null);
    const [senha, setSenha] = useState("");
    const [excluindo, setExcluindo] = useState(false);
    const [erroExclusao, setErroExclusao] = useState("");

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

    function iniciarExclusao(emprestimo: Emprestimo) {
        setEmprestimoSelecionado(emprestimo);
        setEtapaExclusao("confirmacao");
        setSenha("");
        setErroExclusao("");
    }

    async function excluirEmprestimo() {
        if (!emprestimoSelecionado || !senha) {
            return;
        }

        setExcluindo(true);
        setErroExclusao("");

        try {
            const response = await fetch(
                `/api/historico/${emprestimoSelecionado.id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        senha,
                    }),
                }
            );

            const dados = await response.json();

            if (!response.ok) {
                setErroExclusao(
                    dados.erro ||
                    "Não foi possível excluir o empréstimo."
                );

                return;
            }

            setEmprestimos((anteriores) =>
                anteriores.filter(
                    (emprestimo) =>
                        emprestimo.id !== emprestimoSelecionado.id
                )
            );

            setEtapaExclusao("sucesso");
            setEmprestimoSelecionado(null);
            setSenha("");

        } catch (error) {
            console.error(
                "ERRO AO EXCLUIR EMPRÉSTIMO:",
                error
            );

            setErroExclusao(
                "Não foi possível conectar ao servidor."
            );

        } finally {
            setExcluindo(false);
        }
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

                                <div className="loan-actions">
                                    <Link href={`/emprestimos/${emprestimo.id}`}
                                          className="loan-details-button"
                                    >
                                        Ver detalhes
                                        <ArrowRight size={18} />
                                    </Link>

                                    <button
                                        type="button"
                                        className="delete-loan-button"
                                        onClick={() => iniciarExclusao(emprestimo)}
                                    >
                                        <Trash2 size={18} />
                                        Excluir
                                    </button>
                                </div>

                            </article>

                        ))}

                    </div>

                )}

            </section>
            {etapaExclusao === "confirmacao" && emprestimoSelecionado && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Excluir empréstimo?</h2>

                        <p>
                            Tem certeza de que deseja excluir este empréstimo?
                        </p>

                        <p className="modal-warning">
                            Essa ação é permanente e não poderá ser desfeita.
                        </p>

                        <div className="modal-actions">
                            <button
                                type="button"
                                onClick={() => {
                                    setEtapaExclusao(null);
                                    setEmprestimoSelecionado(null);
                                }}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setEtapaExclusao("detalhes");
                                }}
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {etapaExclusao === "detalhes" && emprestimoSelecionado && (
                <div className="modal-overlay">
                    <div className="modal-content modal-details">
                        <h2>Detalhes do empréstimo</h2>

                        <div className="loan-detail-info">
                            <div>
                                <span>Professor</span>
                                <strong>
                                    {emprestimoSelecionado.professor}
                                </strong>
                            </div>

                            <div>
                                <span>Data do empréstimo</span>
                                <strong>
                                    {formatarData(emprestimoSelecionado.data_emprestimo)}
                                </strong>
                            </div>

                            <div>
                                <span>Tipo</span>
                                <strong>
                                    {emprestimoSelecionado.tipo_emprestimo ===
                                    "notebook"
                                        ? "Notebook"
                                        : "Celular"}
                                </strong>
                            </div>

                            <div>
                                <span>Quantidade</span>
                                <strong>
                                    {emprestimoSelecionado.equipamentos.length}
                                </strong>
                            </div>
                        </div>

                        <div className="loan-detail-equipment">
                            <span>Equipamentos</span>

                            <div className="equipment-list">
                                {emprestimoSelecionado.equipamentos.map(
                                    (equipamento) => (
                                        <div
                                            key={equipamento.id}
                                            className="equipment-item"
                                        >
                                            {emprestimoSelecionado.tipo_emprestimo ===
                                            "notebook"
                                                ? "Notebook"
                                                : "Celular"}{" "}
                                            {equipamento.numero}
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        <div className="modal-warning">
                            <strong>Atenção:</strong> esta ação é permanente.
                            O empréstimo e seus registros de equipamentos serão
                            excluídos definitivamente.
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                onClick={() => {
                                    setEtapaExclusao("confirmacao");
                                }}
                            >
                                Voltar
                            </button>

                            <button
                                type="button"
                                className="delete-confirm-button"
                                onClick={() => {
                                    setEtapaExclusao("senha");
                                }}
                            >
                                Confirmar exclusão
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {etapaExclusao === "senha" && emprestimoSelecionado && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Confirmar exclusão</h2>

                        <p>
                            Para excluir este empréstimo, informe a
                            senha administrativa.
                        </p>

                        <div className="password-field">
                            <label htmlFor="senha-exclusao">
                                Senha
                            </label>

                            <input
                                id="senha-exclusao"
                                type="password"
                                value={senha}
                                onChange={(event) => {
                                    setSenha(event.target.value);
                                    setErroExclusao("");
                                }}
                                placeholder="Digite a senha"
                                disabled={excluindo}
                            />
                        </div>

                        {erroExclusao && (
                            <p className="delete-error">
                                {erroExclusao}
                            </p>
                        )}

                        <div className="modal-actions">
                            <button
                                type="button"
                                onClick={() => {
                                    setEtapaExclusao("detalhes");
                                    setSenha("");
                                    setErroExclusao("");
                                }}
                                disabled={excluindo}
                            >
                                Voltar
                            </button>

                            <button
                                type="button"
                                className="delete-confirm-button"
                                onClick={excluirEmprestimo}
                                disabled={excluindo || !senha}
                            >
                                {excluindo
                                    ? "Excluindo..."
                                    : "Excluir empréstimo"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {etapaExclusao === "sucesso" && (
                <div className="modal-overlay">
                    <div className="modal-content modal-success">
                        <div className="success-icon">
                            ✓
                        </div>

                        <h2>Exclusão realizada</h2>

                        <p>
                            O empréstimo foi excluído com sucesso.
                        </p>

                            <div
                                className="leave-confirmation"
                                onClick={() => {
                                    setEtapaExclusao(null);
                                }}
                            >
                                OK
                            </div>
                    </div>
                </div>
            )}
        </main>
    );
}