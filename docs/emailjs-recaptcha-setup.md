# EmailJS Free Tier & Google reCAPTCHA Setup Guide

This guide explains how to set up **EmailJS Free Tier** (for admin order notifications under 50KB) and **Google reCAPTCHA v2** (bot protection) for **Nanban Crackers** on **Cloudflare Pages**.

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
      <h2 style="font-size: 15px; text-transform: uppercase; color: #9a3412; letter-spacing: 0.5px; border-bottom: 2px solid #fed7aa; padding-bottom: 6px; margin-top: 0;">Customer Details</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px;">
        <tr><td style="padding: 4px 0; color: #6b7280; width: 110px;">Name:</td><td style="padding: 4px 0; font-weight: bold; color: #111827;">{{customer_name}}</td></tr>
        <tr><td style="padding: 4px 0; color: #6b7280;">Phone:</td><td style="padding: 4px 0; font-weight: bold; color: #166534;"><a href="tel:{{customer_phone}}" style="color: #166534; text-decoration: none;">📞 {{customer_phone}}</a></td></tr>
        <tr><td style="padding: 4px 0; color: #6b7280;">Email:</td><td style="padding: 4px 0; color: #111827;">{{customer_email}}</td></tr>
        <tr><td style="padding: 4px 0; color: #6b7280;">Address:</td><td style="padding: 4px 0; color: #111827;">{{customer_address}}</td></tr>
        <tr><td style="padding: 4px 0; color: #6b7280;">City:</td><td style="padding: 4px 0; font-weight: bold; color: #111827;">{{customer_city}} - {{customer_pincode}}</td></tr>
      </table>

      <h2 style="font-size: 15px; text-transform: uppercase; color: #9a3412; letter-spacing: 0.5px; border-bottom: 2px solid #fed7aa; padding-bottom: 6px;">Ordered Items</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px;">
        <thead>
          <tr style="background-color: #ffedd5; color: #9a3412; text-align: left;">
            <th style="padding: 6px 8px;">#</th>
            <th style="padding: 6px 8px;">Product</th>
            <th style="padding: 6px 8px; text-align: center;">Qty</th>
            <th style="padding: 6px 8px; text-align: right;">Rate</th>
          </tr>
        </thead>
        <tbody>
          {{#orders}}
          <tr style="border-bottom: 1px solid #fed7aa;">
            <td style="padding: 6px 8px;">{{id}}</td>
            <td style="padding: 6px 8px; font-weight: bold;">{{name}}</td>
            <td style="padding: 6px 8px; text-align: center;">{{units}}</td>
            <td style="padding: 6px 8px; text-align: right;">{{price}}</td>
          </tr>
          {{/orders}}
        </tbody>
      </table>

      <!-- Totals Box -->
      <div style="background-color: #fff7ed; border: 1px solid #fdba74; border-radius: 8px; padding: 12px 16px; margin-top: 16px;">
        <table style="width: 100%; font-size: 13px;">
          <tr><td style="color: #6b7280;">Actual Rate:</td><td style="text-align: right; color: #6b7280; text-decoration: line-through;">{{total}}</td></tr>
          <tr><td style="color: #166534; font-weight: bold;">Diwali Discount (70% Off):</td><td style="text-align: right; color: #166534; font-weight: bold;">- {{discount}}</td></tr>
          <tr style="border-top: 1px solid #fdba74; font-size: 16px;"><td style="padding-top: 8px; font-weight: bold; color: #9a3412;">Payable Total:</td><td style="padding-top: 8px; text-align: right; font-weight: bold; color: #b91c1c;">{{payable}}</td></tr>
        </table>
      </div>
    </div>
  </div>
</body>
</html>
```

4. Click **Save**. Note your **Template ID** (e.g., `template_abc123`).

### Step 1.4: Obtain Public Key
1. Go to **Account** (left bottom gear icon) > **API Keys**.
2. Copy your **Public Key** (e.g., `aBcDeFg123456789`).

---

## 2. Google reCAPTCHA v2 Setup

Google reCAPTCHA protects the order form and free EmailJS quota from automated bot submissions.

### Step 2.1: Register Site in Google reCAPTCHA
1. Visit [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin).
2. Click **Create** (`+` button).
3. Fill in the registration details:
   - **Label**: `Nanban Crackers`
   - **reCAPTCHA type**: **reCAPTCHA v2** > **"I'm not a robot" Checkbox**
   - **Domains**:
     - `nanbancrackers.mkkcreation.com`
     - `nanban-fireworks.pages.dev`
     - `localhost`
4. Accept Terms of Service and click **Submit**.
5. Copy your **Site Key**.

> [!TIP]
> **Google Official Dummy Testing Key**:
> For local testing, you can use Google's official test key that always passes:
> `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
> If `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is omitted, the code automatically bypasses check gracefully for frictionless local development.

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
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Google reCAPTCHA Site Key | `6LeIxAcTAAAAAJcZ...` |

4. Click **Save**.

---

## 4. Local Testing

To test locally:
1. Copy `.env.example` to `.env.local` manually:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in your keys in `.env.local`.
3. Start dev server:
   ```bash
   npm run dev
   ```
4. Place an order on `http://localhost:3000/cart`:
   - Complete the reCAPTCHA check.
   - Click **Confirm & Place Factory Order**.
   - Check the admin inbox (`Nanbancrackers0506@gmail.com`) for the instant notification email!
