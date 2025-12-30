import Image from "next/image";
import { unstable_noStore as noStore } from "next/cache";

export default function Footer() {
    noStore();

    const recifeFormatter = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Recife",
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });

    const recifeLongFormatter = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Recife",
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    const recifeDateTime = recifeFormatter.format(new Date());
    const recifeDateLong = recifeLongFormatter.format(new Date());

    return (
        <footer className="bg-gradient-to-r from-white via-blue-50 to-white border-t border-blue-100">
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-700" aria-hidden />

            <div className="container mx-auto px-4 md:px-6 py-5 md:py-6 flex flex-col items-center">
                <div className="grid grid-cols-2 md:grid-cols-3 items-center gap-3 md:gap-4 justify-items-center md:justify-items-start">
                    <div className="hidden md:flex justify-start">
                        <Image
                            src="/logos/artefato-prefeitura1.png"
                            alt="Símbolos Jaboatão"
                            width={140}
                            height={44}
                            className="h-10 lg:h-11 w-auto opacity-90"
                        />
                    </div>

                    <div className="flex justify-center">
                        <Image
                            src="/logos/logo-jaboatao.png"
                            alt="Prefeitura de Jaboatão"
                            width={200}
                            height={60}
                            className="h-10 md:h-11 lg:h-12 w-auto drop-shadow-sm"
                        />
                    </div>

                    <div className="flex justify-center md:justify-end items-center gap-2">
                        <Image
                            src="/logos/logo-gti.png"
                            alt="GTI"
                            width={60}
                            height={48}
                            className="h-9 md:h-10 w-auto opacity-95 ml-20"
                        />
                    </div>
                </div>

                <div className="mt-4 md:mt-6 rounded-2xl bg-white/70 border border-blue-100 shadow-sm backdrop-blur">
                    <div className="px-4 md:px-6 py-3 md:py-4 text-center text-[11px] md:text-sm leading-relaxed text-gray-700">
                        <p className="text-blue-800 font-semibold tracking-wide">SIGE – Sistema Integrado de Gestão Estratégica em Saúde</p>
                        <p className="text-gray-600 mt-1">
                            Jaboatão dos Guararapes | Secretaria Municipal de Saúde – GTI | Av. Barreto de Menezes, S/N – Prazeres – PE | CEP: 54.330-900 | CNPJ: 03.904.395/0001-45
                        </p>
                        <p className="text-gray-500 text-[10px] md:text-xs mt-1">Jaboatão dos Guararapes, {recifeDateLong} · {recifeDateTime} · Versão 0.1</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
