import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const ChatAssistant = ({ context }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hi! I'm your Data Compliance Assistant. Ask me anything about this file's health report." }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: userMsg, context: context })
            });

            if (!response.ok) throw new Error("Network response was not ok");

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', text: data.response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I couldn't reach the server. Please check your connection." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: '400px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: 'var(--shadow-md)',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem',
                borderBottom: '1px solid var(--color-border)',
                background: 'rgba(255, 255, 255, 0.4)',
                fontWeight: 600,
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <span>🤖</span> Ask Gemini about this Dataset
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                padding: '1.5rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                scrollBehavior: 'smooth'
            }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        padding: '0.8rem 1.25rem',
                        borderRadius: '16px',
                        borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                        borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
                        fontSize: '0.95rem',
                        background: msg.role === 'user' ? 'var(--gradient-primary)' : 'rgba(255, 255, 255, 0.9)',
                        color: msg.role === 'user' ? 'white' : 'var(--color-text-main)',
                        boxShadow: msg.role === 'assistant' ? 'var(--shadow-sm)' : '0 4px 12px rgba(99, 102, 241, 0.25)',
                        border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.5)' : 'none',
                        lineHeight: '1.5'
                    }}>
                        <ReactMarkdown
                            components={{
                                p: ({ node, ...props }) => <p style={{ margin: 0 }} {...props} />,
                                a: ({ node, ...props }) => <a style={{ color: 'inherit', textDecoration: 'underline' }} {...props} />
                            }}
                        >
                            {msg.text}
                        </ReactMarkdown>
                    </div>
                ))}
                {isLoading && (
                    <div style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        Analysis in progress...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{
                padding: '1rem',
                borderTop: '1px solid var(--color-border)',
                background: 'rgba(255, 255, 255, 0.6)',
                display: 'flex',
                gap: '0.75rem'
            }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask a question..."
                    style={{
                        flex: 1,
                        padding: '0.75rem 1.25rem',
                        borderRadius: '24px',
                        border: '1px solid var(--color-border)',
                        background: 'rgba(255, 255, 255, 0.5)',
                        color: 'var(--color-text-main)',
                        outline: 'none',
                        transition: 'all 0.2s',
                        fontSize: '0.95rem'
                    }}
                    onFocus={(e) => {
                        e.target.style.background = 'white';
                        e.target.style.borderColor = 'var(--color-primary)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                    }}
                    onBlur={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.5)';
                        e.target.style.borderColor = 'var(--color-border)';
                        e.target.style.boxShadow = 'none';
                    }}
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading}
                    style={{
                        background: 'var(--gradient-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '42px',
                        height: '42px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
                        transition: 'transform 0.1s'
                    }}
                    onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
                    onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                >
                    ➤
                </button>
            </div>
        </div>
    );
};

export default ChatAssistant;
