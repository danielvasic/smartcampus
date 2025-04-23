import React from 'react';
import '../styles/dashboard.css';
// Font Awesome importi
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSmile,
    faMeh,
    faSurprise,
    faFrown,
    faAngry
} from '@fortawesome/free-solid-svg-icons';

const EmotionChart = ({ data }) => {
    // Mapiranje emocija s API-ja na ikone i imena
    const emotionMapping = {
        happy: { name: 'Zadovoljni', icon: faSmile, color: '#f7a14c' },
        neutral: { name: 'Neutralni', icon: faMeh, color: '#7fb9e6' },
        sad: { name: 'Tužni', icon: faFrown, color: '#7fb9e6' },
        angry: { name: 'Ljuti', icon: faAngry, color: '#7fb9e6' }
    };

    // Izračunaj ukupan broj emocija
    const totalEmotions = data.reduce((acc, item) => acc + item.value, 0);

    // Transformiraj podatke iz API-ja u format koji odgovara komponentama
    const formattedEmotions = data.map(item => {
        const emotion = emotionMapping[item.name.toLowerCase()] || {
            name: 'Ostale emocije',
            icon: faSurprise,
            color: '#7fb9e6'
        };

        // Izračunaj postotak
        const percentage = totalEmotions > 0 ? Math.round((item.value / totalEmotions) * 100) : 0;

        return {
            name: emotion.name,
            value: percentage,
            rawValue: item.value,
            icon: emotion.icon,
            color: emotion.color
        };
    });

    // Ako nema podataka, prikaži poruku
    if (totalEmotions === 0) {
        return (
            <div className="emotion-chart-container">
                <div className="card-title compact">
                    <h2>EMOCIJE POSJETITELJA <br />PRI ULASKU</h2>
                </div>
                <div className="emotions-container compact" style={{ justifyContent: 'center', alignItems: 'center', height: '80%' }}>
                    <p>Nema dostupnih podataka o emocijama.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="emotion-chart-container">
            <div className="card-title compact">
                <h2>EMOCIJE POSJETITELJA <br />PRI ULASKU</h2>
            </div>
            <div className="emotions-container compact">
                {formattedEmotions.map((emotion) => (
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
                        <div className="emotion-count">({emotion.rawValue})</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmotionChart;