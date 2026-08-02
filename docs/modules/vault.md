# Vault Module

## Purpose
Encrypted storage for sensitive credentials (bank logins, API secrets, certificate passwords). Store secrets securely instead of in plain text settings.

## Key Features
- Encrypted at rest (AES-256)
- Fields: name, type (password / api_key / certificate / other), value (encrypted), metadata
- Search by name
- Copy to clipboard (never shown in plain text after save)
- Audit log on every read

## Tips
- Use the vault instead of putting passwords in Settings → SMTP
- The "value" field is encrypted — only decrypted when you copy it
- Metadata can store non-sensitive context (e.g. "Gmail SMTP password")
