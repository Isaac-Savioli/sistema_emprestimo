import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema de Empréstimos",
  description: "Sistema para gerenciamento de empréstimos de notebooks",
};

//navigation links
const navLinks = [
  {label: "Início", href: "/" },
  {label: "Emprestimos", href: "/emprestimos"},
  {label: "Emprestar", href: "/emprestar"},
];

export default function RootLayout({ children }: Readonly <{children: React.ReactNode;}>) {
  return (
      <html lang="pt-br">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
      <header>
        <nav>
          <a href="/">Sistema de Empréstimo</a>

          <ul>
            {navLinks.map((items) => (
                <li key={items.href}>
                  <Link href={items.href}>{items.label}</Link>
                </li>
            ))}
          </ul>
        </nav>
      </header>

      {children}

      <footer>
        Desenvolvido por Isaac Savioli
      </footer>
      </body>
      </html>
  );
}
