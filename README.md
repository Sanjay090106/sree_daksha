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

6. **Deploy** – Render will build and deploy. Your app will be at `https://<your-service>.onrender.com`.

### Blueprint Deploy (Optional)

If your repo has `render.yaml`, use **New** → **Blueprint** and connect the repo. Render creates the service from the blueprint. You’ll still enter secret values in the dashboard.
