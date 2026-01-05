import React, { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AnomalyScatterPlot = ({ anomalies }) => {
    const columns = Object.keys(anomalies || {});
    const [selectedCol, setSelectedCol] = useState(columns[0] || "");

    if (!anomalies || columns.length === 0) {
        return (
            <div className="card h-full flex-center" style={{ color: '#94a3b8', fontStyle: 'italic', minHeight: '300px' }}>
                No numeric data available for forensic analysis.
            </div>
        );
    }

    const currentData = anomalies[selectedCol];
    const plotData = currentData?.plot_data || [];

    // Custom Tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{ background: 'rgba(255, 255, 255, 0.9)', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>Row #{data.id}</p>
                    <p style={{ margin: 0 }}>Value: {data.value}</p>
                    <p style={{ margin: 0, color: data.isAnomaly ? '#ef4444' : '#64748b' }}>
                        {data.isAnomaly ? `⚠️ Anomaly (Z=${data.zScore.toFixed(2)})` : `Normal (Z=${data.zScore.toFixed(2)})`}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="card h-full" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📉 Visual Forensics (Outliers)
                    </h3>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        Red points indicate statistical anomalies (Z-Score > 3).
                    </p>
                </div>

                <select
                    value={selectedCol}
                    onChange={(e) => setSelectedCol(e.target.value)}
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-bg-app)',
                        fontSize: '0.9rem',
                        outline: 'none'
                    }}
                >
                    {columns.map(col => (
                        <option key={col} value={col}>{col}</option>
                    ))}
                </select>
            </div>

            <div style={{ flex: 1, minHeight: '300px', padding: '1rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                        <XAxis type="number" dataKey="id" name="Row Index" unit="" stroke="#94a3b8" fontSize={12} tickCount={5} />
                        <YAxis type="number" dataKey="value" name="Value" unit="" stroke="#94a3b8" fontSize={12} />
                        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter name="Data Points" data={plotData} fill="#8884d8">
                            {plotData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.isAnomaly ? '#ef4444' : '#6366f1'} />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>

                {/* Stats Footer */}
                <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                    <div>Mean: <strong>{currentData.mean.toFixed(2)}</strong></div>
                    <div>StdDev: <strong>{currentData.std.toFixed(2)}</strong></div>
                    <div style={{ color: currentData.count > 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                        {currentData.count} Anomalies Detected
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnomalyScatterPlot;
