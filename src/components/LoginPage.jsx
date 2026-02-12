import { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function LoginPage() {
    const { login } = useData();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        console.log('[LoginPage] Submitting login form with email:', email);

        try {
            // Call the async login function
            const result = await login(email, password);
            console.log('[LoginPage] Login result:', result);
            
            if (!result.success) {
                console.error('[LoginPage] Login failed:', result.error);
                setError(result.error || 'Invalid email or password');
            } else {
                console.log('[LoginPage] Login successful!');
            }
        } catch (err) {
            console.error('[LoginPage] Login error caught:', err);
            setError(err.message || 'An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            padding: 'var(--spacing-md)'
        }}>
            <div style={{
                background: 'var(--bg-card)',
                padding: 'var(--spacing-2xl)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                width: '100%',
                maxWidth: '420px',
                boxShadow: 'var(--shadow-glow)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'var(--accent-gradient)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto var(--spacing-md)',
                        boxShadow: 'var(--shadow-glow)'
                    }}>
                        <LogIn size={32} color="white" />
                    </div>
                    <h1 className="page-title" style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-xs)' }}>
                        Welcome Back
                    </h1>
                    <p className="page-subtitle">Please enter your details to sign in.</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid #EF4444',
                        color: '#EF4444',
                        padding: 'var(--spacing-md)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--spacing-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)',
                        fontSize: 'var(--font-size-sm)'
                    }}>
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="form-section">
                    <div className="search-box">
                        <Mail className="search-icon" size={20} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ background: 'rgba(0,0,0,0.2)' }}
                        />
                    </div>

                    <div className="search-box">
                        <Lock className="search-icon" size={20} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ background: 'rgba(0,0,0,0.2)' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            background: 'var(--accent-gradient)',
                            color: 'white',
                            border: 'none',
                            padding: 'var(--spacing-md)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--font-size-base)',
                            fontWeight: '600',
                            cursor: isLoading ? 'wait' : 'pointer',
                            marginTop: 'var(--spacing-sm)',
                            opacity: isLoading ? 0.7 : 1,
                            transition: 'all var(--transition-base)',
                            boxShadow: 'var(--shadow-glow)'
                        }}
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div style={{
                    marginTop: 'var(--spacing-lg)',
                    textAlign: 'center',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-muted)'
                }}>
                    <p>Restricted Access. Authorized Personnel Only.</p>
                </div>
            </div>
        </div>
    );
}
