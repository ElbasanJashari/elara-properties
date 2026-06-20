# Elara Properties Lead Generation Website

Production-ready lead capture website for Dubai real estate buyers. Vercel serves the static frontend directly and runs `/api/leads` as a Serverless Function that saves submissions to Google Sheets through the Google Sheets API.

## Structure

- `index.html` - landing page markup
- `css/styles.css` - responsive luxury-style layout
- `js/main.js` - form handling that posts to `/api/leads`
- `images/` - static image assets
- `api/leads.js` - Vercel Serverless Function for lead submissions
- `src/googleSheets.js` - Google Sheets API integration
- `package.json` - Node.js dependencies and scripts
- `vercel.json` - Vercel function settings only
- `.env.example` - required environment variables

There is intentionally no `server.js`. On Vercel, static files at the project root are served as static assets, and files in `api/` become Serverless Functions.

## API

`POST /api/leads`

Expected JSON:

```json
{
  "name": "Jane Buyer",
  "email": "jane@example.com",
  "whatsapp": "+491600000000",
  "budget": "EUR 500k",
  "purpose": "rent"
}
```

Successful response:

```json
{ "success": true }
```

## Google Sheets Setup

1. Create a Google Cloud project.
2. Enable the Google Sheets API.
3. Create a service account.
4. Create a service account key and copy the private key and client email.
5. Create a Google Sheet with a tab named `Leads`.
6. Add a header row:

```text
Submitted At | Name | Email | WhatsApp | Budget | Purpose
```

7. Share the Google Sheet with the service account email as an editor.

## Environment Variables

Copy `.env.example` to `.env` for local development:

```bash
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_SHEET_RANGE=Leads!A:F
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
```

All Google credentials must come from environment variables. Do not commit `.env`.

## Local Development

```bash
npm install
npm run dev
```

`npm run dev` expects the Vercel CLI. It serves `index.html`, `css/`, `js/`, and `images/` as static files, while `/api/leads` runs as a local Serverless Function.

## Deploy on Vercel

1. Deploy this folder as the Vercel project root.
2. Do not set a custom output directory or custom server start command.
3. Add these environment variables in Vercel Project Settings:

```text
GOOGLE_SHEET_ID
GOOGLE_SHEET_RANGE
GOOGLE_SERVICE_ACCOUNT_EMAIL
GOOGLE_PRIVATE_KEY
```

4. Paste `GOOGLE_PRIVATE_KEY` with escaped newlines (`\n`) or as a quoted multiline value. The backend normalizes escaped newlines automatically.
5. Deploy.

After deployment:

- `/js/main.js` should return JavaScript.
- `/css/styles.css` should return CSS.
- `/images/hero.jpg` should return an image.
- `/api/leads` should accept `POST` requests and return `{ "success": true }` when Google Sheets accepts the row.

## Launch Notes

- Replace the placeholder WhatsApp numbers in `index.html`.
- The frontend submits to `/api/leads`.
- The API returns validation errors with HTTP 400 and Google Sheets failures with HTTP 500.
