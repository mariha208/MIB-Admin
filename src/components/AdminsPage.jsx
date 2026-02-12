import { useState, useMemo } from 'react';
import { Search, ChevronDown, Check, X, Plus, Edit2 } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function AdminsPage({ onNavigate }) {
    const { data, updateUser } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewType, setViewType] = useState('chapter'); // 'chapter' or 'city'
    const [isEditMode, setIsEditMode] = useState(false);
    const [pendingDeletions, setPendingDeletions] = useState(new Set());
    const [isSaving, setIsSaving] = useState(false);

    const filteredUsers = useMemo(() => {
        // First filter for role and search criteria
        const baseFiltered = data.users.filter(user => {
            const isCityAdmin = user.role === 'City Admin';

            // Filter by viewType:
            // 'chapter' view shows those assigned to specific chapters (chapter !== 'All')
            // 'city' view shows those assigned to entire cities (chapter === 'All')
            const matchesView = viewType === 'chapter'
                ? (user.chapter && user.chapter !== 'All')
                : (user.chapter === 'All');

            const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.id.toString().includes(searchQuery);

            return isCityAdmin && matchesView && matchesSearch;
        });

        // Then ensure uniqueness
        const seen = new Set();
        return baseFiltered.filter(user => {
            // For chapter view, unique per City + Chapter
            // For city view, unique per City
            const key = viewType === 'chapter'
                ? `${user.city}-${user.chapter}`
                : user.city;

            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [data.users, searchQuery, viewType]);

    const handleEditToggle = async () => {
        if (isEditMode) {
            // Save Changes
            if (pendingDeletions.size > 0) {
                if (window.confirm(`Are you sure you want to remove ${pendingDeletions.size} admin(s)?`)) {
                    setIsSaving(true);
                    try {
                        // Execute all deletions
                        const promises = Array.from(pendingDeletions).map(userId =>
                            updateUser(userId, { role: 'User', approvalStatus: 'Rejected' })
                        );
                        await Promise.all(promises);
                        setPendingDeletions(new Set());
                        setIsEditMode(false);
                    } catch (error) {
                        console.error("Failed to save changes", error);
                        alert("Failed to save changes. Please try again.");
                    } finally {
                        setIsSaving(false);
                    }
                }
            } else {
                setIsEditMode(false);
            }
        } else {
            // Enter Edit Mode
            setPendingDeletions(new Set());
            setIsEditMode(true);
        }
    };

    const toggleDeletionMark = (userId) => {
        const newPending = new Set(pendingDeletions);
        if (newPending.has(userId)) {
            newPending.delete(userId);
        } else {
            if (window.confirm("Mark this admin for removal? (Will be removed on Save)")) {
                newPending.add(userId);
            }
        }
        setPendingDeletions(newPending);
    };

    return (
        <div className="main-content animate-fade-in">
            <header className="page-header center-header">
                <div className="header-content">
                    <h1 className="page-title">Admins</h1>
                    <p className="page-subtitle">Approve and manage city administrators.</p>
                </div>
            </header>

            <div className="table-controls" style={{ alignItems: 'center' }}>
                <div className="search-box">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search users by name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="view-toggle" style={{
                        display: 'flex',
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '4px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <button
                            onClick={() => setViewType('city')}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 'calc(var(--radius-md) - 2px)',
                                border: 'none',
                                background: viewType === 'city' ? 'var(--accent-gradient)' : 'transparent',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '13px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            City Admins
                        </button>
                        <button
                            onClick={() => setViewType('chapter')}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 'calc(var(--radius-md) - 2px)',
                                border: 'none',
                                background: viewType === 'chapter' ? 'var(--accent-gradient)' : 'transparent',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '13px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Chapter Admins
                        </button>
                    </div>

                    <button
                        className="create-btn"
                        onClick={() => onNavigate(`create-admin/${viewType}`)}
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

                    <button
                        onClick={handleEditToggle}
                        disabled={isSaving}
                        style={{
                            padding: '10px 20px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--accent-primary)',
                            background: isEditMode ? 'var(--accent-primary)' : 'transparent',
                            color: isEditMode ? 'white' : 'var(--accent-primary)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.3s'
                        }}
                    >
                        <Edit2 size={16} />
                        {isSaving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Edit')}
                    </button>
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Name</th>
                            <th>City Name</th>
                            {viewType !== 'city' && <th>Chapter Name</th>}
                            {isEditMode && <th style={{ textAlign: 'center' }}>Edit Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => {
                                const isPendingDeletion = pendingDeletions.has(user.id);
                                return (
                                    <tr key={user.id} style={{
                                        opacity: isPendingDeletion ? 0.5 : 1,
                                        background: isPendingDeletion ? 'rgba(0,0,0,0.1)' : undefined,
                                        transition: 'all 0.3s'
                                    }}>
                                        <td><span className="id-badge">#{user.id}</span></td>
                                        <td>
                                            <div className="user-info">
                                                <div className="user-avatar">{user.name.charAt(0)}</div>
                                                <span className="user-name">{user.name}</span>
                                            </div>
                                        </td>
                                        <td>{user.city}</td>
                                        {viewType !== 'city' && <td>{user.chapter}</td>}
                                        {isEditMode && (
                                            <td>
                                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                                    <button
                                                        onClick={() => toggleDeletionMark(user.id)}
                                                        title={isPendingDeletion ? "Undo Removal" : "Remove Admin"}
                                                        style={{
                                                            padding: '6px',
                                                            borderRadius: '50%',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            background: isPendingDeletion ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 118, 117, 0.1)',
                                                            color: isPendingDeletion ? 'white' : '#ff7675',
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        {isPendingDeletion ? <Check size={18} /> : <X size={18} />}
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={viewType === 'city' ? (isEditMode ? 4 : 3) : (isEditMode ? 5 : 4)} className="no-results">
                                    No admins found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
