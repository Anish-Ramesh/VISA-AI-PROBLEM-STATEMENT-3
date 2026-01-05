import React, { useState } from 'react';

const Upload = ({ onAnalysisComplete }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isHovering, setIsHovering] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/api/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const data = await response.json();
            onAnalysisComplete(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '80vh', flexDirection: 'column', gap: '2rem' }}>
            <div className="container" style={{ maxWidth: '800px', textAlign: 'center' }}>
                <h1 style={{
                    fontSize: '3.5rem',
                    marginBottom: '1.5rem',
                    lineHeight: '1.2',
                    background: 'var(--gradient-primary)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    Instantly Audit Your Financial Data
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                    Accepts a dataset (file, table, or API source) in a secure, governed manner. <br />
                    Detect anomalies, compliance risks, and quality issues in seconds.
                </p>

                <div className="card animate-fade-in" style={{
                    padding: '3rem',
                    position: 'relative',
                    overflow: 'visible'
                }}>
                    <div
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                        style={{
                            border: `2px dashed ${isHovering ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            borderRadius: 'var(--radius-lg)',
                            padding: '4rem 2rem',
                            background: isHovering ? 'rgba(99, 102, 241, 0.05)' : 'var(--color-bg-app)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            position: 'relative'
                        }}
                    >
                        <input
                            type="file"
                            accept=".csv,.json,.xlsx"
                            onChange={handleFileChange}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                opacity: 0,
                                cursor: 'pointer',
                                zIndex: 10
                            }}
                            id="file-upload"
                        />

                        <div style={{ pointerEvents: 'none' }}>
                            <div style={{
                                fontSize: '4rem',
                                marginBottom: '1.5rem',
                                filter: isHovering ? 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.5))' : 'none',
                                transition: 'filter 0.3s ease'
                            }}>
                                {file ? '📄' : '☁️'}
                            </div>

                            {file ? (
                                <div>
                                    <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>{file.name}</h3>
                                    <p style={{ color: 'var(--color-success)', fontWeight: 600 }}>Ready to analyze</p>
                                </div>
                            ) : (
                                <div>
                                    <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>Click or Drag File Here</h3>
                                    <p style={{ fontSize: '0.9rem' }}>Supports CSV, JSON, Excel</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="animate-fade-in" style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            background: '#fef2f2',
                            color: '#991b1b',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid #fee2e2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <button
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            marginTop: '2rem',
                            padding: '1rem',
                            fontSize: '1.1rem',
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '1rem',
                            opacity: loading || !file ? 0.7 : 1
                        }}
                        onClick={handleUpload}
                        disabled={loading || !file}
                    >
                        {loading ? (
                            <>
                                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                                Analyzing Metadata...
                            </>
                        ) : (
                            <>
                                <span>🚀</span> Run Compliance Scan
                            </>
                        )}
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Upload;
