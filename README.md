# Medical Bill Analyzer

A web application that authenticates and parses medical bills using Google's Gemini AI. It extracts line items, compares prices against CGHS (Central Government Health Scheme) rates, and identifies discrepancies.

## Features
- **Upload Medical Bills**: Supports PDF, JPEG, and PNG formats.
- **AI-Powered Extraction**: Uses Google Gemini Flash 2.5 to parse unstructured bill data.
- **Rate Verification**: Automatically compares extracted prices with standard CGHS rates.
- **Discrepancy Reporting**: Highlights potential overcharges or unrecognized items.

## Tech Stack
- **Frontend**: React (Vite)
- **Backend**: Node.js (Express)
- **AI Integration**: Google Gemini API
- **Styling**: Vanilla CSS

## Prerequisites
- Node.js (v18 or higher)
- Google Cloud API Key for Gemini (`GEMINI_API_KEY`)

## Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/skyruh/Medical-Negotiator-Bill.git
cd medical-bill-app
```

### 2. Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory with your API key:
```env
GEMINI_API_KEY=your_api_key_here
PORT=3000
```
Start the server:
```bash
node server.js
```
The server will run on `http://localhost:3000`.

### 3. Frontend Setup
Open a new terminal, navigate to the client directory, and install dependencies:
```bash
cd client
npm install
```
Start the development server:
```bash
npm run dev
```
The application will open at `http://localhost:5173`.

## Usage
1. Open the frontend URL in your browser.
2. Click "Upload Bill" to select a file.
3. Wait for the AI to analyze the document.
4. Review the extracted items and comparison table.
