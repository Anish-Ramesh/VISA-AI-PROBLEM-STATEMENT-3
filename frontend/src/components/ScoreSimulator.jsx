import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell } from 'recharts';

const ScoreSimulator = ({ scores, ruleResults, impacts }) => {
    // Filter failed rules that have impact data
    const failedRules = Object.entries(ruleResults)
        .filter(([key, res]) => !res.passed && impacts[key])
        .map(([key, res]) => ({
            key,
            description: res.details,
            impact: impacts[key] || 0
        }));

    const [fixes, setFixes] = useState({});

    // Initial health score
    const baseScore = scores.health_score;

    // Calculate simulated score
    const simulatedIncrease = Object.keys(fixes)
        .filter(k => fixes[k])
        .reduce((sum, k) => sum + (impacts[k] || 0), 0);

    const finalScore = Math.min(100, Math.round(baseScore + simulatedIncrease));

    const toggleFix = (ruleKey) => {
        setFixes(prev => ({
            ...prev,
            [ruleKey]: !prev[ruleKey]
        }));
    };

    // Gauge Data
    const data = [
        { name: 'Score', value: finalScore },
        { name: 'Remaining', value: 100 - finalScore }
    ];

    const COLORS = [finalScore > 70 ? '#10b981' : finalScore > 50 ? '#f59e0b' : '#ef4444', '#e2e8f0'];

    return (
        <div className="card h-full" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🎛️ "What-If" Simulator
                </h3>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    Toggle fixes to see health score impact.
                </p>
            </div>

            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Gauge */}
                <div style={{ position: 'relative', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PieChart width={200} height={160}>
                        <Pie
                            data={data}
                            cx={100}
                            cy={100}
                            startAngle={180}
                            endAngle={0}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index]} stroke="none" />
                            ))}
                        </Pie>
                    </PieChart>
                    <div style={{ position: 'absolute', top: '90px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: COLORS[0], lineHeight: 1 }}>{finalScore}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Projected</div>
                    </div>
                </div>

                {/* Toggles */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: '300px' }}>
                    {failedRules.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#64748b', fontStyle: 'italic', padding: '1rem' }}>
                            No failed rules to simulate!
                        </div>
                    )}

                    {failedRules.map((rule) => {
                        const isFixed = fixes[rule.key];
                        return (
                            <div key={rule.key}
                                onClick={() => toggleFix(rule.key)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.75rem 1rem',
                                    background: isFixed ? 'rgba(16, 185, 129, 0.05)' : 'white',
                                    border: `1px solid ${isFixed ? '#10b981' : '#e2e8f0'}`,
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ flex: 1, marginRight: '1rem' }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                                        {rule.key}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                                        {rule.description}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        color: isFixed ? '#10b981' : '#64748b',
                                        fontWeight: 700,
                                        fontSize: '0.8rem',
                                        background: isFixed ? '#ecfdf5' : '#f1f5f9',
                                        padding: '2px 8px',
                                        borderRadius: '12px'
                                    }}>
                                        +{Math.round(rule.impact)} pts
                                    </div>

                                    {/* Toggle Switch Visual */}
                                    <div style={{
                                        width: '36px',
                                        height: '20px',
                                        background: isFixed ? '#10b981' : '#cbd5e1',
                                        borderRadius: '20px',
                                        position: 'relative',
                                        transition: 'background 0.2s'
                                    }}>
                                        <div style={{
                                            width: '16px',
                                            height: '16px',
                                            background: 'white',
                                            borderRadius: '50%',
                                            position: 'absolute',
                                            top: '2px',
                                            left: isFixed ? '18px' : '2px',
                                            transition: 'left 0.2s',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                        }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ScoreSimulator;
