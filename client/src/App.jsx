import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import AnalysisResult from './components/AnalysisResult';
import { CITIES } from './constants'; // Import cities
import './index.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [city, setCity] = useState("Delhi"); // Default city

  const handleUploadStart = () => {
    setLoading(true);
    setError(null);
  };

  const handleUploadSuccess = (data) => {
    setLoading(false);
    setResult(data);
  };

  const handleError = (msg) => {
    setLoading(false);
    setError(msg);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="app">
      <header>
        <h1>Medical Bill Analyzer</h1>
        <p>Ensure you pay fair prices by comparing with CGHS rates</p>
      </header>

      {error && (
        <div className="card" style={{ background: '#fee2e2', borderColor: '#f87171', color: '#991b1b', marginBottom: '1rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="loader"></div>
          <p style={{ marginTop: '1rem', fontSize: '1.2rem' }}>Analyzing your bill with AI...</p>
          <p style={{ color: '#6b7280' }}>Testing against rates for <strong>{city}</strong></p>
        </div>
      ) : result ? (
        <AnalysisResult data={result} onReset={handleReset} />
      ) : (
        <>
          <div className="card" style={{ marginBottom: '1rem', padding: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Select Hospital City:
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '1rem'
              }}
            >
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
              * Prices vary based on city (Tier 1 vs Tier 2/3)
            </p>
          </div>

          <FileUpload
            city={city} // Pass city prop
            onUploadStart={handleUploadStart}
            onUploadSuccess={handleUploadSuccess}
            onError={handleError}
          />
        </>
      )}
    </div>
  );
}

export default App;
