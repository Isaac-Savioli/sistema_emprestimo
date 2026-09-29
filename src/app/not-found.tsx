import React from 'react'

const NotFound = () => {
    return (
        <main className="h-screen overflow-hidden flex flex-col items-center justify-center bg-gray-100 text-center px-6">
            <h1 className="text-8xl font-bold text-blue-600">
                404
            </h1>

            <h2 className="mt-4 text-5xl font-semibold text-gray-800">
                Página não encontrada
            </h2>

            <p className="mt-3 max-w-md text-gray-600">
                A página que você está procurando não existe ou foi movida.
            </p>

            <a
                href="/"
                className="not-found-button"
            >
                Voltar para o início
            </a>
        </main>
    )
}
export default NotFound
