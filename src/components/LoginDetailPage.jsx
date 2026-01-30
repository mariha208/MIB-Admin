import { ChevronDown, Download, Edit2, Trash2, Check, X, CheckCircle, XCircle } from 'lucide-react';

import { useData } from '../context/DataContext';

export default function LoginDetailPage() {
    const { data, updateUser } = useData();
    const users = data.users;

    const handleApproval = (userId, isApproved) => {
        const newStatus = isApproved ? 'Approved' : 'Denied';
        updateUser(userId, { status: newStatus });
    };

    return (
        <main className="main-content">
            <header className="page-header center-header">
                <div className="header-content">
                    <h1 className="page-title">Pending Users</h1>
                    <p className="page-subtitle">Users with Pending Login Details.</p>
                </div>
            </header>

            <div className="users-page animate-fade-in">
                <div className="table-controls" style={{ justifyContent: 'space-between' }}>
                    <h2 className="section-title text-white">Security & Access Logs</h2>
                    <button className="icon-btn edit" title="Export" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Download size={16} />
                        <span>Export CSV</span>
                    </button>
                </div>

                <div className="table-container shadow-lg">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Password</th>
                                <th>Transaction ID</th>
                                <th>City ID</th>
                                <th>Chapter ID</th>
                                <th>Approval</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="user-info">
                                            <div className="user-avatar">{user.name.charAt(0)}</div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span className="user-name">{user.name}</span>
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID #{user.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{user.email}</span></td>
                                    <td><span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{user.password || '******'}</span></td>
                                    <td><code style={{ background: 'rgba(108, 92, 231, 0.1)', color: 'var(--primary-light)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{user.transactionDetails}</code></td>
                                    <td><span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{user.cityId || 'N/A'}</span></td>
                                    <td><span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{user.chapterId || 'N/A'}</span></td>
                                    <td>
                                        {user.status === 'Approved' ? (
                                            <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500' }}>
                                                <CheckCircle size={16} /> Approved
                                            </span>
                                        ) : user.status === 'Denied' ? (
                                            <span style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500' }}>
                                                <XCircle size={16} /> Denied
                                            </span>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleApproval(user.id, true)}
                                                    title="Approve"
                                                    style={{
                                                        background: 'rgba(16, 185, 129, 0.1)',
                                                        color: '#10B981',
                                                        border: 'none',
                                                        padding: '6px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'}
                                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleApproval(user.id, false)}
                                                    title="Deny"
                                                    style={{
                                                        background: 'rgba(239, 68, 68, 0.1)',
                                                        color: '#EF4444',
                                                        border: 'none',
                                                        padding: '6px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
