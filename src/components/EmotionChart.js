import React from 'react';
import '../styles/dashboard.css';
// Font Awesome importi
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSmile,
    faMeh,
    faSurprise,
    faFrown
} from '@fortawesome/free-solid-svg-icons';

const EmotionChart = () => {
    // Podaci o emocijama prema slici
    const emotions = [
        { name: 'Zadovoljni', value: 78, icon: faSmile, color: '#f7a14c' },
        { name: 'Neutralni', value: 14, icon: faMeh, color: '#7fb9e6' },
        { name: 'Iznenađeni', value: 4, icon: faSurprise, color: '#7fb9e6' },
        { name: 'Ostale emocije', value: 4, icon: faFrown, color: '#7fb9e6' }
    ];

    return (
        <div className="emotion-chart-container">
            <div className="card-title compact">
                <h2>EMOCIJE POSJETITELJA <br />PRI ULASKU</h2>
            </div>
            <div className="emotions-container compact">
                {emotions.map((emotion) => (
                    <div className="emotion-item" key={emotion.name}>
                        <FontAwesomeIcon
                            icon={emotion.icon}
                            className="emotion-icon"
                            style={{ color: emotion.color }}
                            size="2x"
                        />
                        <div
                            className="emotion-percentage"
                            style={{
                                color: emotion.color,
                                fontSize: emotion.value > 20 ? '2.5rem' : '2.5rem',
                                fontWeight: 'bold',
                                lineHeight: 1
                            }}
                        >
                            {emotion.value}%
                        </div>
                        <div className="emotion-label">{emotion.name}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmotionChart;