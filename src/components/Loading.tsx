type LoadingProps = {
    mensagem?: string;
};

export default function Loading({ mensagem = "Carregando..." }: LoadingProps) {
    return (
        <div className="loading-content">
            <div className="loading-spinner"></div>

            <p>{mensagem}</p>
        </div>
    );
}