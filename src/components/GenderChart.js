import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import '../styles/dashboard.css';

const GenderChart = ({ data, colors }) => {
    // Renderiranje labela za pie chart
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${name}`}
            </text>
        );
    };

    return (
        <div className="mostart-card gender-chart">
            <h2>SPOL POSJETITELJA</h2>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            labelLine={false}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="pie-legend">
                    {data.map((entry, index) => (
                        <div key={`legend-${index}`} className="legend-item">
                            <div className="legend-color" style={{ backgroundColor: colors[index % colors.length] }}></div>
                            <div className="legend-text">{entry.name}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GenderChart;