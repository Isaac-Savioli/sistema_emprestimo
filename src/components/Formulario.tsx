import React from 'react'
import Link from 'next/link';

const notebooks = [
    { id: 1, numero: "01", disponivel: true },
    { id: 2, numero: "02", disponivel: true },
    { id: 3, numero: "03", disponivel: false },
    { id: 4, numero: "04", disponivel: true },
    { id: 5, numero: "05", disponivel: true },
    { id: 6, numero: "06", disponivel: false },
    { id: 7, numero: "07", disponivel: true },
    { id: 8, numero: "08", disponivel: true },
    { id: 9, numero: "09", disponivel: false },
    { id: 10, numero: "10", disponivel: true },
    { id: 11, numero: "11", disponivel: true },
    { id: 12, numero: "12", disponivel: true },
];

const Formulario = () => {
    return (
        <main className="loan-page">
            <section className="loan-container" aria-labelledby="titulo-emprestimo">
                <div className="loan-header">
                    <h1 id="titulo-emprestimo">Registrar empréstimo</h1>

                    <p>
                        Preencha os dados abaixo e selecione os notebooks que serão
                        utilizados.
                    </p>
                </div>

                <form className="loan-form">
                    <div className="form-group">
                        <label htmlFor="professor">Nome do professor</label>

                        <input
                            type="text"
                            id="professor"
                            name="professor"
                            placeholder="Digite o nome do professor"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="data">Data do empréstimo</label>

                        <input
                            type="date"
                            id="data"
                            name="data"
                            required
                        />
                    </div>

                    <fieldset className="notebooks-fieldset">
                        <legend>Notebooks</legend>

                        <p className="fieldset-description">
                            Selecione os notebooks disponíveis para este empréstimo.
                        </p>

                        <div className="notebooks-grid">
                            {notebooks.map((notebook) => (
                                <label
                                    key={notebook.id}
                                    className={`notebook-card ${
                                        !notebook.disponivel ? "unavailable" : ""
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        name="notebooks"
                                        value={notebook.id}
                                        disabled={!notebook.disponivel}
                                    />

                                    <span className="notebook-number">
                    Notebook {notebook.numero}
                  </span>

                                    <span className="notebook-status">
                    {notebook.disponivel ? "Disponível" : "Emprestado"}
                  </span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <div className="form-actions">
                        <Link href="/" className="cancel-button">
                            Cancelar
                        </Link>

                        <button type="submit" className="submit-button">
                            Registrar empréstimo
                        </button>
                    </div>
                </form>
            </section>
        </main>
    )
}
export default Formulario
