import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';

// Lokalni podaci - uvoz JSON datoteke
// Ako koristite Create React App, možete direktno uvesti JSON
// U drugim slučajevima, možda ćete trebati koristiti require ili fetch
import firebaseData from './data/firebase.json';

const App = () => {
  // State management
  const [detectionData, setDetectionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Učitavanje podataka iz lokalne JSON datoteke
  useEffect(() => {
    try {
      // Simuliranje asinkronog učitavanja podataka za dosljednost sučelja
      setTimeout(() => {
        if (firebaseData) {
          setDetectionData(firebaseData);
          setIsLoading(false);
        } else {
          setError('Nema dostupnih podataka u JSON datoteci');
          setIsLoading(false);
        }
      }, 500); // Kratko odgađanje za simulaciju učitavanja
    } catch (err) {
      setError('Greška prilikom čitanja JSON datoteke: ' + err.message);
      setIsLoading(false);
    }
  }, []);

  // Pomoćne komponente za prikazivanje različitih stanja
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

  // Main render
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