# Medical Bill Analyzer

## How to Run

### Option 1: One-Click Start
Double-click the **`start_app.bat`** file on your Desktop. 
This will open two terminal windows (one for backend, one for frontend).

### Option 2: Manual Start
You need two terminals:

**Terminal 1 (Backend):**
```bash
cd medical-bill-app/server
npm start
```
(Runs on http://localhost:3000)

**Terminal 2 (Frontend):**
```bash
cd medical-bill-app/client
npm run dev
```
(Runs on http://localhost:5173)

---

## Usage
1. Open http://localhost:5173 in your browser.
2. Upload a medical bill (PDF or Image).
3. View the analysis and CGHS rate comparison.
