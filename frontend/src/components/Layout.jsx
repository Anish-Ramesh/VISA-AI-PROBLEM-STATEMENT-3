import React from 'react';

const Layout = ({ children, onReset, onExport, hasData }) => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderBottom: '1px solid var(--color-border)',
                position: 'sticky',
                top: 0,
                zIndex: 50,
                boxShadow: 'var(--shadow-sm)'
            }}>
                <div className="container flex-between" style={{ padding: '1rem 2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: 40, height: 40,
                            background: 'var(--gradient-primary)',
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                        }}>
                            F
                        </div>
                        <h3 style={{
                            margin: 0,
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            background: 'var(--gradient-primary)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.02em',
                            backgroundClip: 'text'
                        }}>
                            FinAUDIT
                        </h3>
                    </div>
                    <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {hasData && (
                            <button
                                onClick={onExport}
                                className="btn"
                                style={{
                                    background: 'var(--color-bg-card)',
                                    border: '1px solid var(--color-border)',
                                    color: 'var(--color-text-main)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <span>📄</span> Export Report
                            </button>
                        )}

                        {hasData && (
                            <button
                                onClick={onReset}
                                className="btn btn-primary"
                                style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}
                            >
                                <span>+</span> New Scan
                            </button>
                        )}

                        {!hasData && (
                            <a href="#" style={{ textDecoration: 'none', color: 'var(--color-primary)', fontWeight: 600 }}>Home</a>
                        )}
                    </nav>
                </div>
            </header>

            <main style={{ flex: 1, padding: '2rem 0' }}>
                {children}
            </main>

            <footer style={{
                borderTop: '1px solid var(--color-border)',
                background: 'rgba(255,255,255,0.4)',
                padding: '3rem 0',
                marginTop: 'auto',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
            }}>
                <div className="container" style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    <div style={{ marginBottom: '1rem', fontWeight: 600, color: 'var(--color-text-main)' }}>FinAUDIT System</div>
                    Metadata-only processing • Secure & Private • Powered by Gemini AI
                </div>
            </footer>
        </div>
    );
};

export default Layout;
