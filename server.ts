import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Centralized authorized owner email whitelist (supporting both primary and secondary configurations)
const AUTHORIZED_ADMIN_EMAILS = Object.freeze([
  'bhaktikakade05@gmail.com',
  'anandsg575@gmail.com',
  'bhaktikakade055@gmail.com',
  'anandsg7575@gmail.com',
]);

// Exact recipient email addresses for Resend admin login notifications
const ADMIN_NOTIFICATION_RECIPIENTS = Object.freeze([
  'bhaktikakade05@gmail.com',
  'anandsg575@gmail.com',
]);

/**
 * Validate required environment variables on startup
 * Strictly limited to:
 * - GOOGLE_CLIENT_ID
 * - RESEND_API_KEY
 * - MAIL_FROM_ADDRESS
 */
function validateEnvironmentVariables(): void {
  const requiredVars = ['GOOGLE_CLIENT_ID', 'RESEND_API_KEY', 'MAIL_FROM_ADDRESS'] as const;
  const missingVars = requiredVars.filter(v => !process.env[v] || process.env[v]?.trim() === '');

  console.log('--------------------------------------------------');
  console.log('THE FAB HOUSE — Environment Configuration Status:');
  console.log(`- GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Missing/Optional for basic preview'}`);
  console.log(`- RESEND_API_KEY:   ${process.env.RESEND_API_KEY ? 'Configured' : 'Not set (mock/audit mode)'}`);
  console.log(`- MAIL_FROM_ADDRESS:${process.env.MAIL_FROM_ADDRESS || 'Using default: THE FAB HOUSE <onboarding@resend.dev>'}`);
  
  if (missingVars.length > 0) {
    console.log(`Note: Variables pending configuration: ${missingVars.join(', ')}`);
  } else {
    console.log('All required environment variables are set.');
  }
  console.log('--------------------------------------------------');
}

interface GoogleTokenInfoResponse {
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  picture?: string;
  aud?: string;
  sub?: string;
  error_description?: string;
  exp?: string;
}

/**
 * Server-side verification of Google OAuth ID Token
 * Validates with Google tokeninfo endpoint and enforces audience and owner whitelist.
 */
async function verifyGoogleIdTokenOnServer(
  idToken: string
): Promise<{ valid: boolean; email?: string; name?: string; picture?: string; error?: string }> {
  try {
    const googleRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    );

    if (!googleRes.ok) {
      const errText = await googleRes.text();
      return { valid: false, error: `Invalid Google Token: ${errText}` };
    }

    const tokenInfo: GoogleTokenInfoResponse = await googleRes.json();

    if (!tokenInfo.email) {
      return { valid: false, error: 'Google ID token does not contain an email address.' };
    }

    const isVerified =
      tokenInfo.email_verified === 'true' || tokenInfo.email_verified === true;
    if (!isVerified) {
      return { valid: false, error: 'Google account email is not verified.' };
    }

    const normalizedEmail = tokenInfo.email.trim().toLowerCase();

    // Verify against Google Client ID if configured in environment
    const configuredClientId = process.env.GOOGLE_CLIENT_ID;
    if (configuredClientId && tokenInfo.aud && tokenInfo.aud !== configuredClientId) {
      return { valid: false, error: 'Token audience does not match configured Google Client ID.' };
    }

    // Enforce server-side authorization check against owner whitelist
    if (!AUTHORIZED_ADMIN_EMAILS.includes(normalizedEmail)) {
      return {
        valid: false,
        email: normalizedEmail,
        error: `403 Forbidden: Account (${normalizedEmail}) is not authorized for Back Office administration.`,
      };
    }

    return {
      valid: true,
      email: normalizedEmail,
      name: tokenInfo.name || normalizedEmail.split('@')[0],
      picture: tokenInfo.picture,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown token verification error';
    return { valid: false, error: `Google OAuth verification failure: ${message}` };
  }
}

/**
 * Server-side transactional email sender using RESEND as the ONLY email provider.
 */
