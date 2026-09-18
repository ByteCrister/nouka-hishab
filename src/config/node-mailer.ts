import nodemailer from "nodemailer";

/**
 * Mailer
 * Automatically uses Gmail if SMTP_USER and SMTP_PASSWORD are in env,
 * otherwise falls back to Ethereal testing mailer.
 */
export const mailer = async (
    To: string,
    subject: string,
    html: string
): Promise<boolean> => {
    try {
        let transporter;
        const useRealEmail = process.env.SMTP_USER && process.env.SMTP_PASSWORD;
        
        if (useRealEmail) {
            transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD,
                },
            });
        } else {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: testAccount.smtp.host,
                port: testAccount.smtp.port,
                secure: testAccount.smtp.secure,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            console.log("Using Ethereal testing mailer...");
        }

        const info = await transporter.sendMail({
            from: `"Nouka Hishab" <${process.env.SMTP_USER || 'test@noukahishab.com'}>`,
            to: To,
            subject,
            html,
        });

        if (!useRealEmail) {
            console.log("🧪 Test Message ID:", info.messageId);
            console.log("🔗 Preview URL:", nodemailer.getTestMessageUrl(info));
        } else {
            console.log("📧 Message sent:", info.messageId);
        }

        return true;
    } catch (error) {
        console.error("❌ Mail error:", error);
        throw new Error("Failed to send email.");
    }
};

