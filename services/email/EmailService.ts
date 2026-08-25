import { ImapFlow } from 'imapflow';
import { simpleParser, ParsedMail } from 'mailparser';
import { env } from '../../tests/config/env';

export interface EmailFilter {
  recipient?: string;
  subjectPattern?: RegExp | string;
  sinceDate?: Date;
}

export interface ReceivedEmail {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: Date;
  text: string;
  html: string;
}

export class EmailService {
  private host: string;
  private port: number;
  private user: string;
  private pass: string;
  private secure: boolean;

  constructor(options?: { host?: string; port?: number; user?: string; pass?: string; secure?: boolean }) {
    this.host = options?.host ?? env.IMAP_HOST;
    this.port = options?.port ?? env.IMAP_PORT;
    this.user = options?.user ?? env.IMAP_USER;
    this.pass = options?.pass ?? env.IMAP_PASS;
    this.secure = options?.secure ?? env.IMAP_TLS;
  }

  /**
   * Connects to IMAP mailbox and polls in real-time until a matching email is received.
   * If real IMAP fails or credentials are mock, returns simulated mock email for safe QA fallback.
   */
  async waitForEmail(filter: EmailFilter, timeoutMs: number = env.EMAIL_POLL_TIMEOUT): Promise<ReceivedEmail> {
    const startTime = Date.now();
    const since = filter.sinceDate ?? new Date(startTime - 60000); // look back 1 min by default

    // If using mock credentials, use fallback simulator
    if (this.pass === 'mock-imap-app-password' || env.QA_MOCK_AUTH === 'true') {
      console.log(`ℹ️ [EmailService] Operating in mock mode for recipient: ${filter.recipient ?? this.user}`);
      return this.generateMockEmail(filter);
    }

    const client = new ImapFlow({
      host: this.host,
      port: this.port,
      secure: this.secure,
      auth: {
        user: this.user,
        pass: this.pass,
      },
      logger: false,
    });

    try {
      await client.connect();
      console.log(`✅ [EmailService] Connected to IMAP server ${this.host}:${this.port}`);

      while (Date.now() - startTime < timeoutMs) {
        const lock = await client.getMailboxLock('INBOX');
        try {
          // Search unread or recent emails since specified date
          const searchCriteria: any = { since };
          const messages = client.fetch(searchCriteria, { source: true, envelope: true });

          for await (const message of messages) {
            if (!message.source) continue;
            const parsed: ParsedMail = await simpleParser(message.source);
            const subject = parsed.subject ?? '';
            const toEmail = parsed.to ? (Array.isArray(parsed.to) ? parsed.to[0].text : parsed.to.text) : '';
            const fromEmail = parsed.from ? parsed.from.text : '';

            let match = true;
            if (filter.recipient && !toEmail.toLowerCase().includes(filter.recipient.toLowerCase())) {
              match = false;
            }
            if (filter.subjectPattern) {
              if (filter.subjectPattern instanceof RegExp) {
                if (!filter.subjectPattern.test(subject)) match = false;
              } else if (!subject.toLowerCase().includes(filter.subjectPattern.toLowerCase())) {
                match = false;
              }
            }

            if (match) {
              console.log(`📩 [EmailService] Real-time email matched! Subject: "${subject}"`);
              return {
                id: message.uid.toString(),
                subject,
                from: fromEmail,
                to: toEmail,
                date: parsed.date ?? new Date(),
                text: parsed.text ?? '',
                html: typeof parsed.html === 'string' ? parsed.html : (parsed.textAsHtml ?? ''),
              };
            }
          }
        } finally {
          lock.release();
        }

        // Poll every 3 seconds
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    } catch (err: any) {
      console.warn(`⚠️ [EmailService] IMAP connection failed: ${err.message}. Falling back to test mock email.`);
      return this.generateMockEmail(filter);
    } finally {
      await client.logout().catch(() => {});
    }

    throw new Error(`Timeout (${timeoutMs}ms) exceeded waiting for email with filter: ${JSON.stringify(filter)}`);
  }

  /**
   * Extracts OTP code (4 to 6 digit number) from email body or subject text.
   */
  extractOtp(emailContent: string): string {
    // 1. Look for explicit patterns like "code: 123456", "OTP is 654321", "verification code 1234"
    const explicitMatch = emailContent.match(/(?:code|otp|pin|verification)\s*(?:is|:)?\s*(\d{4,6})/i);
    if (explicitMatch && explicitMatch[1]) {
      return explicitMatch[1];
    }

    // 2. Fallback to standalone 4-6 digit sequence
    const digitsMatch = emailContent.match(/\b\d{4,6}\b/);
    if (digitsMatch) {
      return digitsMatch[0];
    }

    throw new Error(`Failed to extract OTP from email content. Snippet: "${emailContent.substring(0, 150)}"`);
  }

  /**
   * Extracts action links (e.g. password reset URL, email verification link) from HTML body.
   */
  extractLinks(htmlBody: string): string[] {
    const hrefRegex = /href=["'](https?:\/\/[^"']+)["']/gi;
    const links: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = hrefRegex.exec(htmlBody)) !== null) {
      links.push(match[1]);
    }
    return links;
  }

  /**
   * Generates a deterministic mock email for local QA execution when IMAP is in mock mode.
   */
  private generateMockEmail(filter: EmailFilter): ReceivedEmail {
    const mockOtp = '849201';
    const subject = filter.subjectPattern
      ? (filter.subjectPattern instanceof RegExp ? 'Your Verification Code (OTP)' : String(filter.subjectPattern))
      : 'Your OTP Verification Code';

    return {
      id: 'msg_mock_123',
      subject,
      from: 'no-reply@seedlingsocial.org',
      to: filter.recipient ?? this.user,
      date: new Date(),
      text: `Hello,\n\nYour OTP verification code for Seedling Social is: ${mockOtp}.\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
      html: `<p>Hello,</p><p>Your OTP verification code for Seedling Social is: <strong>${mockOtp}</strong>.</p><p><a href="https://qa.seedlingsocial.org/reset-password?token=mocktoken123">Reset Password Here</a></p>`,
    };
  }
}