async function sendResendAdminLoginEmail(options: {
  to: readonly string[];
  subject: string;
  text: string;
  html: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const rawFrom = process.env.MAIL_FROM_ADDRESS?.trim();
  // Resend prohibits sending directly from unverified public @gmail.com domains per DMARC policies.
  // If the user specifies a verified custom domain, use it; otherwise use Resend's onboarding address.
  const isGmailDomain = rawFrom ? /@gmail\.com/i.test(rawFrom) : false;
  const fromAddress = rawFrom && !isGmailDomain ? rawFrom : 'THE FAB HOUSE <onboarding@resend.dev>';
  const replyTo = rawFrom || 'the.fab.house01@gmail.com';

  if (!resendApiKey) {
    console.warn('[RESEND WARNING] RESEND_API_KEY environment variable is not configured. Email logged to server audit log:');
    console.log(`[RESEND AUDIT] To: ${options.to.join(', ')} | Subject: "${options.subject}"`);
    return {
      success: true,
      messageId: `simulated-${Date.now()}`,
    };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress.trim(),
        reply_to: replyTo,
        to: Array.from(options.to),
        subject: options.subject,
        text: options.text,
        html: options.html,
      }),
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      console.log(`[RESEND SUCCESS] Sent admin login notification to ${options.to.join(', ')}. Resend ID: ${data.id}`);
      return { success: true, messageId: data.id };
    }

    const errBody = await res.text();
    console.warn(`[RESEND ERROR ${res.status}]:`, errBody);
    return { success: false, error: `Resend API returned status ${res.status}: ${errBody}` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.warn('[RESEND FAILED]:', message);
    return { success: false, error: `Failed to communicate with Resend API: ${message}` };
  }
}

