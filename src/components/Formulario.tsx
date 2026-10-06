"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Loading from "@/components/Loading";

type Notebook = {
    id: number;
    numero: string;
    disponivel: boolean;
};
type Celular = {
    id: number;
    numero: string;
    disponivel: boolean;
}

const Formulario = () => {
    const router = useRouter();

    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    const [professor, setProfessor] = useState("");
    const [data, setData] = useState(obterDataAtual());
    const [equipamentosSelecionados, setEquipamentosSelecionados] = useState<number[]>([]);
    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState<"erro" | "sucesso" | "">("");
    const [registrando, setRegistrando] = useState(false);
    const [sucesso, setSucesso] = useState(false);
    const [tipoEmprestimo, setTipoEmprestimo] = useState<"notebook" | "celular">("notebook");
    const [celulares, setCelulares] = useState<Celular[]>([]);

    function obterDataAtual() {
        const hoje = new Date();

        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, "0");
        const dia = String(hoje.getDate()).padStart(2, "0");

        return `${ano}-${mes}-${dia}`;
    }

    useEffect(() => {
        async function buscarEquipamentos() {
            try {
                const response = await fetch("/api/equipamentos");

                if (!response.ok) {
                    throw new Error("Erro ao buscar equipamentos");
                }

                const dados = await response.json();

                setNotebooks(dados.notebooks);
                setCelulares(dados.celulares);

            } catch (error) {
                console.error(
                    "Erro ao buscar equipamentos:",
                    error
                );

                setMensagem(
                    "Não foi possível carregar os equipamentos."
                );

                setTipoMensagem("erro");
            }
        }

        buscarEquipamentos();
    }, []);
    function selecionarEquipamento(id: number) {
        setMensagem("");
        setTipoMensagem("");

        setEquipamentosSelecionados((anteriores) => {
            if (anteriores.includes(id)) {
                return anteriores.filter(
                    (equipamentoId) => equipamentoId !== id
                );
            }

            return [...anteriores, id];
        });
    }

    function validarFormulario() {
        const nome = professor.trim();

        // Nome obrigatório
        if (!nome) {
            return "Informe o nome do professor.";
        }

        // Nome muito curto
        if (nome.length < 3) {
            return "O nome do professor deve ter pelo menos 3 caracteres.";
        }

        // Permite letras, espaços, acentos, hífen e apóstrofo
        const nomeValido = /^[A-Za-zÀ-ÿ\s'-]+$/;

        if (!nomeValido.test(nome)) {
            return "O nome do professor contém caracteres inválidos.";
        }

        // Data obrigatória
        if (!data) {
            return "Informe a data do empréstimo.";
        }

        // Verifica se a data é válida
        const dataSelecionada = new Date(`${data}T00:00:00`);

        if (Number.isNaN(dataSelecionada.getTime())) {
            return "Informe uma data válida.";
        }

        // Não permite data anterior ao dia atual
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        if (dataSelecionada < hoje) {
            return "A data do empréstimo não pode ser anterior a hoje.";
        }

        // Pelo menos um equipamento
        if (equipamentosSelecionados.length === 0) {
            return `Selecione pelo menos um ${
                tipoEmprestimo === "notebook"
                    ? "notebook"
                    : "celular"
            }.`;
        }

// Confirma que todos os selecionados continuam disponíveis
        const equipamentos =
            tipoEmprestimo === "notebook"
                ? notebooks
                : celulares;

        const algumIndisponivel = equipamentosSelecionados.some((id) => {
            const equipamento = equipamentos.find(
                (item) => item.id === id
            );

            return !equipamento || !equipamento.disponivel;
        });

        if (algumIndisponivel) {
            return `Um dos ${
                tipoEmprestimo === "notebook"
                    ? "notebooks"
                    : "celulares"
            } selecionados não está disponível.`;
        }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setMensagem("");
        setTipoMensagem("");

        const erroValidacao = validarFormulario();

        if (erroValidacao) {
            setMensagem(erroValidacao);
            setTipoMensagem("erro");
            return;
        }

        setRegistrando(true);

        try {
            const response = await fetch("/api/emprestar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    professor: professor.trim(),
                    data,
                    tipo: tipoEmprestimo,
                    ...(tipoEmprestimo === "notebook")
                    ? {
                        notebooks: equipamentosSelecionados,
                      }
                    :{
                        celulares: equipamentosSelecionados,
                        }
                }),
            });

            const resultado = await response.json();

            if (!response.ok) {
                setMensagem(
                    resultado.erro || "Não foi possível registrar o empréstimo."
                );
                setTipoMensagem("erro");
                return;
            }

            setRegistrando(false);
            setSucesso(true);

            setTimeout(() => {
                router.push("/");
            }, 3000);

        } catch (error) {
            console.error("Erro ao registrar empréstimo:", error);

            setMensagem("Não foi possível conectar ao servidor.");
            setTipoMensagem("erro");
        } finally {
            setRegistrando(false);
        }
    }
    return (
        <main className="loan-page">
            <section
                className="loan-container"
                aria-labelledby="titulo-emprestimo"
            >
                <div className="loan-header">
                    <h1 id="titulo-emprestimo">
                        Registrar empréstimo
                    </h1>

                    <p>
                        Preencha os dados abaixo e selecione os notebooks que serão
                        utilizados.
                    </p>
                </div>

                <form
                    className="loan-form"
                    onSubmit={handleSubmit}
                >
                    <div className="form-group">
                        <label htmlFor="professor">
                            Nome do Professor
                        </label>

                        <input
                            type="text"
                            id="professor"
                            name="professor"
                            placeholder="Digite o nome do Professor"
                            value={professor}
                            onChange={(event) =>
                                setProfessor(event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="data">
                            Data do empréstimo
                        </label>

                        <input
                            type="date"
                            id="data"
                            name="data"
                            value={data}
                            onChange={(event) =>
                                setData(event.target.value)
                            }
                            min={obterDataAtual()}
                            required
                        />
                    </div>

                    <div className="form-group">

                        <label>
                            Tipo de empréstimo
                        </label>

                        <div className="loan-type-options">

                            <button
                                type="button"
                                className={`loan-type-button ${
                                    tipoEmprestimo === "notebook"
                                        ? "selected"
                                        : ""
                                }`}
                                onClick={() => {
                                    setTipoEmprestimo("notebook");
                                    setEquipamentosSelecionados([]);
                                }}
                            >
                                Notebook
                            </button>

                            <button
                                type="button"
                                className={`loan-type-button ${
                                    tipoEmprestimo === "celular"
                                        ? "selected"
                                        : ""
                                }`}
                                onClick={() => {
                                    setTipoEmprestimo("celular");
                                    setEquipamentosSelecionados([]);
                                }}
                            >
                                Celular
                            </button>

                        </div>

                    </div>

                    <fieldset className="notebooks-fieldset">

                        <legend>
                            {tipoEmprestimo === "notebook"
                                ? "Notebooks"
                                : "Celulares"}
                        </legend>

                        <p className="fieldset-description">
                            {tipoEmprestimo === "notebook"
                                ? "Selecione os notebooks disponíveis para este empréstimo."
                                : "Selecione os celulares disponíveis para este empréstimo."}
                        </p>

                        <div className="notebooks-grid">

                            {tipoEmprestimo === "notebook"

                                ? notebooks.map((notebook) => (

                                    <label
                                        key={notebook.id}
                                        className={`notebook-card ${
                                            !notebook.disponivel
                                                ? "unavailable"
                                                : ""
                                        }`}
                                    >

                                        <input
                                            type="checkbox"
                                            name="equipamentos"
                                            value={notebook.id}
                                            checked={equipamentosSelecionados.includes(
                                                notebook.id
                                            )}
                                            disabled={!notebook.disponivel}
                                            onChange={() =>
                                                selecionarEquipamento(notebook.id)
                                            }
                                        />

                                        <span className="notebook-number">
                        Notebook {notebook.numero}
                    </span>

                                        <span className="notebook-status">
                        {notebook.disponivel
                            ? "Disponível"
                            : "Emprestado"}
                    </span>

                                    </label>

                                ))

                                : celulares.map((celular) => (

                                    <label
                                        key={celular.id}
                                        className={`notebook-card ${
                                            !celular.disponivel
                                                ? "unavailable"
                                                : ""
                                        }`}
                                    >

                                        <input
                                            type="checkbox"
                                            name="equipamentos"
                                            value={celular.id}
                                            checked={equipamentosSelecionados.includes(
                                                celular.id
                                            )}
                                            disabled={!celular.disponivel}
                                            onChange={() =>
                                                selecionarEquipamento(celular.id)
                                            }
                                        />

                                        <span className="notebook-number">
                        Celular {celular.numero}
                    </span>

                                        <span className="notebook-status">
                        {celular.disponivel
                            ? "Disponível"
                            : "Emprestado"}
                    </span>

                                    </label>

                                ))}

                        </div>

                    </fieldset>
                    {mensagem && (
                        <div
                            className={`form-message ${
                                tipoMensagem === "erro"
                                    ? "form-message-error"
                                    : "form-message-success"
                            }`}
                            role="alert"
                        >
        <span className="form-message-icon">
            {tipoMensagem === "erro" ? "!" : "✓"}
        </span>

                            <span>{mensagem}</span>
                        </div>
                    )}

                    <div className="form-actions">
                        <Link
                            href="/"
                            className="cancel-button"
                        >
                            Cancelar
                        </Link>

                        <button
                            type="submit"
                            className="submit-button"
                        >
                            Registrar empréstimo
                        </button>
                    </div>
                </form>
            </section>

            {registrando && (
                <div className="loading-overlay">
                    <div className="loading-modal">
                        <Loading mensagem="Registrando empréstimo..." />
                    </div>
                </div>
            )}

            {sucesso && (
                <div className="loading-overlay">
                    <div className="success-modal">
                        <div className="success-icon">
                            ✓
                        </div>

                        <h2>Empréstimo registrado!</h2>

                        <p>
                            Redirecionando para a página inicial.
                        </p>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Formulario;