<div align="center">

# 🏥 MedBill AI
### *Your Personal Medical Bill Auditor & Negotiator*

![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Powered%20By-Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![Hackathon](https://img.shields.io/badge/Status-Hackathon%20Ready-success?style=for-the-badge)

<p align="center">
  <img src="https://via.placeholder.com/800x400?text=MedBill+AI+Demo+Dashboard" alt="MedBill AI Dashboard" />
</p>

</div>

---

## 😤 The Problem
Medical billing is complex, opaque, and often riddled with errors. Patients frequently overpay because they can't verify:
1.  **Complexity**: Medical codes (CPT/ICD) are intentionally confusing.
2.  **Opacity**: Prices vary wildly between hospitals for the *same* procedure.
3.  **Errors**: Up to **80%** of medical bills contain errors or overcharges.

## 💡 The Solution
**MedBill AI** is an intelligent agent that fights for your financial health. By leveraging **Google's Gemini 2.5 Flash**, it parses your complex medical bills, cross-references line items with standardized government (CGHS) rates, and instantly flags discrepancies.

> **"Don't just pay it. Verify it."**

---

## ✨ Key Features

*   **📄 Universal Parsing**: Upload any medical bill (PDF, JPG, PNG) – even scanned or crumped ones.
*   **🧠 Gemini-Powered Intelligence**: Uses advanced vision + text multimodal AI to extract line items with high precision.
*   **⚖️ Rate Benchmarking**: Automatically compares charged amounts against the **Central Government Health Scheme (CGHS)** rate card.
*   **🚩 Discrepancy Detection**: Instantly highlights potential overcharges in a clear, easy-to-read report.
*   **🔒 Privacy First**: Your data is processed securely.

---

## 🏗️ Tech Stack

*   **Frontend**: React (Vite) – *Fast, responsive UI.*
*   **Backend**: Node.js (Express) – *Robust API handling.*
*   **AI Engine**: Google Gemini API (gemini-2.5-flash) – *The brain behind the parsing.*
*   **Styling**: Vanilla CSS – *Clean, custom, lightweight.*

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

1.  **Upload**: User drags & drops a hospital bill.
2.  **Analyze**: System sends file to backend -> Gemini AI extracts structural data + prices.
3.  **Verify**: Backend compares extracted prices with `super_speciality_rates.json`.
4.  **Report**: Frontend displays a "Flagged Items" table showing the difference between *Billed Amount* and *Fair Rate*.

---

## 👥 Contributors

Built with ❤️ for better healthcare transparency.

*   [Skyruh](https://github.com/skyruh) - **Project Lead & AI Engineer** 🧠
*   [gauranshi1707](https://github.com/gauranshi1707) - **Frontend Architect** 🎨
*   [VanshikaTiwari11](https://github.com/VanshikaTiwari11) - **UI/UX Designer** ✨
*   [codewithsuhanii](https://github.com/codewithsuhanii) - **Backend Specialist** ⚙️
*   [YOUR_NAME_HERE](https://github.com/yourusername) - **Research & QA** 🔍

---
<div align="center">
  <sub>Built for the Google AI Hackathon 2026.</sub>
</div>
