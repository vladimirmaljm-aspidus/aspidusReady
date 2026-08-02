# Webhooks Module

## Purpose
Send HTTP POST notifications to external systems when events happen (offer sent, invoice paid, KYC approved, etc.).

## Key Features
- Register webhook URL + secret
- Select events to subscribe to
- View delivery history (last 100 deliveries per webhook)
- Retry failed deliveries
- HMAC signature in header for verification

## Events
- offer.created, offer.sent, offer.accepted, offer.rejected
- invoice.created, invoice.sent, invoice.paid
- partner.created, partner.updated
- kyc.submitted, kyc.approved, kyc.rejected
- portal.access_created, portal.invited

## Tips
- Use the secret to verify the HMAC signature in your receiver
- Failed deliveries retry 3 times with exponential backoff
- View delivery history to debug why a webhook didn't arrive
