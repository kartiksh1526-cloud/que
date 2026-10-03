# JK Quotation System

A quotation management application built with Node.js, Express, SQLite, and a plain HTML/CSS/JavaScript frontend.

## Getting started

Use Node.js 22.13 or later. Node.js 24 LTS is recommended.
Set `APP_PASSWORD` before starting the application; the server will not use a default login password. If `SECRET_KEY` is not set, a secure session key is generated at startup.

```powershell
npm install
$env:APP_PASSWORD = "your-secure-password"
npm start
```

On macOS or Linux, set the password with `export APP_PASSWORD=your-secure-password`.
Then open <http://localhost:3000>.

The app uses Node.js's built-in SQLite API, so SQLite does not require a native build.

## Pages

Sign in → Dashboard → Create or edit a quotation → Preview, print, or export to Word → Quotation history.

Use the theme switch in the navigation bar to change between light and dark mode. Your preference is remembered across pages.

## Configuration

- Company name, address, GSTIN, and default terms: `backend/config.js`
- PDF export: Select **PDF / Print** on the preview page, then choose **Save as PDF** in the browser's print dialog.
- Word export: `backend/controllers/quotationController.js` (uses the `docx` library)
- Database: `backend/database/quotations.db` (copy this file to create a backup)
- Deployment: Set secure `SECRET_KEY` and `APP_PASSWORD` environment variables before deploying to Render, Railway, or another hosting provider.
