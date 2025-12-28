# Stripe Integration Setup Guide

## 1. Install Dependencies

```bash
npm install stripe @stripe/stripe-js
```

## 2. Create Stripe Account & Get API Keys

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Create an account (or log in)
3. Navigate to **Developers** → **API keys**
4. Copy your **Secret key** (starts with `sk_test_...`)
5. Add to your `.env` file:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   ```

## 3. Create Products and Prices

1. Go to **Products** in Stripe Dashboard
2. Click **+ Add product**
3. Create the following products:

### ChillChess Pro (Yearly)
- Name: `ChillChess Pro Anual`
- Price: €19.99 EUR
- Billing period: Yearly
- Copy the **Price ID** (starts with `price_...`)
- Add to `.env`:
  ```
  PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID=price_...
  ```

### ChillChess Pro (Monthly) - Optional
- Name: `ChillChess Pro Mensual`
- Price: €2.99 EUR
- Billing period: Monthly
- Add to `.env`:
  ```
  PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_...
  ```

## 4. Set Up Webhook

1. Go to **Developers** → **Webhooks**
2. Click **+ Add endpoint**
3. Enter your endpoint URL:
   ```
   https://your-domain.com/api/stripe/webhook
   ```
4. Select events to listen:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Copy the **Signing secret** (starts with `whsec_...`)
6. Add to `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## 5. Test Locally

For local testing, use Stripe CLI:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:5173/api/stripe/webhook

# This will give you a webhook secret for local testing
# Use it in your .env
```

## 6. Test Cards

Use these test cards in Stripe test mode:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0027 6000 3184`

Any future expiry date and any CVC will work.

## 7. Customer Portal Setup

1. Go to **Settings** → **Billing** → **Customer portal**
2. Enable the portal
3. Configure what customers can do:
   - ✅ Cancel subscriptions
   - ✅ Update payment method
   - ✅ View invoice history

## 8. Go Live

When ready for production:

1. Switch to **Live mode** in Stripe Dashboard
2. Get your **Live API keys**
3. Create the same Products in Live mode
4. Update your production `.env` with live keys
5. Update webhook endpoint to use production URL
6. Test with real payment methods

## Architecture

```
User clicks "Subscribe"
    ↓
Frontend calls /api/stripe/create-checkout
    ↓
Server creates Stripe Checkout Session
    ↓
User redirected to Stripe Checkout
    ↓
User completes payment
    ↓
Stripe sends webhook to /api/stripe/webhook
    ↓
Webhook updates Firebase subscription document
    ↓
User gets instant access with Pro features
```

## Important Notes

- **Never expose** `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET` to the client
- Webhook signature verification is **critical** for security
- The webhook updates Firebase directly - the frontend reads from Firebase
- Users can manage their subscript through Stripe Customer Portal
- Stripe handles all payment processing, PCI compliance, and retries

## Troubleshooting

### "No module 'stripe' found"
Run `npm install stripe @stripe/stripe-js`

### Webhook not receiving events
1. Check webhook URL is correct
2. Verify webhook secret matches
3. Check Stripe Dashboard → Webhooks → event log
4. For local dev, use `stripe listen`

### Subscription not updating
1. Check webhook logs in Stripe Dashboard
2. Verify Firebase security rules allow webhook to write
3. Check server logs for errors
4. Ensure userId is in subscription metadata

## Support

For issues with integration:
1. Check Stripe Dashboard logs
2. Review server console for errors
3. Test webhooks using Stripe CLI
4. Consult [Stripe Documentation](https://stripe.com/docs)
