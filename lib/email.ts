import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendResetPasswordEmail(email: string, token: string) {
    try {
        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

        const response = await resend.emails.send({
            from: "LucroView <suporte@lucroview.com.br>",
            to: email,
            subject: "Redefinir sua senha - LucroView",
            html: `
        <h2>Redefinir senha</h2>
        <p>Clique no botão abaixo para criar uma nova senha:</p>

        <a href="${resetLink}">
        Redefinir senha
        </a>
      `,
        });

        console.log("RESEND RESPONSE:", response);

    } catch (error) {
        console.error("ERRO AO ENVIAR EMAIL:", error);
    }
}