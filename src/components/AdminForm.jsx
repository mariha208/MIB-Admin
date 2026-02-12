import { useState, useMemo } from 'react';
import { ArrowLeft, Search, ChevronDown, UserPlus, Check } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function AdminForm({ mode = 'create', adminId, onNavigate, viewType = 'chapter' }) {
    const { data, updateUser } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [passwords, setPasswords] = useState({});

    const filteredUsers = useMemo(() => {
        return data.users.filter(user => {
            // Strictly show only members with "User" role
            const isMember = user.role === 'User';
            const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.id.toString().includes(searchQuery);

            return isMember && matchesSearch;
        });
    }, [data.users, searchQuery]);

    const sortedUsers = useMemo(() => {
        return [...filteredUsers].sort((a, b) => {
            if (a.city !== b.city) return a.city.localeCompare(b.city);
            if (a.chapter !== b.chapter) return a.chapter.localeCompare(b.chapter);
            return a.name.localeCompare(b.name);
        });
    }, [filteredUsers]);


    const handleSelectAsAdmin = async (userId, userName, city, chapter, userPassword) => {
        const password = userPassword || 'pass'; // Use existing password

        // For City Admins, the target chapter is 'All'
        const targetChapter = viewType === 'city' ? 'All' : chapter;

        // Check if there's already an admin for this target
        const existingAdmin = data.users.find(u =>
            u.city === city &&
            u.chapter === targetChapter &&
            u.role === 'City Admin' &&
            (u.approvalStatus === 'Approved' || !u.approvalStatus)
        );

        if (existingAdmin) {
            const level = viewType === 'city' ? 'City' : `Chapter (${chapter})`;
            alert(`Warning: '${city} - ${level}' already has an assigned Admin (${existingAdmin.name}).\n\nPlease remove the existing admin first.`);
            return;
        }

        const confirmMsg = viewType === 'city'
            ? `Are you sure you want to make ${userName} the Admin for the entire city of ${city}?`
            : `Are you sure you want to make ${userName} the Admin for ${city} - ${chapter}?`;

        if (window.confirm(confirmMsg)) {
            try {
                await updateUser(userId, {
                    role: 'City Admin',
                    approvalStatus: 'Approved',
                    password: password,
                    chapter: targetChapter
                });
                onNavigate('admins');
            } catch (error) {
                console.error('Failed to promote user:', error);
                alert('Failed to promote user. Please try again.');
            }
        }
    };

    return (
        <div className="main-content animate-fade-in">
            <header className="page-header center-header">
                <div className="header-content" style={{ position: 'relative', width: '100%' }}>
                    <button
                        onClick={() => onNavigate('admins')}
                        className="back-btn"
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            position: 'absolute',
                            left: 0,
                            top: '150%',
                            transform: 'translateY(-50%)',
                            fontSize: '18px'
                        }}
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                    <h1 className="page-title">Select {viewType === 'city' ? 'City' : 'Chapter'} Admin</h1>
                    <p className="page-subtitle">Search and select a member to assign as a {viewType === 'city' ? 'City' : 'Chapter'} Admin.</p>
                </div>
            </header>

            <div className="table-controls">
                <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                    <div className="search-box">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search members by name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Name</th>
                            <th>City Name</th>
                            <th>Chapter Name</th>
                            <th>Password</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedUsers.length > 0 ? (
                            sortedUsers.map((user) => (
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
                                        <code style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                                            {user.password || '••••••'}
                                        </code>
                                    </td>
                                    <td>
                                        <button
                                            className="action-btn"
                                            onClick={() => handleSelectAsAdmin(user.id, user.name, user.city, user.chapter, user.password)}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: 'var(--radius-md)',
                                                border: 'none',
                                                background: 'var(--accent-gradient)',
                                                color: 'white',
                                                fontWeight: '600',
                                                fontSize: '13px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                boxShadow: 'var(--shadow-glow)'
                                            }}
                                        >
                                            <UserPlus size={14} />
                                            Select as admin
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="no-results">
                                    No members found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
