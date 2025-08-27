import Image from "next/image";

export default function Footer() {
    return (
        <footer className="bg-white border-t border-blue-600">
            <div className="container mx-auto grid grid-cols-3 items-center py-4 px-4">
                {/* Esquerda */}
                <div className="flex justify-start">
                    <Image
                        src="/logos/artefato-prefeitura1.png"
                        alt="Símbolos Jaboatão"
                        width={120}
                        height={40}
                        className="h-10 w-auto"
                    />
                </div>

                {/* Centro */}
                <div className="flex justify-center">
                    <Image
                        src="/logos/logo-jaboatao.png"
                        alt="Prefeitura de Jaboatão"
                        width={180}
                        height={50}
                        className="h-12 w-auto"
                    />
                </div>

                {/* Direita */}
                <div className="flex justify-end items-center gap-2">
                    <Image
                        src="/logos/logo-gti.png"
                        alt="GTI"
                        width={50}
                        height={40}
                        className="h-10 w-auto"
                    />
                    {/* <Image
                        src="/logos/qrcode.png"
                        alt="QR Code"
                        width={40}
                        height={40}
                        className="h-10 w-10"
                    /> */}
                </div>
            </div>

            {/* Texto institucional */}
            <div className="border-t border-blue-600 py-3 px-4 text-center text-xs md:text-sm text-gray-700">
                <p>
                    <span className="font-bold text-blue-700">VigiaSUS</span>
                    <span className="text-blue-700">
                        {" "}
                        – Sistema de Contextos Internos –{" "}
                        <span className="font-bold">GTI </span>
                        Secretaria Municipal de Saúde de Jaboatão dos Guararapes. Av.
                        Barreto de Menezes, S/N – Prazeres – Jaboatão dos Guararapes – PE.
                        CEP: 54.330-900 – CNPJ: 03.904.395/0001-45 – Julho de 2025 – Ver:
                        0.1.0
                    </span>
                </p>
            </div>
        </footer>
    );
}
