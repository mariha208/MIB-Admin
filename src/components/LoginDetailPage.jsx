import { useEffect } from 'react';
import { ChevronDown, Download, Edit2, Trash2, Check, X, CheckCircle, XCircle, RefreshCw, Loader2 } from 'lucide-react';

import { useData } from '../context/DataContext';

export default function LoginDetailPage() {
    const { data, pendingLoading, approveRequest, denyRequest, fetchPendingRequests } = useData();
    const pendingRequests = data.pendingRequests || [];
    
    // Fetch pending requests when page mounts
    useEffect(() => {
        console.log('[LoginDetailPage] Page mounted, fetching pending requests...');
        fetchPendingRequests();
    }, []);
    
    // Debug logging
    console.log('[LoginDetailPage] Rendering with data:', data);
    console.log('[LoginDetailPage] pendingRequests:', pendingRequests);
    console.log('[LoginDetailPage] pendingRequests length:', pendingRequests.length);
    if (pendingRequests.length > 0) {
        console.log('[LoginDetailPage] First request sample:', pendingRequests[0]);
    }

    const handleApproval = async (requestId, isApproved) => {
        try {
            if (isApproved) {
                const result = await approveRequest(requestId);
                console.log('[LoginDetailPage] Request approved, user added:', result.user);
                alert(`User "${result.user?.name || 'Unknown'}" has been approved and added to the Users table!`);
            } else {
                await denyRequest(requestId);
                console.log('[LoginDetailPage] Request denied');
                alert('Request has been denied and removed from pending list.');
            }
        } catch (error) {
            console.error('Error handling approval:', error);
            alert(`Failed to update request status: ${error.message || 'Unknown error'}. Please try again.`);
        }
    };

    const handleRefresh = () => {
        fetchPendingRequests();
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
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            className="icon-btn edit"
                            title="Refresh"
                            onClick={handleRefresh}
                            disabled={pendingLoading}
                            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            {pendingLoading ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />}
                            <span>Refresh</span>
                        </button>
                        <button className="icon-btn edit" title="Export" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Download size={16} />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>

                <div className="table-container shadow-lg">
                    {pendingLoading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <Loader2 size={32} className="spin" style={{ marginBottom: '1rem' }} />
                            <p>Loading pending requests...</p>
                        </div>
                    ) : pendingRequests.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <p>No pending requests found.</p>
                            <button
                                onClick={handleRefresh}
                                style={{
                                    marginTop: '1rem',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    background: 'var(--accent-primary)',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <RefreshCw size={16} />
                                Refresh
                            </button>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Transaction ID</th>
                                    <th>City ID</th>
                                    <th>Chapter ID</th>
                                    <th>Approval</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingRequests.map((request) => (
                                    <tr key={request.id}>
                                        <td>
                                            <div className="user-info">
                                                <div className="user-avatar">{request.name?.charAt(0) || '?'}</div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span className="user-name">{request.name || 'N/A'}</span>
                                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID #{request.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{request.email || 'N/A'}</span></td>
                                        <td><span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{request.phone || request.phoneNumber || 'N/A'}</span></td>
                                        <td><code style={{ background: 'rgba(108, 92, 231, 0.1)', color: 'var(--primary-light)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{request.transactionId || request.transactionDetails || 'N/A'}</code></td>
                                        <td><span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{request.cityId || 'N/A'}</span></td>
                                        <td><span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{request.chapterId || 'N/A'}</span></td>
                                        <td>
                                            {request.status === 'Approved' ? (
                                                <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500' }}>
                                                    <CheckCircle size={16} /> Approved
                                                </span>
                                            ) : request.status === 'Denied' ? (
                                                <span style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500' }}>
                                                    <XCircle size={16} /> Denied
                                                </span>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => handleApproval(request.id, true)}
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
                                                        onClick={() => handleApproval(request.id, false)}
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
                    )}
                </div>
            </div>
        </main>
    );
}

