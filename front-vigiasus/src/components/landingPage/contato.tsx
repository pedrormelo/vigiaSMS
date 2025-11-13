"use client";

import { Button } from "@/components/ui/button";
import { useCallback, useMemo, useState } from "react";
import { sendContact } from "@/services/contactService";

export default function Contato() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isValidEmail = useCallback((value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }, []);

  const canSubmit = useMemo(() => {
    return name.trim().length >= 2 && isValidEmail(email) && message.trim().length >= 10;
  }, [name, email, message, isValidEmail]);

  function validate() {
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = "Informe seu nome";
    if (!isValidEmail(email)) errs.email = "Informe um e-mail válido";
    if (message.trim().length < 10) errs.message = "Mensagem muito curta (mín. 10 caracteres)";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await sendContact({ name, email, message, source: "landing:contato" });
      if (res?.ok) {
        setSuccessMsg(res.message || "Mensagem enviada com sucesso.");
        setName("");
        setEmail("");
        setMessage("");
        setFieldErrors({});
      } else {
        setErrorMsg(res?.message || "Não foi possível enviar sua mensagem");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Erro ao enviar a mensagem");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    // A seção principal com fundo azul e posicionamento relativo para a onda
    <section className="relative bg-gradient-to-r from-[#1745FF] to-cyan-600 pt-32 pb-20 px-6 font-sans">

      {/* Elemento SVG que cria a forma de onda no topo */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-current text-white"
          ></path>
        </svg>
      </div>

  {/* Container principal para o conteúdo do formulário */}
      <div className="max-w-2xl mx-auto text-white">

        {/* Título */}
        <h2 className="text-4xl font-bold text-center mb-12">
          Contato
        </h2>

        {/* Mensagens de status */}
        {successMsg && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 rounded-2xl bg-white/10 text-white border border-emerald-300/60 px-4 py-3"
          >
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-6 rounded-2xl bg-white/10 text-white border border-red-300/70 px-4 py-3"
          >
            {errorMsg}
          </div>
        )}

        {/* Formulário */}
        <form className="space-y-6" onSubmit={onSubmit} noValidate>
          {/* Campo Nome */}
          <div className="space-y-2">
            <div className="pb-1.2">
              <label htmlFor="nome" className="font-medium text">
                Seu nome: *
              </label>
            </div>
            <input
              id="nome"
              type="text"
              placeholder="Ex: João"
              className={`w-full p-4 rounded-2xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                fieldErrors.name ? "ring-2 ring-red-400" : ""
              }`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? "nome-error" : undefined}
              required
            />
            {fieldErrors.name && (
              <p id="nome-error" className="text-red-100 text-sm">
                {fieldErrors.name}
              </p>
            )}
          </div>

          {/* Campo E-mail */}
          <div className="space-y-2">
            <div className="pb-1.2">
              <label htmlFor="email" className="font-medium">
                Endereço de E-mail: *
              </label>
            </div>
            <input
              id="email"
              type="email"
              placeholder="exemplo@gmail.com"
              className={`w-full p-4 rounded-2xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                fieldErrors.email ? "ring-2 ring-red-400" : ""
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              required
            />
            {fieldErrors.email && (
              <p id="email-error" className="text-red-100 text-sm">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Campo Mensagem */}
          <div className="space-y-2">
            <div className="pb-1.2">

              <label htmlFor="mensagem" className="font-medium">
                Sua Mensagem: *
              </label>
            </div>
            <textarea
              id="mensagem"
              placeholder="Escreva aqui a sua dúvida, sugestão ou reclamação para a nossa equipe entrar em contato."
              className={`w-full p-4 rounded-2xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[150px] resize-none ${
                fieldErrors.message ? "ring-2 ring-red-400" : ""
              }`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              aria-invalid={!!fieldErrors.message}
              aria-describedby={fieldErrors.message ? "mensagem-error" : undefined}
              required
            ></textarea>
            {fieldErrors.message && (
              <p id="mensagem-error" className="text-red-100 text-sm">
                {fieldErrors.message}
              </p>
            )}
          </div>

          {/* Botão de Envio */}
          <Button
            type="submit"
            disabled={submitting || !canSubmit}
            className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 disabled:cursor-not-allowed text-blue-600 rounded-2xl py-5 text-lg font-bold shadow-lg transition-transform transform hover:scale-105"
          >
            {submitting ? "Enviando…" : "Enviar mensagem"}
          </Button>
        </form>
      </div>
    </section>
  );
}