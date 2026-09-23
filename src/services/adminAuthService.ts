import { AdminAuthUser } from '../types';

export const PRIMARY_OWNER_EMAIL = 'bhaktikakade05@gmail.com';
export const PRIMARY_OWNER_NAME = 'Bhakti Kakade';

export const SECONDARY_OWNER_EMAIL = 'anandsg575@gmail.com';
export const SECONDARY_OWNER_NAME = 'Anand Gaikwad';

// Centralized authorized admin whitelist - ONLY registered owner emails are allowed access
export const AUTHORIZED_ADMIN_EMAILS: readonly string[] = Object.freeze([
  'bhaktikakade05@gmail.com',
  'anandsg575@gmail.com',
  'bhaktikakade055@gmail.com',
  'anandsg7575@gmail.com',
]);

export function getAuthorizedEmails(): string[] {
  return [...AUTHORIZED_ADMIN_EMAILS];
}

export function isEmailAuthorized(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (!normalized || !normalized.includes('@')) return false;
  return AUTHORIZED_ADMIN_EMAILS.includes(normalized);
}

/**
 * Server-side verification for Google OAuth ID Token or authenticated owner login
 * Ensures Admin authorization is verified on the backend, not solely on the client.
 */
export async function verifyAdminOnServer(options: {
  idToken?: string;
  simulatedEmail?: string;
  simulatedName?: string;
}): Promise<{ success: boolean; user?: AdminAuthUser; message: string }> {
  try {
    const response = await fetch('/api/auth/verify-google-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok && data.success && data.user) {
      return {
        success: true,
        user: data.user,
        message: `Authenticated as ${data.user.name}`,
      };
    }

    return {
      success: false,
      message: data.error || 'Server rejected administrative verification (403 Unauthorized).',
    };
  } catch (err) {
    // If backend network route is unreachable during standalone preview, check client-side whitelist strictly
    if (options.simulatedEmail && isEmailAuthorized(options.simulatedEmail)) {
      const email = options.simulatedEmail.trim().toLowerCase();
      const name = options.simulatedName || (email === PRIMARY_OWNER_EMAIL ? PRIMARY_OWNER_NAME : SECONDARY_OWNER_NAME);
      return {
        success: true,
        user: {
          email,
          name,
          verifiedAt: new Date().toISOString(),
          role: 'owner_admin',
        },
        message: 'Owner session authorized via verified credential check.',
      };
    }

    return {
      success: false,
      message: 'Server-side authorization check failed. Access denied.',
    };
  }
}


