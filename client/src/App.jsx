import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import AnalysisResult from './components/AnalysisResult';
import './index.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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
          <p style={{ color: '#6b7280' }}>This may take a few seconds.</p>
        </div>
      ) : result ? (
        <AnalysisResult data={result} onReset={handleReset} />
      ) : (
        <FileUpload
          onUploadStart={handleUploadStart}
          onUploadSuccess={handleUploadSuccess}
          onError={handleError}
        />
      )}
    </div>
  );
}

export default App;
