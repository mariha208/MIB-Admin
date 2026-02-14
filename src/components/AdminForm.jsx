import { useState, useMemo } from 'react';
import { ArrowLeft, Search, Check } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function AdminForm({ mode = 'create', onNavigate, viewType = 'chapter' }) {
    const { data, updateUser } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Filter available members based on search and role
    const availableMembers = useMemo(() => {
        return data.users.filter(user => {
            const isUser = user.role === 'User';
            const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.id.toString().includes(searchQuery);

            return isUser && matchesSearch;
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [data.users, searchQuery]);

    const handleAssign = async (member) => {
        const targetChapter = viewType === 'city' ? 'All' : member.chapter;

        // Check if there's already an admin for this location
        const existingAdmin = data.users.find(u =>
            u.city === member.city &&
            u.chapter === targetChapter &&
            u.role === 'City Admin' &&
            (u.approvalStatus === 'Approved' || !u.approvalStatus)
        );

        if (existingAdmin) {
            const level = viewType === 'city' ? `City (${member.city})` : `Chapter (${member.chapter} in ${member.city})`;
            alert(`Warning: '${level}' already has an assigned Admin (${existingAdmin.name}).\n\nPlease remove the existing admin first.`);
            return;
        }

        const confirmMsg = viewType === 'city'
            ? `Are you sure you want to make ${member.name} the Admin for the entire city of ${member.city}?`
            : `Are you sure you want to make ${member.name} the Admin for ${member.city} - ${member.chapter}?`;

        if (window.confirm(confirmMsg)) {
            setIsLoading(true);
            try {
                await updateUser(member.id, {
                    role: 'City Admin',
                    approvalStatus: 'Approved',
                    chapter: targetChapter
                });
                onNavigate('admins');
            } catch (error) {
                console.error('Failed to promote user:', error);
                alert('Failed to promote user. Please try again.');
            } finally {
                setIsLoading(false);
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
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '16px',
                            padding: '8px',
                            borderRadius: 'var(--radius-md)',
                            transition: 'background 0.3s'
                        }}
                    >
                        <ArrowLeft size={20} /> Back
                    </button>
                    <h1 className="page-title">Assign {viewType === 'city' ? 'City' : 'Chapter'} Admin</h1>
                    <p className="page-subtitle">Select a member from the table to assign as administrator.</p>
                </div>
            </header>

            <div className="table-controls" style={{ marginBottom: '24px' }}>
                <div className="search-box" style={{ maxWidth: '400px', margin: '0 auto' }}>
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search members by name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        {viewType === 'chapter' ? (
                            <tr>
                                <th>User ID</th>
                                <th>Name</th>
                                <th>City name</th>
                                <th>ChapterName</th>
                                <th style={{ textAlign: 'center' }}>Select as Admin</th>
                            </tr>
                        ) : (
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>City Name</th>
                                <th style={{ textAlign: 'center' }}>Select as Admin</th>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {availableMembers.length > 0 ? (
                            availableMembers.map((member) => (
                                <tr key={member.id}>
                                    <td><span className="id-badge">#{member.id}</span></td>
                                    <td>
                                        <div className="user-info">
                                            <div className="user-avatar">{member.name.charAt(0)}</div>
                                            <div>
                                                <div className="user-name">{member.name}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({member.chapter})</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{member.city}</td>
                                    {viewType === 'chapter' && <td>{member.chapter}</td>}
                                    <td style={{ textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleAssign(member)}
                                            disabled={isLoading}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: 'var(--radius-md)',
                                                border: 'none',
                                                background: 'var(--accent-gradient)',
                                                color: 'white',
                                                fontWeight: '600',
                                                fontSize: '13px',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                boxShadow: 'var(--shadow-glow)'
                                            }}
                                        >
                                            Select as Admin
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={viewType === 'chapter' ? 5 : 4} className="no-results">
                                    No members found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
