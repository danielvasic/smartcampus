import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/dashboard.css';

const AttendanceChart = ({ data }) => {
  // Make sure data exists before rendering
  if (!data || data.length === 0) {
    return (
      <div className="mostart-card attendance-chart">
        <h2>STATISTIKA POSJEĆENOSTI AMFITEATRA PO DANIMA</h2>
        <div className="chart-container">
          <p className="no-data-message">Nema dostupnih podataka</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mostart-card attendance-chart">
      <h2>STATISTIKA POSJEĆENOSTI AMFITEATRA PO DANIMA</h2>
      <div className="chart-container-fixed">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 20, left: 10, bottom: 25 }}
            barSize={40} 
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }} 
              height={50}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                borderColor: '#ddd',
                borderRadius: '5px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                fontSize: '13px'
              }}
              formatter={(value) => [`${value}`, '']}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              height={20}
            />
            <Bar 
              dataKey="person" 
              name="Osobe" 
              fill="#F8A65D"
              radius={[3, 3, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendanceChart;