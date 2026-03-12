import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
    throw new Error("RESEND_API_KEY não está definida");
}

const resend = new Resend(apiKey);

export async function sendResetPasswordEmail(email: string, token: string) {
    try {
        const baseUrl =
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        const resetLink = `${baseUrl}/reset-password?token=${token}`;

        const response = await resend.emails.send({
            from: "LucroView <suporte@lucroview.com.br>",
            to: email,
            subject: "Redefinir sua senha - LucroView",
            html: `
            <h2>Redefinir senha</h2>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
          
            <a href="${resetLink}" 
               style="padding:10px 20px;background:#16a34a;color:white;text-decoration:none;border-radius:6px;">
               Redefinir senha
            </a>
          `
        });

        console.log("RESEND RESPONSE:", response);

    } catch (error) {
        console.error("ERRO AO ENVIAR EMAIL:", error);
    }
}