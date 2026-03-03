import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Search, Loader2 } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function AdminForm({ mode = 'create', onNavigate, viewType = 'chapter' }) {
    const {
        membersForAssignment,
        fetchMembersForAssignment,
        assignNewAdmin,
    } = useData();

    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingMembers, setIsFetchingMembers] = useState(false);

    // Fetch members on mount
    useEffect(() => {
        loadMembers();
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            loadMembers(searchQuery);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const loadMembers = async (search = '') => {
        setIsFetchingMembers(true);
        try {
            await fetchMembersForAssignment(search);
        } catch (error) {
            console.error('Failed to fetch members:', error);
        } finally {
            setIsFetchingMembers(false);
        }
    };

    const handleAssign = async (member) => {
        const role = viewType === 'city' ? 'City_Admin' : 'Chapter_Admin';
        const cityId = member.cityId || member.city;

        const confirmMsg = viewType === 'city'
            ? `Are you sure you want to make ${member.name} a City Admin for "${member.cityName || member.city}"?`
            : `Are you sure you want to make ${member.name} a Chapter Admin for "${member.chapterName || member.chapter}" in "${member.cityName || member.city}"?`;

        if (window.confirm(confirmMsg)) {
            setIsLoading(true);
            try {
                await assignNewAdmin(
                    member.id,
                    role,
                    cityId,
                    viewType === 'chapter' ? (member.chapterId || member.chapter) : null
                );
                alert('Admin assigned successfully!');
                onNavigate('admins');
            } catch (error) {
                console.error('Failed to assign admin:', error);
                alert(`Failed to assign admin: ${error.message}`);
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
                        style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}
                    >
                        <ArrowLeft size={18} /> Back
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
                        placeholder="Search members by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-container">
                {isFetchingMembers && membersForAssignment.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                        <Loader2 size={32} className="spin" style={{ marginBottom: '12px' }} />
                        <p>Loading members...</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            {viewType === 'chapter' ? (
                                <tr>
                                    <th>User ID</th>
                                    <th>Name</th>
                                    <th>City Name</th>
                                    <th>Chapter Name</th>
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
                            {membersForAssignment.length > 0 ? (
                                membersForAssignment.map((member) => (
                                    <tr key={member.id}>
                                        <td><span className="id-badge">#{member.id}</span></td>
                                        <td>
                                            <div className="user-info">
                                                <div className="user-avatar">{(member.name || '?').charAt(0)}</div>
                                                <div>
                                                    <div className="user-name">{member.name || 'N/A'}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                        ({member.chapterName || member.chapter || 'N/A'})
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{member.cityName || member.city || 'N/A'}</td>
                                        {viewType === 'chapter' && <td>{member.chapterName || member.chapter || 'N/A'}</td>}
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
                                                {isLoading ? 'Assigning...' : 'Select as Admin'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={viewType === 'chapter' ? 5 : 4} className="no-results">
                                        {searchQuery
                                            ? `No members found matching "${searchQuery}".`
                                            : 'No members found.'
                                        }
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