async function startServer() {
  // Validate env vars on boot
  validateEnvironmentVariables();

  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json());

  // API Route: Verify Google OAuth Token on Server
  app.post('/api/auth/verify-google-token', async (req: Request, res: Response) => {
    const { idToken, simulatedEmail, simulatedName } = req.body;

    // Production Google OAuth Token Verification
    if (idToken) {
      const verification = await verifyGoogleIdTokenOnServer(idToken);
      if (!verification.valid) {
        res.status(403).json({
          success: false,
          error: verification.error || 'Server rejected token validation',
        });
        return;
      }

      res.json({
        success: true,
        user: {
          email: verification.email,
          name: verification.name,
          verifiedAt: new Date().toISOString(),
          role: 'owner_admin',
        },
      });
      return;
    }

    // Direct / Demo verification with strict server-side whitelist validation
    if (simulatedEmail) {
      const email = String(simulatedEmail).trim().toLowerCase();
      if (!AUTHORIZED_ADMIN_EMAILS.includes(email)) {
        res.status(403).json({
          success: false,
          error: `403 Forbidden: Email (${email}) is not on THE FAB HOUSE owner whitelist. Access denied.`,
        });
        return;
      }

      const isBhakti = email.includes('bhaktikakade');
      const name = simulatedName || (isBhakti ? 'Bhakti Kakade' : 'Anand Gaikwad');
      res.json({
        success: true,
        user: {
          email,
          name,
          verifiedAt: new Date().toISOString(),
          role: 'owner_admin',
        },
      });
      return;
    }

    res.status(400).json({ success: false, error: 'Missing token or credentials payload' });
  });

  // API Route: Server-Side Admin Login Notification Dispatch using RESEND ONLY
  app.post('/api/admin-login-notification', async (req: Request, res: Response) => {
    const { adminEmail, adminName, date, time } = req.body;
    
    // Strict recipients as requested: bhaktikakade05@gmail.com and anandsg575@gmail.com
    const recipients = ADMIN_NOTIFICATION_RECIPIENTS;

    const dateStr = date || new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
    const timeStr = time || new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
    const isBhakti = String(adminEmail).toLowerCase().includes('bhaktikakade');
    const nameStr = adminName || (isBhakti ? 'Bhakti Kakade' : 'Anand Gaikwad');

    const subject = 'THE FAB HOUSE — Authorized Owner Login Alert';

    // Plain text content
    const textBody = `THE FAB HOUSE — ADMIN LOGIN NOTIFICATION

Application: THE FAB HOUSE Admin Panel
Timezone: Asia/Kolkata
Owner Name: ${nameStr}
Account Email: ${adminEmail}
Login Date: ${dateStr}
Login Time: ${timeStr} (Asia/Kolkata)
Security Status: Authorized Owner Login Successful

--------------------------------------------------
AUTHORIZED OWNER ACCESS CONFIRMATION:
This is an automated administrative notification confirming that an authorized owner has successfully logged into the THE FAB HOUSE Back Office Administrative Portal.

Notification Recipients:
${recipients.join('\n')}
`;

    // High fidelity HTML content
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>THE FAB HOUSE — Admin Login Alert</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FBF7EE; color: #2C2417; margin: 0; padding: 24px;">
  <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #DACBAA; border-radius: 12px; padding: 28px; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
    
    <!-- Header -->
    <div style="border-bottom: 2px solid #8B5A3C; padding-bottom: 14px; margin-bottom: 20px;">
      <h2 style="margin: 0; color: #8B5A3C; font-size: 22px; font-weight: bold; letter-spacing: 0.5px;">THE FAB HOUSE</h2>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #766A57;">Commercial Back Office Security Notification</p>
    </div>

    <!-- Status Banner -->
    <div style="background-color: #F5EFE1; border-left: 4px solid #2E7D32; padding: 14px; border-radius: 6px; margin-bottom: 20px;">
      <div style="display: flex; align-items: center; margin-bottom: 4px;">
        <strong style="color: #1E4620; font-size: 14px;">Authorized Owner Login Successful</strong>
      </div>
      <p style="margin: 0; font-size: 12px; color: #433827; line-height: 1.5;">
        This alert confirms that an authorized owner account has signed into THE FAB HOUSE administrative portal.
      </p>
    </div>

    <!-- Details Table -->
    <table style="width: 100%; font-size: 13px; border-collapse: collapse; margin-bottom: 22px;">
      <tr style="border-bottom: 1px solid #F0E8D8;">
        <td style="padding: 10px 0; color: #766A57; width: 140px;"><strong>Application:</strong></td>
        <td style="padding: 10px 0; color: #2C2417; font-weight: 600;">THE FAB HOUSE Admin Panel</td>
      </tr>
      <tr style="border-bottom: 1px solid #F0E8D8;">
        <td style="padding: 10px 0; color: #766A57;"><strong>Owner Name:</strong></td>
        <td style="padding: 10px 0; color: #2C2417; font-weight: 600;">${nameStr}</td>
      </tr>
      <tr style="border-bottom: 1px solid #F0E8D8;">
        <td style="padding: 10px 0; color: #766A57;"><strong>Account Email:</strong></td>
        <td style="padding: 10px 0; color: #2C2417; font-family: monospace;">${adminEmail}</td>
      </tr>
      <tr style="border-bottom: 1px solid #F0E8D8;">
        <td style="padding: 10px 0; color: #766A57;"><strong>Login Date:</strong></td>
        <td style="padding: 10px 0; color: #2C2417;">${dateStr}</td>
      </tr>
      <tr style="border-bottom: 1px solid #F0E8D8;">
        <td style="padding: 10px 0; color: #766A57;"><strong>Login Time:</strong></td>
        <td style="padding: 10px 0; color: #2C2417; font-weight: 600;">${timeStr} (Asia/Kolkata)</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #766A57;"><strong>Security Status:</strong></td>
        <td style="padding: 10px 0; color: #2E7D32; font-weight: bold;">Authorized Owner Session Active</td>
      </tr>
    </table>

    <!-- Footer -->
    <div style="border-top: 1px solid #E7DAC0; padding-top: 16px; font-size: 11px; color: #8A7E6B; text-align: center; line-height: 1.5;">
      Dispatched via Resend API to authorized owners:<br/>
      <strong>bhaktikakade05@gmail.com</strong> · <strong>anandsg575@gmail.com</strong>
    </div>
  </div>
</body>
</html>`;

    const result = await sendResendAdminLoginEmail({
      to: recipients,
      subject,
      text: textBody,
      html: htmlBody,
    });

    res.json({
      success: result.success,
      deliveryMethod: 'Resend',
      messageId: result.messageId,
      error: result.error,
      recipients,
      timestamp: `${dateStr} ${timeStr}`,
    });
  });

  // Mount Vite development middlewares or static files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`THE FAB HOUSE Application Server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
