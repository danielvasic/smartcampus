import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';

const App = () => {
  const [detectionData, setDetectionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/data/firebase.json`);
        if (!response.ok) {
          throw new Error('Neuspješno dohvaćanje podataka');
        }
        const data = await response.json();
        setDetectionData(data);
      } catch (err) {
        setError('Greška prilikom učitavanja: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const renderLoading = () => (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Učitavanje podataka...</p>
    </div>
  );

  const renderError = () => (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <p>Greška: {error}</p>
      <button
        className="retry-button"
        onClick={() => window.location.reload()}
      >
        Pokušaj ponovno
      </button>
    </div>
  );

  const renderContent = () => (
    <Dashboard detectionData={detectionData} />
  );

  return (
    <div className="mostart-app">
      <header className="mostart-header">
        <div className="header-logo">
          <img
            src="assets/mostart-logo.png"
            alt="MoStart Logo"
            className="mostart-logo"
            width={400}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
        </div>
        <div className="header-title">
          <h1>23-25 / 4 / 2025</h1>
        </div>
      </header>
      <main className="mostart-content">
        {isLoading
          ? renderLoading()
          : error
            ? renderError()
            : renderContent()
        }
      </main>
    </div>
  );
};

export default App;
