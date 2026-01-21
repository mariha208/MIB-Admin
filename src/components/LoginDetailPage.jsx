import { ChevronDown, Download, Edit2, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function LoginDetailPage() {
    const { data } = useData();
    const users = data.users;

    return (
        <main className="main-content">
            <header className="page-header center-header">
                <div className="header-content">
                    <h1 className="page-title">Login Details</h1>
                    <p className="page-subtitle">Detailed user profile and transaction logs from sign-up.</p>
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
                                <th>Profile</th>
                                <th>Email</th>
                                <th>Phone No.</th>
                                <th>Transaction Details</th>
                                <th>Location</th>
                                <th>Chapter</th>
                                <th>Actions</th>
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
                                    <td><span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{user.phone}</span></td>
                                    <td><code style={{ background: 'rgba(108, 92, 231, 0.1)', color: 'var(--primary-light)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{user.transactionDetails}</code></td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span>{user.city}</span>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user.country}</span>
                                        </div>
                                    </td>
                                    <td>{user.chapter}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="icon-btn edit" title="View"><Edit2 size={16} /></button>
                                            <button className="icon-btn delete" title="Flag"><Trash2 size={16} /></button>
                                        </div>
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
