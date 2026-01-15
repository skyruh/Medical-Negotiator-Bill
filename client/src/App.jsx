import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import AnalysisResult from './components/AnalysisResult';
import { CITIES } from './constants'; // Import cities
import './index.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(""); // State for progress text
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [city, setCity] = useState("Delhi"); // Default city

  const handleUploadStart = () => {
    setLoading(true);
    setError(null);
    setLoadingStage("Starting Upload...");
  };

  const handleProgress = (msg) => {
    setLoadingStage(msg);
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
        <div className="scan-container">
          <div className="scan-box">
            <div className="scan-line"></div>
            <div className="scan-content-mock">
              <div className="line-mock"></div>
              <div className="line-mock short"></div>
              <div className="line-mock"></div>
              <div className="line-mock"></div>
              <div className="line-mock short"></div>
              <div className="line-mock"></div>
            </div>
          </div>
          <div className="loading-text">
            {loadingStage}
          </div>
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
            onProgress={handleProgress}
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
