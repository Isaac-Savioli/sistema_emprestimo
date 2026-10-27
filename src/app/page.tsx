import Link from "next/link";
import {HandCoins, ClipboardList} from "lucide-react";

export default function Inicio() {
  return (
      <main>
        <section className="hero" aria-labelledby="titulo-principal">
          <div className="container">
            <h2 id="titulo-principal">Sistema de Empréstimos</h2>

            <p>
              O que você deseja fazer?
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

                  <h2>Ver empréstimos</h2>
                </div>

                <p>
                  Consulte os empréstimos registrados e acompanhe
                  os dispositivos que estão emprestados.
                </p>

                <Link href="/emprestimos" className="action-button">
                  Ver empréstimos
                </Link>
              </article>
            </div>
          </div>
        </section>
      </main>
  );
}
