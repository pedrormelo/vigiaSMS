import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white text-center px-6">
            {/* Logo + Texto */}
            <div className="mb-6 flex items-center justify-center gap-3">
                {/* VigiaSUS */}
                <h1 className="text-2xl text-blue-700">
                    Vigia<span className="font-extrabold">SUS</span>
                </h1>

                {/* Logo Prefeitura */}
                <Image
                    src="/logos/logo-jaboatao.png"
                    alt="Prefeitura de Jaboatão"
                    width={180}
                    height={60}
                    className="h-12 w-auto"
                />
            </div>

            {/* Código de erro */}
            <h1 className="text-7xl font-extrabold text-blue-700 drop-shadow-sm">
                404
            </h1>

            {/* Mensagem */}
            <h2 className="mt-4 text-2xl font-bold text-gray-800">
                Página não encontrada
            </h2>
            <p className="mt-2 text-gray-600 max-w-md">
                Opa! Parece que você tentou acessar uma página que não existe no{" "}
                <span className="text-blue-700 font-semibold">VigiaSUS</span>.
                Verifique o endereço ou volte para a página inicial.
            </p>

            {/* Botão voltar */}
            <div className="mt-6">
                <Link
                    href="/"
                    className="px-6 py-3 rounded-2xl bg-blue-700 text-white font-semibold shadow hover:bg-blue-800 transition"
                >
                    Voltar para o início
                </Link>
            </div>
        </div>
    );
}
