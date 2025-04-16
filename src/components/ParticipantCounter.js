import React from 'react';
import '../styles/dashboard.css';

const ParticipantCounter = ({ totalPersons }) => {
  return (
    <div className="mostart-card total-count">
      <h2>TRENUTNI BROJ SUDIONIKA</h2>
      <div className="big-number">{totalPersons}</div>
    </div>
  );
};

export default ParticipantCounter;