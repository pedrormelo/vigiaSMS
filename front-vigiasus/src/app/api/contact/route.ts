import { NextResponse } from "next/server";

type Body = {
    name?: string;
    email?: string;
    message?: string;
    source?: string;
};

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as Body;

        const errors: Record<string, string> = {};
        if (!body.name || body.name.trim().length < 2) {
            errors.name = "Informe seu nome";
        }
        if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
            errors.email = "Informe um e-mail válido";
        }
        if (!body.message || body.message.trim().length < 10) {
            errors.message = "Escreva uma mensagem (mín. 10 caracteres)";
        }

        if (Object.keys(errors).length) {
            return NextResponse.json({ ok: false, message: "Dados inválidos", errors }, { status: 400 });
        }

        // If a backend URL is configured, relay the request there.
        const backend = process.env.BACKEND_URL?.replace(/\/$/, "");
        if (backend) {
            try {
                const res = await fetch(`${backend}/contact`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                    // Optionally add authentication headers here later
                });
                const text = await res.text();
                // Forward status and body best-effort
                return new NextResponse(text || JSON.stringify({ ok: res.ok }), { status: res.status });
            } catch (e) {
                // Fall through to local accept behavior if backend is unreachable
            }
        }

        // Local accept behavior: emulate queued processing, return 202
        const id = crypto.randomUUID();
        console.log("[contact] received:", { id, ...body });
        return NextResponse.json(
            { ok: true, id, message: "Mensagem recebida. Nossa equipe entrará em contato em breve." },
            { status: 202 }
        );
    } catch (e) {
        return NextResponse.json({ ok: false, message: "Erro ao enviar a mensagem" }, { status: 500 });
    }
}
