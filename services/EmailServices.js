import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
});

export async function sendEmail({ to, subject, html }) {
    const timeoutMs = Number(process.env.EMAIL_TIMEOUT_MS || 12000);
    let timeoutHandle = null;

    try {
        const sendPromise = transporter.sendMail({
            from: `${process.env.EMAIL_USER}`, to, subject, html
        });

        const timeoutPromise = new Promise((_, reject) => {
            timeoutHandle = setTimeout(() => {
                reject(new Error(`Email timeout after ${timeoutMs}ms`));
            }, timeoutMs);
        });

        const info = await Promise.race([sendPromise, timeoutPromise]);

        console.log("Email send: ", info.response)
        return info;
    } catch (ex) {
        console.error("Error sending email:", ex);
        throw ex;
    } finally {
        if (timeoutHandle) {
            clearTimeout(timeoutHandle);
        }
    }
}
