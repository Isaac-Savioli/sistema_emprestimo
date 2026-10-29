import Link from "next/link";
import {HandCoins, ClipboardList} from "lucide-react";

export default function Inicio() {
  return (
      <main>
        <section className="hero" aria-labelledby="titulo-principal">
          <div className="container">
            <h2 id="titulo-principal">Sistema de Empréstimos</h2>

            <p>
              O que você deseja fazer? Escolha uma das opções abaixo para prosseguir.
            </p>

            <div className="actions">
              <article className="action-card">
                <div className="action-card-header">
                  <HandCoins className="action-icon" size={40} />

                  <h2>Emprestar</h2>
                </div>

                <p>
                  Registre um novo empréstimo informando o nome do professor,
                  a data e os dispositivos utilizados.
                </p>

                <Link href="/emprestar" className="action-button">
                  Fazer empréstimo
                </Link>
              </article>

              <article className="action-card">
                <div className="action-card-header">
                  <ClipboardList className="action-icon" size={38} />

                  <h2>Devolver empréstimos</h2>
                </div>

                <p>
                  Registre a devolução dos dispositivos emprestados e atualize o status dos empréstimos.
                </p>

                <Link href="/emprestimos" className="action-button">
                  Devolver empréstimos
                </Link>
              </article>
            </div>
          </div>
        </section>
      </main>
  );
}
