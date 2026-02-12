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
                                        <button
                                            className={`action-btn`}
                                            onClick={() => handleApproval(user.id, user.role)}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                background: user.role === 'City Admin' ? 'rgba(255, 118, 117, 0.1)' : 'rgba(0, 184, 148, 0.1)',
                                                color: user.role === 'City Admin' ? '#ff7675' : '#00b894',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {user.role === 'City Admin' ? (
                                                <>
                                                    <X size={14} /> Revoke Admin
                                                </>
                                            ) : (
                                                <>
                                                    <Check size={14} /> Approve as City Admin
                                                </>
                                            )}
                                        </button>
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
