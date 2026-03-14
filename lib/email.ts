import nodemailer from "nodemailer";

interface EmployeeInviteEmailInput {
    to: string;
    name: string;
    role: string;
    inviteUrl: string;
    invitedByName?: string | null;
    expiresAt: Date;
}

interface EmailDeliveryResult {
    delivered: boolean;
    reason?: string;
}

function getBaseUrl(): string {
    return (
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.NEXTAUTH_URL ||
        "http://localhost:3000"
    );
}

function getSmtpConfig() {
    const host = process.env.SMTP_HOST;
    const portValue = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !portValue || !user || !pass) {
        return null;
    }

    const port = Number(portValue);
    if (!Number.isFinite(port)) {
        throw new Error("SMTP_PORT must be a valid number.");
    }

    const secureValue = process.env.SMTP_SECURE?.trim().toLowerCase();
    const secure = secureValue
        ? ["1", "true", "yes", "on"].includes(secureValue)
        : port === 465;

    return {
        host,
        port,
        secure,
        auth: {
            user,
            pass,
        },
        from:
            process.env.SMTP_FROM ||
            process.env.EMAIL_FROM ||
            `Vixingo <${user}>`,
    };
}

function formatRole(role: string): string {
    return role
        .toLowerCase()
        .split("_")
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(" ");
}

function formatExpiry(expiresAt: Date): string {
    return expiresAt.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export function getInviteUrl(token: string): string {
    return new URL(`/invite/${token}`, getBaseUrl()).toString();
}

export async function sendEmployeeInviteEmail(
    input: EmployeeInviteEmailInput,
): Promise<EmailDeliveryResult> {
    const smtpConfig = getSmtpConfig();
    if (!smtpConfig) {
        return {
            delivered: false,
            reason: "SMTP is not configured.",
        };
    }

    const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: smtpConfig.auth,
    });

    const invitedByText = input.invitedByName
        ? `${input.invitedByName} invited you to join Vixingo.`
        : "You were invited to join Vixingo.";
    const roleLabel = formatRole(input.role);
    const expiresLabel = formatExpiry(input.expiresAt);

    await transporter.sendMail({
        from: smtpConfig.from,
        to: input.to,
        subject: `Set up your Vixingo ${roleLabel} account`,
        text: [
            `Hi ${input.name},`,
            "",
            invitedByText,
            `Your role will be ${roleLabel}.`,
            "",
            "Use the link below to create your password and activate your dashboard access:",
            input.inviteUrl,
            "",
            `This link expires on ${expiresLabel}.`,
            "",
            "If you were not expecting this invite, you can ignore this email.",
        ].join("\n"),
        html: `
            <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6; max-width: 640px; margin: 0 auto;">
                <h2 style="margin-bottom: 16px;">Set up your Vixingo account</h2>
                <p>Hi ${escapeHtml(input.name)},</p>
                <p>${escapeHtml(invitedByText)}</p>
                <p>Your role will be <strong>${escapeHtml(roleLabel)}</strong>.</p>
                <p>
                    <a
                        href="${input.inviteUrl}"
                        style="display: inline-block; padding: 12px 20px; background: #c9a84c; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700;"
                    >
                        Create Password
                    </a>
                </p>
                <p>If the button does not work, use this link:</p>
                <p><a href="${input.inviteUrl}">${input.inviteUrl}</a></p>
                <p>This link expires on ${escapeHtml(expiresLabel)}.</p>
                <p>If you were not expecting this invite, you can ignore this email.</p>
            </div>
        `,
    });

    return { delivered: true };
}

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
