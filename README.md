# PDF Text Extractor

A Next.js application that extracts text from PDF documents using their URLs.

## Features

- Simple and intuitive user interface
- Extract text from any accessible PDF via URL
- Real-time text extraction and display
- Error handling for invalid URLs or inaccessible PDFs
- Responsive design for desktop and mobile devices

## Technology Stack

- **Frontend**: Next.js with TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **PDF Processing**: poppler-utils (pdftotext)
- **Deployment**: Vercel-compatible

## How It Works

1. User enters a PDF URL in the input field
2. Application fetches the PDF from the provided URL
3. Backend processes the PDF using pdftotext from poppler-utils
4. Extracted text is returned to the frontend and displayed to the user

## Project Structure

- `src/app/page.tsx`: Main frontend component with the PDF URL input form
- `src/app/api/extract-pdf/route.ts`: API endpoint for PDF text extraction
- `src/app/layout.tsx`: Main layout component
- `src/app/globals.css`: Global styles

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Ensure poppler-utils is installed on your system:
   ```
   sudo apt-get install poppler-utils
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Usage

1. Open the application in your browser
2. Enter a PDF URL in the input field
3. Click "Extract Text"
4. View the extracted text below

## Deployment

This application can be deployed to any platform that supports Next.js applications, such as Vercel or Netlify. Make sure the deployment environment has poppler-utils installed.

## License

MIT
