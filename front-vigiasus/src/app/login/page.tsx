"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/input";
import { Button } from "@/components/ui/button";
import { showErrorToast, showSuccessToast } from "@/components/ui/Toasts";
import { authService } from "@/services/authService";
import { formatCPF } from "@/lib/utils";

export default function LoginPage() {
    const router = useRouter();
    const [cpf, setCpf] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(true);
    const [loading, setLoading] = useState(false);
    const [cpfError, setCpfError] = useState<string | null>(null);

    useEffect(() => {
        // If already logged in, redirect to home
        const user = authService.getUser();
        if (user) {
            router.replace("/");
        }
    }, [router]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cpf.trim() || !password.trim()) {
            showErrorToast("Preencha seu CPF e senha");
            return;
        }
        // Validate CPF length before attempting login (allow dev/test CPFs)
        const cpfDigits = cpf.replace(/\D/g, "");
        if (cpfDigits.length !== 11) {
            setCpfError("Informe os 11 dígitos do CPF");
            showErrorToast("CPF deve ter 11 dígitos");
            return;
        }
        setLoading(true);
        try {
            const user = await authService.login(cpf, password);
            authService.saveUser(user, remember);
            showSuccessToast(`Bem-vindo(a), ${user.name}!`);
            router.push("/");
        } catch (err) {
            //  verificação
            let errorMessage = "Falha no login";
            if (err instanceof Error) {
                errorMessage = err.message;
            }

            // a variável segura
            showErrorToast(errorMessage);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 flex items-center justify-center p-3 sm:p-6">
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 items-center">
                {/* Brand (left side) */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3 sm:gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-6xl text-white leading-tight">
                            <span className="font-semibold">Sige</span>
                            <span className="font-light">Saúde</span>
                        </h1>

                        {/* <p className="text-white/95 text-lg md:text-[0.69rem] max-w-md text-center">
                            Sistema Integrado de Gestão Estratégica em Saúde do Jaboatão dos Guararapes
                        </p> */}

                        <p className="text-white/95 text-base sm:text-lg font-medium md:text-xl mt-1 sm:mt-2 max-w-md text-center">
                            O olhar digital da <b>saúde pública.</b>
                        </p>
                    </div>
                </div>

                {/* Card (right side) */}
                <div className="relative group ">
                    {/* Tailwind-only glow layers (adjust colors easily) */}
                    <div aria-hidden className="pointer-events-none absolute -inset-8 rounded-[32px]">
                        {/* Core soft halo */}
                        <div className="absolute inset-0 rounded-[32px] bg-teal-500/80 blur-3xl opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
                        {/* Accents: top-left and bottom-right orbs */}
                        <div className="absolute -top-10 -left-10 h-56 w-56 rounded-full bg-sky-400 blur-3xl" />
                        <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-cyan-400 blur-3xl" />
                    </div>

                    {/* Card */}
                    <div className="relative z-10 rounded-2xl sm:rounded-3xl bg-white backdrop-blur-sm border border-white/40 shadow-lg p-4 sm:p-6 md:p-8">
                        <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
                            <div>
                                <h1 className="text-xl sm:text-2xl mb-1 sm:mb-2 font-bold text-blue-600">Entrar</h1>
                                <p className="text-xs sm:text-sm mb-3 sm:mb-4 font-medium text-gray-600">Use suas credenciais do SIGE para entrar</p>
                                <label htmlFor="cpf" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">CPF</label>
                                <Input
                                    id="cpf"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="000.000.000-00"
                                    value={cpf}
                                    onChange={(e) => {
                                        const masked = formatCPF(e.target.value);
                                        setCpf(masked);
                                        if (cpfError) setCpfError(null);
                                    }}
                                    onBlur={() => {
                                        if (cpf && cpf.replace(/\D/g, "").length !== 11) {
                                            setCpfError("Informe os 11 dígitos do CPF");
                                        }
                                    }}
                                    pattern="\d{3}\.\d{3}\.\d{3}-\d{2}"
                                    maxLength={14} // 000.000.000-00
                                    className={`rounded-lg sm:rounded-2xl border text-sm ${cpfError ? 'border-red-500 ring-red-300' : 'border-gray-400/80 focus:ring-blue-400 focus:border-blue-300'} focus:ring-2 sm:focus:ring-3 ring-offset-1`}
                                    autoComplete="off"
                                />
                                {cpfError && <p className="mt-1 text-xs text-red-600 font-medium">{cpfError}</p>}
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Senha</label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="rounded-lg sm:rounded-2xl border border-gray-400/80 focus:ring-blue-400 focus:border-blue-300 focus:ring-2 sm:focus:ring-3 ring-offset-1 text-sm"
                                    autoComplete="current-password"
                                />
                            </div>

                            <div className="flex items-center justify-between pt-1 sm:pt-2">
                                <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={(e) => setRemember(e.target.checked)}
                                        className="h-3 sm:h-4 w-3 sm:w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    Lembrar de mim
                                </label>
                                <button type="button" className="text-xs sm:text-sm text-blue-600 hover:underline">
                                    Esqueci minha senha
                                </button>
                            </div>

                            <Button type="submit" className="w-full text-sm sm:text-base hover:bg-gradient-to-b from-white to-gray-200/20 hover:delay-5000 py-2 sm:py-2.5" disabled={loading}>
                                {loading ? "Entrando..." : "Entrar"}
                            </Button>

                            {/* Demo creds hint */}
                            <div className="text-[10px] sm:text-[11px] text-gray-500 mt-2">
                                Use seu CPF e sua senha.
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
