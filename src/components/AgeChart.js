// AgeChart.js - Ažurirana verzija
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import '../styles/dashboard.css';

const AgeChart = ({ data, colors }) => {
    // Renderiranje labela za pie chart

    return (
        <div className="mostart-card age-chart">
            <h2>DOB POSJETITELJA</h2>
            <div className="chart-container" style={{ height: '300px' }}>
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
                                <Cell
                                    key={`cell-${index}`}
                                    fill={colors[index % colors.length]}
                                />
                            ))}
                        </Pie>
                        <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            wrapperStyle={{ paddingLeft: '20px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
export default AgeChart;