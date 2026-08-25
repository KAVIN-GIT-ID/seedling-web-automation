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
   * Connects to real IMAP mailbox and polls in real-time until a matching email arrives.
   * Strictly filters out older emails by checking message timestamp against sinceDate.
   */
  async waitForEmail(filter: EmailFilter, timeoutMs: number = env.EMAIL_POLL_TIMEOUT): Promise<ReceivedEmail> {
    const startTime = Date.now();
    const since = filter.sinceDate ?? new Date(startTime - 60000);

    const client = new ImapFlow({
      host: this.host,
      port: this.port,
      secure: this.secure,
      tls: {
        rejectUnauthorized: false,
      },
      auth: {
        user: this.user,
        pass: this.pass,
      },
      logger: false,
    });

    try {
      await client.connect();
      console.log(`✅ [EmailService] Connected to real IMAP mailbox ${this.host}:${this.port} (${this.user})`);

      while (Date.now() - startTime < timeoutMs) {
        const lock = await client.getMailboxLock('INBOX');
        try {
          const searchCriteria: any = { since };
          const messages = client.fetch(searchCriteria, { source: true, envelope: true });

          const messagesList: any[] = [];
          for await (const message of messages) {
            messagesList.push(message);
          }
          // Sort descending by UID to evaluate the NEWEST email first
          messagesList.sort((a, b) => b.uid - a.uid);

          for (const message of messagesList) {
            if (!message.source) continue;
            const parsed: ParsedMail = await simpleParser(message.source);
            const subject = parsed.subject ?? '';
            const toEmail = parsed.to ? (Array.isArray(parsed.to) ? parsed.to[0].text : parsed.to.text) : '';
            const fromEmail = parsed.from ? parsed.from.text : '';

            let match = true;

            // 1. Recipient check
            if (filter.recipient && !toEmail.toLowerCase().includes(filter.recipient.toLowerCase())) {
              match = false;
            }

            // 2. Subject pattern check
            if (filter.subjectPattern) {
              if (filter.subjectPattern instanceof RegExp) {
                if (!filter.subjectPattern.test(subject)) match = false;
              } else if (!subject.toLowerCase().includes(filter.subjectPattern.toLowerCase())) {
                match = false;
              }
            }

            // 3. Strict Timestamp check: Discard emails received BEFORE the test requested the OTP
            if (filter.sinceDate && parsed.date) {
              const emailTime = new Date(parsed.date).getTime();
              const sinceTime = new Date(filter.sinceDate).getTime();
              // 5 second buffer for clock tolerance
              if (emailTime < sinceTime - 5000) {
                match = false;
              }
            }

            if (match) {
              console.log(`📩 [EmailService] Real-time email received! Subject: "${subject}" (UID: ${message.uid}, Date: ${parsed.date})`);
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

        // Poll every 3 seconds for new email
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    } catch (err: any) {
      const errorMsg = err?.message || err?.reason || err?.responseText || (err ? String(err) : 'Unknown connection error');
      console.error(`❌ [EmailService] IMAP connection failed for user ${this.user} on ${this.host}:${this.port}. Details:`, errorMsg);
      throw new Error(`IMAP connection failed (${this.host}:${this.port}): ${errorMsg}`);
    } finally {
      await client.logout().catch(() => {});
    }

    throw new Error(`Timeout (${timeoutMs}ms) exceeded waiting for real email with filter: ${JSON.stringify(filter)}`);
  }

  /**
   * Extracts OTP code (4 to 6 digit number) from email body or subject text.
   */
  extractOtp(emailContent: string): string {
    const explicitMatch = emailContent.match(/(?:code|otp|pin|verification)\s*(?:is|:)?\s*(\d{4,6})/i);
    if (explicitMatch && explicitMatch[1]) {
      return explicitMatch[1];
    }

    const digitsMatch = emailContent.match(/\b\d{4,6}\b/);
    if (digitsMatch) {
      return digitsMatch[0];
    }

    throw new Error(`Failed to extract OTP from email content. Snippet: "${emailContent.substring(0, 150)}"`);
  }

  /**
   * Extracts action links from HTML email body.
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
}
