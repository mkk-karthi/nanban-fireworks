# EmailJS Free Tier & Cloudflare Turnstile Setup Guide

This guide explains how to set up **EmailJS Free Tier** (for admin order notifications under 50KB) and **Cloudflare Turnstile** (bot protection) for **Nanban Crackers** on **Cloudflare Pages**.

---

## Architecture Summary

- **Static Deployment**: Hosted on Cloudflare Pages via Next.js static HTML export (`output: "export"`).
- **Environment Variables**: Client-side variables are prefixed with `NEXT_PUBLIC_` and injected into the static build.
- **Admin-Only Email**: To preserve EmailJS Free Tier quota (200 emails/month), email notifications are sent **only to the store admin** (`Nanbancrackers0506@gmail.com`).
- **Invoice Delivery**: Customers automatically receive their instant branded monochrome PDF invoice downloaded in their browser and a direct phone confirmation from the factory.
- **50KB Payload Safety**: The email body is optimized into a lightweight HTML table and plain-text summary (typically 2KB–6KB), safely guarded under 45KB.

---

## 1. EmailJS Free Tier Setup

### Step 1.1: Create Account
1. Visit [https://www.emailjs.com](https://www.emailjs.com) and click **Sign Up Free**.
2. Free tier includes:
   - **200 emails / month**
   - **50KB maximum content per email**
   - Unlimited email services and templates

### Step 1.2: Add Email Service
1. In EmailJS Dashboard, navigate to **Email Services** > **Add New Service**.
2. Select your email provider:
   - **Gmail** (Recommended for Nanban Crackers: `Nanbancrackers0506@gmail.com`) or Outlook / Custom SMTP.
3. Click **Connect Account**, authenticate with `Nanbancrackers0506@gmail.com`, and click **Create Service**.
4. Note your **Service ID** (e.g., `service_abc123`).

### Step 1.3: Create Admin Email Template
1. In EmailJS Dashboard, navigate to **Email Templates** > **Create New Template**.
2. Set the following fields:
   - **Template Name**: `Nanban Crackers - Admin New Order`
   - **Subject**: `🚨 New Factory Order {{order_id}} - {{customer_name}} (₹{{payable_amount}})`
   - **To Email**: `Nanbancrackers0506@gmail.com` *(or `{{admin_email}}`)*
   - **From Name**: `Nanban Crackers Website`
   - **Reply To**: `{{customer_email}}`

3. In the template **Content** editor, switch to **HTML mode** (source code icon `< >`) and paste the following clean, compact template:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Order Notification</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #fdf8f6; margin: 0; padding: 20px; color: #1f2937;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #fed7aa; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #b91c1c, #d97706); padding: 20px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 22px; font-weight: bold; letter-spacing: 0.5px;">💥 Nanban Crackers – New Factory Order</h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.95;">Order ID: <strong>{{order_id}}</strong> &bull; {{order_date}}</p>
    </div>

    <!-- Body -->
    <div style="padding: 24px;">
      
      <!-- Customer Information Card -->
      <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px;">Customer Delivery Details</h3>
        <table style="width: 100%; font-size: 13px; line-height: 1.6;">
          <tr>
            <td style="width: 120px; color: #6b7280; font-weight: bold;">Full Name:</td>
            <td style="color: #111827; font-weight: bold;">{{customer_name}}</td>
          </tr>
          <tr>
            <td style="color: #6b7280; font-weight: bold;">Phone:</td>
            <td style="color: #b91c1c; font-weight: bold;"><a href="tel:{{customer_phone}}" style="color: #b91c1c; text-decoration: none;">{{customer_phone}}</a> (Call to confirm)</td>
          </tr>
          <tr>
            <td style="color: #6b7280; font-weight: bold;">Email:</td>
            <td style="color: #111827;">{{customer_email}}</td>
          </tr>
          <tr>
            <td style="color: #6b7280; font-weight: bold; vertical-align: top;">Delivery Address:</td>
            <td style="color: #111827;">{{customer_address}}</td>
          </tr>
          <tr>
            <td style="color: #6b7280; font-weight: bold;">City / District:</td>
            <td style="color: #111827; font-weight: bold;">{{customer_city}}</td>
          </tr>
          <tr>
            <td style="color: #6b7280; font-weight: bold;">Pincode:</td>
            <td style="color: #111827; font-weight: bold;">{{customer_pincode}}</td>
          </tr>
        </table>
      </div>

      <!-- Order Items Summary Table -->
      <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">Ordered Fireworks ({{item_count}} Products &bull; {{total_units}} Units)</h3>
      {{{order_items_html}}}

      <!-- Pricing Summary Card -->
      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 14px; margin-top: 16px;">
        <table style="width: 100%; font-size: 13px;">
          <tr>
            <td style="color: #6b7280;">Actual MRP:</td>
            <td style="text-align: right; color: #6b7280; text-decoration: line-through;">{{actual_total}}</td>
          </tr>
          <tr>
            <td style="color: #047857; font-weight: bold;">Factory Discount Saved:</td>
            <td style="text-align: right; color: #047857; font-weight: bold;">- {{total_saved}}</td>
          </tr>
          <tr style="border-top: 1px dashed #d1d5db;">
            <td style="padding-top: 8px; font-size: 16px; font-weight: bold; color: #b91c1c;">Net Payable Amount:</td>
            <td style="padding-top: 8px; font-size: 18px; font-weight: bold; text-align: right; color: #b91c1c;">{{payable_amount}}</td>
          </tr>
        </table>
      </div>

      <!-- Action Note -->
      <div style="margin-top: 20px; padding: 12px; border-left: 4px solid #d97706; background-color: #fffbeb; font-size: 12px; color: #78350f;">
        <strong>Next Step:</strong> Call the customer at <strong>{{customer_phone}}</strong> to confirm transport booking and Sivakasi factory dispatch.
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 12px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #f3f4f6;">
      Nanban Crackers Wholesale System &bull; Sivakasi Factory Direct &bull; Tamil Nadu
    </div>
  </div>
</body>
</html>
```

4. Click **Save** and note your **Template ID** (e.g., `template_xyz789`).

### Step 1.4: Get Public Key
1. Go to **Account** (left bottom) > **General**.
2. Copy your **Public Key** (e.g., `aBcDeFg123456789`).

---

## 2. Cloudflare Turnstile Setup

Cloudflare Turnstile provides frictionless, free CAPTCHA protection to stop bots from spamming your form or consuming your EmailJS quota.

### Step 2.1: Add Turnstile Widget
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com).
2. In the navigation sidebar, select **Turnstile**.
3. Click **Add site** / **Add widget**:
   - **Widget name**: `Nanban Crackers Order Form`
   - **Domains**:
     - Add your production domain: e.g. `nanbancrackers.mkkcreation.com`
     - Add Cloudflare pages domain: e.g. `nanban-fireworks.pages.dev`
     - Add `localhost` (for local development testing)
   - **Widget type**: **Managed** (Recommended) or **Non-interactive**
4. Click **Create**.
5. Copy your **Site Key** (starts with `0x4AAAAAA...`).
   *(Note: The Secret Key is only used for server-side verification; for client-side static pages, only the Site Key is needed).*

> [!TIP]
> **Cloudflare Dummy Testing Keys**:
> If you want to test without a live key, Cloudflare provides official dummy keys:
> - `1x00000000000000000000AA` (Always passes)
> - `2x00000000000000000000AB` (Always fails)
> - If `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is omitted, the code automatically bypasses check gracefully for frictionless local development.

---

## 3. Cloudflare Pages Environment Variables Setup

Since the application uses Next.js static export (`output: "export"`), environment variables are baked in during build time on Cloudflare Pages.

### Step 3.1: Add Variables in Cloudflare Pages
1. In Cloudflare Dashboard, go to **Workers & Pages** > Select your **Nanban Crackers** Pages project.
2. Navigate to **Settings** > **Environment variables**.
3. Under **Production** (and **Preview** if desired), click **Add variables** and add:

| Variable Name | Description | Example Value |
|---|---|---|
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | EmailJS Service ID | `service_xxxxxxx` |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | Admin Email Template ID | `template_xxxxxxx` |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | EmailJS Account Public Key | `your_public_key` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile Site Key | `0x4AAAAAAAxxxxxxx` |

4. Click **Save**.

### Step 3.2: Rebuild / Redeploy
- Once variables are added, trigger a new deployment in Cloudflare Pages (or push a commit to your branch).
- The Next.js static build will bake the `NEXT_PUBLIC_*` values into the client-side bundle.

---

## 4. Local Testing

To test locally:
1. Create `.env.local` in project root:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in your test or live keys.
3. Start dev server:
   ```bash
   npm run dev
   ```
4. Place an order on `http://localhost:3000/cart`:
   - Complete the Turnstile check.
   - Click **Confirm & Place Factory Order**.
   - Check the admin inbox (`Nanbancrackers0506@gmail.com`) for the instant notification email!
