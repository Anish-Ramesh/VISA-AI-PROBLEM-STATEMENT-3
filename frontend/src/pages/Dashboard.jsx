import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import ChatAssistant from '../components/ChatAssistant';
import ScoreSimulator from '../components/ScoreSimulator';
import AnomalyScatterPlot from '../components/AnomalyScatterPlot';

const COLORS = {
    success: '#10b981', // Emerald 500
    warning: '#f59e0b', // Amber 500
    danger: '#ef4444',  // Red 500
    primary: '#6366f1', // Indigo 500
    text: '#1e293b'     // Slate 800
};

const Dashboard = ({ data: initialData, onReset }) => {
    // State for data (allow updates from Compliance Lens)
    const [data, setData] = useState(initialData);
    const [complianceLoading, setComplianceLoading] = useState(false);
    const [framework, setFramework] = useState("");

    const { scores, metadata, analysis, anomalies, impacts } = data;

    // --- Compliance Lens Logic ---
    const handleFrameworkChange = async (e) => {
        const newFramework = e.target.value;
        setFramework(newFramework);

        if (!newFramework) return; // Default view (original analysis)

        setComplianceLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/compliance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scores: scores,
                    metadata: metadata,
                    framework: newFramework
                })
            });

            if (!res.ok) throw new Error("Compliance check failed");

            const newAnalysis = await res.json();

            // Update only the analysis part of the state
            setData(prev => ({
                ...prev,
                analysis: newAnalysis
            }));

        } catch (err) {
            console.error(err);
            alert("Failed to run compliance check: " + err.message);
        } finally {
            setComplianceLoading(false);
        }
    };

    // Prepare chart data
    const dimensionData = Object.entries(scores.dimension_scores).map(([key, value]) => ({
        name: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        score: value
    }));

    const healthColor = scores.health_score > 70 ? COLORS.success : scores.health_score > 50 ? COLORS.warning : COLORS.danger;

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }} className="animate-fade-in">
            {/* Header / Actions */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '3rem',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid rgba(0,0,0,0.05)'
            }}>
                <div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.03em' }}>
                        <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Fin</span>AUDIT
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            📄 <strong>{data.filename}</strong>
                        </span>
                        <span style={{ opacity: 0.3 }}>|</span>
                        <span>{metadata.total_rows?.toLocaleString()} Rows</span>
                        <span style={{ opacity: 0.3 }}>|</span>
                        <span>{metadata.total_columns} Columns</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {/* Compliance Lens Dropdown */}
                    <div className="card" style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', borderRadius: '12px' }}>
                        <span style={{ fontSize: '1.2rem' }}>🛡️</span>
                        <div style={{ position: 'relative' }}>
                            <label style={{ position: 'absolute', top: '-8px', left: '0', fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Framework</label>
                            <select
                                value={framework}
                                onChange={handleFrameworkChange}
                                disabled={complianceLoading}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    fontSize: '0.95rem',
                                    fontWeight: 700,
                                    color: '#334155',
                                    outline: 'none',
                                    cursor: 'pointer',
                                    paddingTop: '0.5rem',
                                    minWidth: '140px'
                                }}
                            >
                                <option value="">Standard Audit</option>
                                <option value="PCI-DSS">PCI-DSS (Payments)</option>
                                <option value="GDPR">GDPR (Privacy)</option>
                                <option value="SOX">SOX (Financial)</option>
                                <option value="AML">AML (Anti-Money Laundering)</option>
                            </select>
                        </div>
                        {complianceLoading && <span style={{ animation: 'spin 1s linear infinite' }}>⟳</span>}
                    </div>

                    <button onClick={onReset} className="btn btn-outline" style={{ height: '56px', borderRadius: '12px' }}>
                        <span>⚡</span> New
                    </button>
                </div>
            </header>

            {/* KPI Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem', marginBottom: '2rem' }}>

                {/* Health Score Widget */}
                <div className="card" style={{ gridColumn: 'span 4', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: healthColor }}></div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '5rem', fontWeight: 800, color: healthColor, lineHeight: 1, letterSpacing: '-0.05em' }}>
                            {scores.health_score}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.5rem' }}>
                            Data Health Score
                        </div>
                    </div>
                </div>

                {/* Dimensions Chart Widget */}
                <div className="card" style={{ gridColumn: 'span 8', padding: '1.5rem 2rem' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                        Quality Dimensions
                    </h3>
                    <div style={{ height: '140px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dimensionData} layout="vertical" margin={{ left: 0, top: 5, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={140}
                                    tick={{ fontSize: 13, fontWeight: 600, fill: '#475569' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24} animationDuration={1000}>
                                    {dimensionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.score > 80 ? COLORS.success : entry.score > 50 ? COLORS.warning : COLORS.danger} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Advanced Tools Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem', marginBottom: '2rem' }}>
                {/* What-If Simulator */}
                <div style={{ gridColumn: 'span 5' }}>
                    <ScoreSimulator
                        scores={scores}
                        ruleResults={scores.rule_results}
                        impacts={impacts}
                    />
                </div>

                {/* Visual Forensics */}
                <div style={{ gridColumn: 'span 7' }}>
                    <AnomalyScatterPlot anomalies={anomalies} />
                </div>
            </div>

            {/* Analysis & Chat Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 5fr)', gap: '2rem', marginBottom: '3rem' }}>

                {/* Advisory Report */}
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{
                        background: 'linear-gradient(to right, #f8fafc, white)',
                        padding: '1.5rem 2rem',
                        borderBottom: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <div style={{ background: 'var(--gradient-primary)', borderRadius: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(99, 102, 241, 0.3)' }}>
                            <span style={{ color: 'white', fontSize: '1.2rem' }}>✨</span>
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>AI Advisory Report</h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                                {framework ? `Generated for ${framework} Framework` : "General Audit Assessment"}
                            </p>
                        </div>
                    </div>

                    <div style={{ padding: '2rem' }}>
                        {complianceLoading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '1rem', minHeight: '300px' }}>
                                <div style={{ fontSize: '2rem', animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }}>⟳</div>
                                <p style={{ color: '#64748b' }}>Consulting GenAI Agent...</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

                                {/* Executive Summary */}
                                <div>
                                    <h4 style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Executive Summary</h4>
                                    <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: '#334155', fontWeight: 400 }}>
                                        {analysis.executive_summary || "Analysis unavailable."}
                                    </p>
                                </div>

                                {/* Risk Block */}
                                <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '12px', padding: '1.5rem' }}>
                                    <h4 style={{ color: '#9f1239', fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span>⚠️</span> Critical Risk Assessment
                                    </h4>
                                    <p style={{ color: '#881337', margin: 0, lineHeight: 1.5 }}>
                                        {analysis.risk_assessment}
                                    </p>
                                </div>

                                {/* Action Plan */}
                                <div>
                                    <h4 style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Recommended Actions</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {[...(analysis.remediation_steps || [])]
                                            .sort((a, b) => {
                                                const pMap = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
                                                const pA = a.priority ? pMap[a.priority.toUpperCase()] ?? 99 : 99;
                                                const pB = b.priority ? pMap[b.priority.toUpperCase()] ?? 99 : 99;
                                                return pA - pB;
                                            })
                                            .map((step, idx) => {
                                                const priority = step.priority?.toUpperCase() || 'DEFAULT';
                                                const priorityStyles = {
                                                    'CRITICAL': { bg: '#fff1f2', text: '#be123c', border: '#fda4af' },
                                                    'HIGH': { bg: '#fff7ed', text: '#c2410c', border: '#fdba74' },
                                                    'MEDIUM': { bg: '#fefce8', text: '#a16207', border: '#fde047' },
                                                    'LOW': { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
                                                    'DEFAULT': { bg: '#f8fafc', text: '#64748b', border: '#cbd5e1' },
                                                };
                                                const style = priorityStyles[priority] || priorityStyles['DEFAULT'];

                                                return (
                                                    <div key={idx} style={{
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        gap: '1rem',
                                                        padding: '1rem',
                                                        background: 'white',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '10px',
                                                        transition: 'transform 0.2s',
                                                    }}
                                                        onMouseEnter={e => e.currentTarget.style.borderColor = style.border}
                                                        onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                                    >
                                                        <div style={{
                                                            background: style.bg,
                                                            color: style.text,
                                                            border: `1px solid ${style.border}`,
                                                            padding: '0.3rem 0.6rem',
                                                            borderRadius: '6px',
                                                            fontSize: '0.7rem',
                                                            fontWeight: '800',
                                                            letterSpacing: '0.05em',
                                                            minWidth: '70px',
                                                            textAlign: 'center',
                                                            marginTop: '0.1rem'
                                                        }}>
                                                            {priority}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.3rem', fontSize: '0.95rem' }}>{step.issue}</div>
                                                            <div style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>{step.action}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Panel */}
                <div style={{ height: '100%', minHeight: '600px' }}>
                    <ChatAssistant context={data} />
                </div>
            </div>

            {/* Rule Table */}
            <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.5)' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Detailed Rule Breakdown</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '1.2rem 2rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Rule Name</th>
                                <th style={{ textAlign: 'left', padding: '1.2rem 2rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Status</th>
                                <th style={{ textAlign: 'left', padding: '1.2rem 2rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Score</th>
                                <th style={{ textAlign: 'left', padding: '1.2rem 2rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(scores.rule_results).map(([key, result], idx) => (
                                <tr key={key} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : 'rgba(248, 250, 252, 0.5)' }}>
                                    <td style={{ padding: '1.2rem 2rem', fontWeight: 600, color: '#334155' }}>
                                        {key}
                                    </td>
                                    <td style={{ padding: '1.2rem 2rem' }}>
                                        {result.passed ? (
                                            <span style={{ background: '#dcfce7', color: '#166534', padding: '0.35rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid #bbf7d0' }}>PASS</span>
                                        ) : (
                                            <span style={{ background: '#fee2e2', color: '#991b1b', padding: '0.35rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid #fecaca' }}>FAIL</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1.2rem 2rem', fontFamily: 'JetBrains Mono', fontWeight: 500 }}>
                                        {result.score ? result.score.toFixed(1) : '-'}
                                    </td>
                                    <td style={{ padding: '1.2rem 2rem', color: '#64748b', maxWidth: '350px', lineHeight: 1.5 }}>
                                        {result.details}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Dashboard;
