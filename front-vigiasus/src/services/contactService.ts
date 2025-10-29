export type ContactPayload = {
    name: string;
    email: string;
    message: string;
    // optional metadata for future use (e.g., page source, phone, subject)
    source?: string;
};

export type ContactResponse = {
    ok: boolean;
    message: string;
    id?: string;
};

// Chooses API endpoint:
// - If NEXT_PUBLIC_API_BASE_URL is defined, post to `${BASE_URL}/contact`
// - Otherwise, use the local Next.js route `/api/contact`
function getEndpoint() {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
    return base ? `${base}/contact` : "/api/contact";
}

export async function sendContact(payload: ContactPayload, opts?: { timeoutMs?: number }) {
    const endpoint = getEndpoint();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), opts?.timeoutMs ?? 15000);

    try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });

        // Allow 200-202 as success for queued processing semantics
        if (!res.ok && !(res.status >= 200 && res.status < 203)) {
            const text = await safeText(res);
            throw new Error(text || `Falha ao enviar (status ${res.status})`);
        }

        const data = (await safeJson(res)) as ContactResponse | null;
        return (
            data ?? {
                ok: true,
                message: "Mensagem recebida",
            }
        );
    } catch (err: any) {
        if (err?.name === "AbortError") {
            throw new Error("Tempo de requisição excedido. Tente novamente.");
        }
        throw err;
    } finally {
        clearTimeout(timeout);
    }
}

async function safeJson(res: Response) {
    try {
        return await res.json();
    } catch {
        return null;
    }
}

async function safeText(res: Response) {
    try {
        return await res.text();
    } catch {
        return "";
    }
}
