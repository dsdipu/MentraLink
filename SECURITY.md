# Security notes

## What is protected

| Area | Protection |
|---|---|
| Passwords | At least 10 characters with upper/lower case, a number and a symbol; common and personal passwords are rejected; bcrypt (cost 12) |
| Temporary passwords | Accounts created by an admin must replace the temporary password (the student ID) before using anything else |
| Login | CAPTCHA, per-IP rate limit, per-account lockout (5 wrong passwords, then 15 min, 30 min, 1 h ... up to 24 h), same answer for unknown e-mails |
| Sessions | Tokens expire (7 days by default) and stop working after a password change, reset or deactivation |
| One-time codes | Cryptographically random, expire in 10 minutes, destroyed after 5 wrong guesses, 60 second resend cooldown |
| Access control | Every route checks the role; students and mentors can only open their own section, sessions, profile and feedback |
| ID card photos | Stored as private files, deleted when a request is approved or rejected |
| Uploads | Real file content is checked (JPEG, PNG, GIF, WEBP only), 5 MB limit |
| Blog content | HTML is sanitised on the server and again in the browser; only http(s) links and images are accepted |
| API | Security headers, JSON-only Content-Security-Policy, no caching of responses, request size limit, operator-injection guard, global rate limit |
| Audit trail | Logins, lockouts, password changes, approvals, account creation and session status changes are recorded for one year (Admin > Audit Log) |

## Before going live

1. Set `NODE_ENV=production`.
2. Use a fresh `JWT_SECRET` of at least 32 random characters. If a `.env` file was ever shared, copied into a zip or committed, treat every value in it as leaked and replace it: MongoDB password, `JWT_SECRET`, Cloudinary secret, Brevo key and Turnstile secret.
3. Check that `git ls-files | grep .env` prints nothing.
4. Set `FRONTEND_URLS` to the real site address only.
5. Run `npm audit` in `backend` and `Frontend` regularly.

## Known limits

- The login token is kept in `localStorage`. Moving it to an httpOnly cookie (with CSRF protection) would be the next hardening step.
- The frontend host should send its own `Content-Security-Policy` header (the API already does).

## Reporting a problem

Please tell the project maintainers privately instead of opening a public issue.
