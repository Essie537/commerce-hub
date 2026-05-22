# Deployment Guide: Commerce Hub

Follow these steps to take your world-class e-commerce platform live.

## 1. Supabase Backend Setup
Commerce Hub relies on Supabase for Auth, Database, and Storage.

### Run Migrations
Ensure all tables and policies are created by running the SQL scripts in `supabase/migrations/` via the [Supabase SQL Editor](https://app.supabase.com/).

### Deploy Edge Functions
Deploy the M-Pesa payment logic:
```bash
supabase functions deploy mpesa-stk-push --project-ref your_project_id
supabase functions deploy mpesa-callback --project-ref your_project_id
```

### Set Secrets
Configure your Safaricom Daraja API keys:
```bash
supabase secrets set MPESA_CONSUMER_KEY=xxx
supabase secrets set MPESA_CONSUMER_SECRET=xxx
supabase secrets set MPESA_SHORTCODE=xxx
supabase secrets set MPESA_PASSKEY=xxx
supabase secrets set SUPABASE_URL=https://your_project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=xxx
```

## 2. Frontend Deployment (Cloudflare)
The project is configured for Cloudflare Workers/Pages.

### Build and Deploy
```bash
npm run build
npx wrangler deploy
```

## 3. Production Assets
- Replace product images in the **Seller Dashboard**.
- Update the **Hero Section** imagery in `src/routes/index.tsx` if necessary.
- Ensure your `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are set in your deployment environment variables.

---
**Commerce Hub** is now ready for the Kenyan market.
