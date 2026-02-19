# Payroll PDF Distribution System

A web application that distributes payslips by splitting a master payroll PDF into individual pages and emailing each employee their payslip automatically.

## Overview

This lets you upload a single master PDF containing all employee payslips. The system splits it page-by-page, extracts employee email addresses from the text on each page, and sends individual payslips to each employee via email using Brevo (Sendinblue).

## Features

- **Master PDF Upload** – Upload one multi-page PDF (one page per employee)
- **Automatic Page Splitting** – Each page becomes a separate PDF attachment
- **Email Extraction** – Parses employee email addresses from the PDF text
- **Automated Email Delivery** – Sends payslips via Brevo transactional email API
- **Authentication** – Simple login protection (single user)
- **Pay Month Detection** – Extracts month from filename or uses manual input for attachment naming

## Tech Stack

- **Backend:** Node.js, Express
- **PDF:** pdf-lib (splitting), pdf-parse (text extraction)
- **Email:** Brevo (Sendinblue) API
- **Auth:** express-session
- **Frontend:** HTML, Tailwind CSS, vanilla JavaScript

## Setup

### Prerequisites

- Node.js (v18+)
- A Brevo account and API key

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root with:

```env
PORT=3000
NODE_ENV=development

# Brevo (Sendinblue) - for sending emails
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your@email.com
BREVO_SENDER_NAME="Your Company Payroll"
COMPANY_NAME="Your Company"

# Authentication
AUTH_EMAIL=admin@example.com
AUTH_PASSWORD=your_password
SESSION_SECRET=random-secret-string-for-sessions
```

### Run

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Sign in with the configured email and password
2. Upload the master payroll PDF (one page per employee)
3. The system splits the PDF, extracts emails from each page, and sends individual payslips
4. View the summary of sent and failed emails

## Project Structure

```
├── server.js              # Express app entry point
├── public/
│   ├── index.html         # Upload page
│   └── login.html         # Login page
├── src/
│   ├── config/
│   │   └── config.js      # Environment config
│   ├── routes/
│   │   └── upload.js      # Upload API
│   └── services/
│       ├── emailService.js # Brevo email sending
│       └── pdfService.js   # PDF split & text extraction
└── .env                   # Environment variables (not in git)
```
