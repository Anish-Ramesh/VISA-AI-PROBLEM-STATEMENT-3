import ChatAssistant from '../components/ChatAssistant';
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

// Premium Palette Colors
const COLORS = {
    primary: '#6366f1',
    secondary: '#ec4899',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4'
};
const CHART_COLORS = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.danger, COLORS.info];

const Dashboard = ({ data, onReset }) => {
    const { scores, metadata, analysis } = data;

    // Transform dimension scores for chart
    const dimData = Object.keys(scores.dimension_scores).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        score: scores.dimension_scores[key]
    }));

    const healthData = [
        { name: 'Health', value: scores.health_score },
        { name: 'Gap', value: 100 - scores.health_score }
    ];

    return (
        <div className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
            {/* Header Section */}
            <div className="flex-between" style={{ marginBottom: '3rem' }}>
                <div>
                    <h1>Compliance Analysis</h1>
                    <p style={{ fontSize: '1.1rem' }}>
                        Report for <span style={{ color: COLORS.primary, fontWeight: 600 }}>{data.filename}</span>
                    </p>
                </div>
                <button onClick={onReset} className="btn btn-outline" style={{ background: 'white' }}>
                    <span>⚡</span> Analyze New File
                </button>
            </div>

            {/* Attestation Banner (Featured) */}
            {data.provenance && (
                <div className="card" style={{
                    marginBottom: '3rem',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
                    borderColor: COLORS.success
                }}>
                    <div className="flex-between">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{
                                fontSize: '2.5rem',
                                background: 'white',
                                width: '60px',
                                height: '60px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)'
                            }}>🔒</div>
                            <div>
                                <h3 style={{ margin: 0, color: '#064e3b', fontSize: '1.25rem' }}>Cryptographically Verified</h3>
                                <p style={{ margin: 0, color: '#065f46' }}>
                                    Signed by System Root Key • {new Date(data.provenance.timestamp).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: '#065f46', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Immutable Fingerprint</div>
                            <code style={{ background: 'rgba(255,255,255,0.8)', padding: '0.4rem 0.8rem', borderRadius: '6px', color: COLORS.primary, border: '1px solid rgba(16,185,129,0.3)' }}>
                                {data.provenance.fingerprint.substring(0, 24)}...
                            </code>
                        </div>
                    </div>
                </div>
            )}

            {/* Key Metrics Grid */}
            <div className="grid-cols-3" style={{ marginBottom: '3rem' }}>

                {/* Overall Health Card */}
                <div className="card flex-center" style={{ flexDirection: 'column', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', fontWeight: 600, color: COLORS.primary }}>Overall Score</div>
                    <div style={{ width: '100%', height: 220, marginTop: '1rem' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={healthData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    startAngle={90}
                                    endAngle={450}
                                >
                                    <Cell fill={scores.health_score > 70 ? COLORS.success : COLORS.warning} />
                                    <Cell fill="#f1f5f9" />
                                </Pie>
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                                    <tspan x="50%" dy="-0.5em" fontSize="2.5rem" fontWeight="800" fill={COLORS.primary}>
                                        {scores.health_score}
                                    </tspan>
                                    <tspan x="50%" dy="1.6em" fontSize="0.875rem" fill="#94a3b8" fontWeight="500">
                                        / 100 HEALTH
                                    </tspan>
                                </text>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Dimension Breakdown */}
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Quality Dimensions</h3>
                    <div style={{ width: '100%', height: 220 }}>
                        <ResponsiveContainer>
                            <BarChart data={dimData} layout="vertical" margin={{ left: 20, right: 20, bottom: 0 }}>
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 13, fontWeight: 500, fill: '#475569' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                                    {dimData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.score > 80 ? COLORS.success : entry.score > 50 ? COLORS.warning : COLORS.danger} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* AI Analysis Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                <div className="card" style={{
                    background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
                    borderLeft: `4px solid ${COLORS.primary}`
                }}>
                    <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>AI Advisory Analysis</h3>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: COLORS.primary }}>Generative Insights</p>
                        </div>
                        <div style={{
                            background: 'rgba(99, 102, 241, 0.1)',
                            color: COLORS.primary,
                            padding: '0.4rem 0.8rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                        }}>
                            ✨ Powered by Gemini
                        </div>
                    </div>

                    {analysis.executive_summary ? (
                        <div className="animate-fade-in">
                            <p style={{ fontSize: '1.15rem', lineHeight: '1.7', color: '#1e293b', marginBottom: '2rem', fontWeight: 400 }}>
                                {analysis.executive_summary}
                            </p>

                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                <div style={{ background: '#fef2f2', padding: '1.25rem', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                                    <h4 style={{ color: '#991b1b', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        ⚠️ Risk Assessment
                                    </h4>
                                    <p style={{ margin: 0, color: '#7f1d1d' }}>{analysis.risk_assessment}</p>
                                </div>

                                <div>
                                    <h4 style={{ color: '#475569', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Recommended Actions</h4>
                                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                                        {[...analysis.remediation_steps]
                                            .sort((a, b) => {
                                                const pMap = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
                                                const pA = a.priority ? pMap[a.priority.toUpperCase()] ?? 99 : 99;
                                                const pB = b.priority ? pMap[b.priority.toUpperCase()] ?? 99 : 99;
                                                return pA - pB;
                                            })
                                            .map((step, idx) => {
                                                const priorityColors = {
                                                    'CRITICAL': { bg: '#7f1d1d', text: '#fee2e2' },
                                                    'HIGH': { bg: '#c2410c', text: '#ffedd5' },
                                                    'MEDIUM': { bg: '#eab308', text: '#fffbeb' },
                                                    'LOW': { bg: '#64748b', text: '#f1f5f9' },
                                                    'DEFAULT': { bg: '#94a3b8', text: '#f8fafc' } // Fallback
                                                };
                                                const pStyle = priorityColors[step.priority?.toUpperCase()] || priorityColors['DEFAULT'];

                                                return (
                                                    <div key={idx} style={{
                                                        display: 'flex',
                                                        gap: '1rem',
                                                        alignItems: 'flex-start',
                                                        background: 'white',
                                                        padding: '1rem',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e2e8f0',
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                                                    }}>
                                                        <div style={{
                                                            background: pStyle.bg,
                                                            color: pStyle.text,
                                                            padding: '0.2rem 0.5rem',
                                                            borderRadius: '4px',
                                                            fontSize: '0.7rem',
                                                            fontWeight: 'bold',
                                                            textTransform: 'uppercase',
                                                            minWidth: '60px',
                                                            textAlign: 'center',
                                                            marginTop: '0.2rem'
                                                        }}>
                                                            {step.priority || 'INFO'}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>{step.issue}</div>
                                                            <div style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.4' }}>{step.action}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p>AI Analysis unavailable.</p>
                    )}
                </div>

                {/* Chat Assistant Column */}
                <div style={{ height: '100%' }}>
                    <ChatAssistant context={data} />
                </div>
            </div>

            {/* Detailed Metadata Grid (Replaces old table for better visuals) */}
            <div className="grid-cols-3" style={{ marginBottom: '3rem' }}>
                <div className="card" style={{ background: COLORS.primary, color: 'white', border: 'none' }}>
                    <div style={{ opacity: 0.8, fontSize: '0.875rem' }}>Total Records</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{metadata.total_rows.toLocaleString()}</div>
                </div>
                <div className="card">
                    <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Columns</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#0f172a' }}>{metadata.total_columns}</div>
                </div>
                <div className="card">
                    <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Passed Rules</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: COLORS.success }}>
                        {Object.values(scores.rule_results).filter(r => r.passed).length}
                        <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 400 }}> / {Object.keys(scores.rule_results).length}</span>
                    </div>
                </div>
            </div>

            {/* Detailed Rule Breakdown - Table */}
            <div className="card">
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Detailed Rule Breakdown</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th style={{ textAlign: 'left', padding: '1rem', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Dimension / Rule</th>
                                <th style={{ textAlign: 'center', padding: '1rem', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Status</th>
                                <th style={{ textAlign: 'right', padding: '1rem', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Score</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0', paddingLeft: '2rem' }}>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(scores.rule_results).map(([key, result], idx) => (
                                <tr key={key} style={{ transition: 'background 0.2s', background: idx % 2 === 0 ? 'white' : '#fcfcfc' }}>
                                    <td style={{ padding: '1rem', fontWeight: 500, color: '#0f172a', borderBottom: '1px solid #f1f5f9' }}>
                                        {key.replace(/_/g, ' ')}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                                        <span style={{
                                            padding: '0.3rem 0.8rem',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            background: result.passed ? '#dcfce7' : '#fee2e2',
                                            color: result.passed ? '#166534' : '#991b1b',
                                            border: `1px solid ${result.passed ? '#bbf7d0' : '#fecaca'}`
                                        }}>
                                            {result.passed ? 'PASS' : 'FAIL'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: result.score > 80 ? COLORS.success : COLORS.warning, borderBottom: '1px solid #f1f5f9' }}>
                                        {result.score ? Math.round(result.score) : 0}%
                                    </td>
                                    <td style={{ padding: '1rem', color: '#64748b', borderBottom: '1px solid #f1f5f9', paddingLeft: '2rem' }}>
                                        {result.details}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
