<div align="center">

# 🏥 MedBill AI
### *Your Personal Medical Bill Auditor & Negotiator*

![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Powered%20By-Google%20Gemini%202.0-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![Hackathon](https://img.shields.io/badge/Status-Hackathon%20Ready-success?style=for-the-badge)

<p align="center">
  <img src="https://via.placeholder.com/800x400?text=MedBill+AI+Dashboard+v2.0" alt="MedBill AI Dashboard" />
</p>

</div>

---

## 😤 The Problem
Medical billing is complex, opaque, and often riddled with errors. Patients frequently overpay because they can't verify:
1.  **Complexity**: Medical codes (CPT/ICD) are intentionally confusing.
2.  **Opacity**: Prices vary wildly between hospitals, often exceeding government caps.
3.  **Errors**: Up to **80%** of medical bills contain errors or overcharges.

## 💡 The Solution
**MedBill AI** is an intelligent agent that fights for your financial health. By leveraging **Google's Gemini 2.5 Flash**, it parses your complex medical bills, cross-references line items with standardized government (CGHS) rates, and instantly flags discrepancies.

> **"Don't just pay it. Verify it."**

---

## ✨ Key Features

### 🧠 **AI-Powered Analysis**
*   **Multimodal Parsing**: Upload any bill (PDF, JPG, PNG) – our AI reads it like a human, handling crumped papers and low-light scans.
*   **Real-Time Streaming**: Watch the analysis happen live. No more "loading spinners" – status updates stream directly from the AI brain to your screen.

### 💰 **Smart Savings & Calculations**
*   **Tier-Based Pricing**: Automatically adjusts rates based on the hospital's city (Tier 1 vs Tier 2/3) to ensure 100% accurate benchmarking.
*   **"Fair Bill Amount"**: We don't just show you the discrepancy; we calculate exactly what you *should* have paid.
*   **Visual Savings Chart**: A dynamic horizontal bar chart visually demonstrates how much of your bill is "Fair" vs "Overcharge".

### 🎨 **Premium Experience**
*   **Modern Glassmorphism UI**: A beautiful, translucent interface designed to look professional and trustworthy.
*   **Dynamic Edit Mode**: AI make a mistake? No problem. Edit line items or change the city directly in the UI and watch the savings recalcluate instantly.

---

## 🏗️ Tech Stack

*   **Frontend**: React (Vite) + Glassmorphism CSS
*   **Backend**: Node.js (Express) with NDJSON Streaming
*   **AI Engine**: Google Gemini API (`gemini-2.5-flash`)
*   **Database**: JSON-based CGHS Rate Card (Fast In-Memory Lookup)

---

## 🚀 Getting Started

Follow these steps to get MedBill AI running locally in minutes!

### Prerequisites
*   Node.js (v18+)
*   A Google Cloud API Key with access to Gemini API (`GEMINI_API_KEY`)

### 1. Clone the Repo
```bash
git clone https://github.com/skyruh/Medical-Negotiator-Bill
cd medical-bill-app
```

### 2. 🔥 Backend Setup
Navigate to the server folder and fire it up.

```bash
cd server
npm install
```

**Configure Environment:**
Create a `.env` file in the `server` directory:

```env
GEMINI_API_KEY=your_actual_api_key_here
PORT=3000
```

**Start Server:**
```bash
node server.js
```
*Server runs on `http://localhost:3000`*

### 3. 🎨 Frontend Setup
Open a new terminal and launch the client.

```bash
cd client
npm install
npm run dev
```
*Client opens at `http://localhost:5173`*

---

## 📸 How It Works

1.  **Select City**: Choose the city where treatment occurred to get accurate Tier rates.
2.  **Upload**: Drag & drop your hospital bill.
3.  **Real-Time Scan**: Watch the AI "Scan" your document and match items.
4.  **Review Report**: See the "Fair Price" vs "Billed Price" graph.
5.  **Edit & Recalculate**: Correct any details if needed and see new savings immediately.

---

## 👥 Contributors

Built with ❤️ for better healthcare transparency.

*   [Skyruh](https://github.com/skyruh) 
*   [gauranshi1707](https://github.com/gauranshi1707) 
*   [VanshikaTiwari11](https://github.com/VanshikaTiwari11)
*   [codewithsuhanii](https://github.com/codewithsuhanii) 
*   [07arnavjain-collab](https://github.com/07arnavjain-collab)

---
<div align="center">
  <sub>Built for the Innovate 3.0 AI Hackathon 2026.</sub>
</div>
