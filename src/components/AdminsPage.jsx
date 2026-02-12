import { useState, useMemo } from 'react';
import { Search, ChevronDown, Check, X, Plus, Edit2 } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function AdminsPage({ onNavigate }) {
    const { data, updateUser } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCity, setFilterCity] = useState('');
    const [filterChapter, setFilterChapter] = useState('');

    const filteredUsers = useMemo(() => {
        return data.users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.id.toString().includes(searchQuery);
            const matchesCity = filterCity === '' || user.city === filterCity;
            const matchesChapter = filterChapter === '' || user.chapter === filterChapter;

            return matchesSearch && matchesCity && matchesChapter;
        });
    }, [data.users, searchQuery, filterCity, filterChapter]);

    const uniqueCities = [...new Set(data.users.map(u => u.city))];
    const availableChapters = data.chapters
        .filter(c => !filterCity || c.city === filterCity)
        .map(c => c.name);

    const handleApproval = (userId, currentRole) => {
        const newRole = currentRole === 'City Admin' ? 'User' : 'City Admin';
        // We'll update the user with the new role
        updateUser(userId, { role: newRole });
    };

    return (
        <div className="main-content animate-fade-in">
            <header className="page-header center-header">
                <div className="header-content">
                    <h1 className="page-title">City Admins</h1>
                    <p className="page-subtitle">Approve and manage city administrators.</p>
                </div>
            </header>

            <div className="table-controls">
                <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                    <div className="search-box">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search users by name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <div className="filter-select-wrapper">
                            <select
                                value={filterCity}
                                onChange={(e) => {
                                    setFilterCity(e.target.value);
                                    setFilterChapter('');
                                }}
                            >
                                <option value="">All Cities</option>
                                {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <ChevronDown className="select-arrow" size={16} />
                        </div>
                    </div>

                    <div className="filter-group">
                        <div className="filter-select-wrapper">
                            <select
                                value={filterChapter}
                                onChange={(e) => setFilterChapter(e.target.value)}
                                disabled={!filterCity}
                            >
                                <option value="">All Chapters</option>
                                {availableChapters.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <ChevronDown className="select-arrow" size={16} />
                        </div>
                    </div>
                </div>

                <button
                    className="create-btn"
                    onClick={() => onNavigate('create-admin')}
                    style={{
                        background: 'var(--accent-gradient)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: 'var(--shadow-glow)'
                    }}
                >
                    <Plus size={18} />
                    Create Admin
                </button>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Name</th>
                            <th>City Name</th>
                            <th>Chapter Name</th>
                            <th>Actions</th>
                            <th>Approval</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td><span className="id-badge">#{user.id}</span></td>
                                    <td>
                                        <div className="user-info">
                                            <div className="user-avatar">{user.name.charAt(0)}</div>
                                            <span className="user-name">{user.name}</span>
                                        </div>
                                    </td>
                                    <td>{user.city}</td>
                                    <td>{user.chapter}</td>
                                    <td>
                                        <button
                                            className="icon-btn edit"
                                            title="Edit Admin"
                                            onClick={() => onNavigate(`edit-admin/${user.id}`)}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {!user.approvalStatus || user.approvalStatus === 'Pending' ? (
                                                <>
                                                    <button
                                                        className="action-btn"
                                                        onClick={() => {
                                                            const existingAdmin = data.users.find(u =>
                                                                u.city === user.city &&
                                                                u.chapter === user.chapter &&
                                                                u.role === 'City Admin' &&
                                                                (u.approvalStatus === 'Approved' || !u.approvalStatus) &&
                                                                u.id !== user.id
                                                            );

                                                            if (existingAdmin) {
                                                                alert(`Warning: '${user.city} - ${user.chapter}' already has an assigned Admin (${existingAdmin.name}).\n\nA Chapter can only have one City Admin.`);
                                                                return;
                                                            }

                                                            updateUser(user.id, { role: 'City Admin', approvalStatus: 'Approved' });
                                                        }}
                                                        title="Approve as City Admin"
                                                        style={{
                                                            padding: '6px',
                                                            borderRadius: '6px',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            background: 'rgba(0, 184, 148, 0.1)',
                                                            color: '#00b894',
                                                            transition: 'all 0.2s',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                    <button
                                                        className="action-btn"
                                                        onClick={() => updateUser(user.id, { role: 'User', approvalStatus: 'Rejected' })}
                                                        title="Revoke Admin Access"
                                                        style={{
                                                            padding: '6px',
                                                            borderRadius: '6px',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            background: 'rgba(255, 118, 117, 0.1)',
                                                            color: '#ff7675',
                                                            transition: 'all 0.2s',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <span
                                                    style={{
                                                        color: user.approvalStatus === 'Approved' ? '#00b894' : '#ff7675',
                                                        fontWeight: '600',
                                                        fontSize: '13px'
                                                    }}
                                                >
                                                    {user.approvalStatus}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="no-results">
                                    No users found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
