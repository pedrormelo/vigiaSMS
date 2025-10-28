"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/input";
import { Button } from "@/components/ui/button";
import { showErrorToast, showSuccessToast } from "@/components/ui/Toasts";
import { authService } from "@/services/authService";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // If already logged in, redirect to home
        const user = authService.getUser();
        if (user) {
            router.replace("/");
        }
    }, [router]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            showErrorToast("Preencha seu CPF e senha");
            return;
        }
        setLoading(true);
        try {
            const user = await authService.login(email, password);
            authService.saveUser(user, remember);
            showSuccessToast(`Bem-vindo(a), ${user.name}!`);
            router.push("/");
        } catch (err: any) {
            showErrorToast(err?.message || "Falha no login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 flex items-center justify-center p-6">
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                {/* Brand (left side) */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
                    <div>
                        <h1 className="text-5xl md:text-6xl text-white leading-tight">
                            Vigia<span className="font-bold">SUS</span>
                        </h1>
                        <p className="text-white/95 text-lg md:text-xl mt-2 max-w-md">
                            O olhar digital da saúde pública.
                        </p>
                    </div>
                    {/* preciso da logo branca */}
                    {/* <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 mt-6">
                        <Image src="/logos/logo-gti.png" alt="GTI" width={60} height={60} priority />
                        <Image src="/logos/logo-jaboatao.png" alt="Jaboatão" width={280} height={280} priority />
                    </div> */}
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
                    <div className="relative z-10 rounded-3xl bg-white backdrop-blur-sm border border-white/40 shadow-lg p-6 md:p-8">
                        <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <h1 className="text-2xl mb-2 font-bold text-blue-600">Entrar</h1>
                            <p className="text-sm mb-4 font-medium text-gray-600">Use suas credenciais VigiaSUS para entrar</p>
                            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                            <Input
                                id="cpf"
                                type="text"
                                placeholder="000.000.000-00"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="rounded-2xl border border-gray-400/80 focus:ring-blue-400 focus:border-blue-300 focus:ring-3 ring-offset-1"
                                autoComplete="cpf"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="rounded-2xl border border-gray-400/80 focus:ring-blue-400 focus:border-blue-300 focus:ring-3 ring-offset-1"
                                autoComplete="current-password"
                            />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                Lembrar de mim
                            </label>
                            <button type="button" className="text-sm text-blue-600 hover:underline">
                                Esqueci minha senha
                            </button>
                        </div>

                        <Button type="submit" className="w-full hover:bg-gradient-to-b from-white to-gray-200/20 hover:delay-5000" disabled={loading}>
                            {loading ? "Entrando..." : "Entrar"}
                        </Button>

                        {/* Demo creds hint */}
                        <div className="text-[11px] text-gray-500 mt-2">
                            Use seu CPF e sua senha.
                        </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
