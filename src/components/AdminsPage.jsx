import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronDown, Check, X, Plus, Edit2, Loader2, RefreshCw } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function AdminsPage({ onNavigate }) {
    const {
        cityAdmins,
        chapterAdmins,
        adminsLoading,
        fetchCityAdmins,
        fetchChapterAdmins,
        removeAdminById,
    } = useData();

    const [searchQuery, setSearchQuery] = useState('');
    const [viewType, setViewType] = useState('city'); // 'city' or 'chapter'
    const [isEditMode, setIsEditMode] = useState(false);
    const [pendingDeletions, setPendingDeletions] = useState(new Set());
    const [isSaving, setIsSaving] = useState(false);

    // Current list based on active tab
    const adminsList = viewType === 'city' ? cityAdmins : chapterAdmins;

    // Fetch admins when tab changes or search changes
    const fetchAdmins = useCallback(async () => {
        if (viewType === 'city') {
            await fetchCityAdmins(searchQuery);
        } else {
            await fetchChapterAdmins(searchQuery);
        }
    }, [viewType, searchQuery]);

    // Fetch on mount and tab switch
    useEffect(() => {
        fetchAdmins();
    }, [viewType]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAdmins();
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleEditToggle = async () => {
        if (isEditMode) {
            // Save Changes — remove all marked admins
            if (pendingDeletions.size > 0) {
                if (window.confirm(`Are you sure you want to remove ${pendingDeletions.size} admin(s)? They will be demoted back to Member.`)) {
                    setIsSaving(true);
                    try {
                        const promises = Array.from(pendingDeletions).map(adminId =>
                            removeAdminById(adminId)
                        );
                        await Promise.all(promises);
                        setPendingDeletions(new Set());
                        setIsEditMode(false);
                        // Refresh list after removals
                        await fetchAdmins();
                    } catch (error) {
                        console.error("Failed to save changes", error);
                        alert("Failed to remove some admins. Please try again.");
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

    const toggleDeletionMark = (adminId) => {
        const newPending = new Set(pendingDeletions);
        if (newPending.has(adminId)) {
            newPending.delete(adminId);
        } else {
            newPending.add(adminId);
        }
        setPendingDeletions(newPending);
    };

    return (
        <div className="main-content animate-fade-in">
            <header className="page-header center-header">
                <div className="header-content">
                    <h1 className="page-title">Admins</h1>
                    <p className="page-subtitle">Manage city and chapter administrators.</p>
                </div>
            </header>

            <div className="table-controls" style={{ alignItems: 'center' }}>
                <div className="search-box">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search admins by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {/* Tab Toggle */}
                    <div className="view-toggle" style={{
                        display: 'flex',
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '4px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <button
                            onClick={() => { setViewType('city'); setIsEditMode(false); setPendingDeletions(new Set()); }}
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
                            onClick={() => { setViewType('chapter'); setIsEditMode(false); setPendingDeletions(new Set()); }}
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

                    {/* Refresh Button */}
                    <button
                        onClick={fetchAdmins}
                        disabled={adminsLoading}
                        style={{
                            padding: '10px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.3s'
                        }}
                        title="Refresh"
                    >
                        {adminsLoading ? <Loader2 size={18} className="spin" /> : <RefreshCw size={18} />}
                    </button>

                    {/* Create Admin */}
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

                    {/* Edit Mode Toggle */}
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
                {adminsLoading && adminsList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                        <Loader2 size={32} className="spin" style={{ marginBottom: '12px' }} />
                        <p>Loading admins...</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Name</th>
                                <th>City Name</th>
                                {viewType === 'chapter' && <th>Chapter Name</th>}
                                {isEditMode && <th style={{ textAlign: 'center' }}>Edit Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {adminsList.length > 0 ? (
                                adminsList.map((admin) => {
                                    const isPendingDeletion = pendingDeletions.has(admin.id);
                                    return (
                                        <tr key={admin.id} style={{
                                            opacity: isPendingDeletion ? 0.5 : 1,
                                            background: isPendingDeletion ? 'rgba(0,0,0,0.1)' : undefined,
                                            transition: 'all 0.3s'
                                        }}>
                                            <td><span className="id-badge">#{admin.id}</span></td>
                                            <td>
                                                <div className="user-info">
                                                    <div className="user-avatar">{(admin.name || '?').charAt(0)}</div>
                                                    <span className="user-name">{admin.name || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td>{admin.cityName || admin.city || 'N/A'}</td>
                                            {viewType === 'chapter' && <td>{admin.chapterName || admin.chapter || 'N/A'}</td>}
                                            {isEditMode && (
                                                <td>
                                                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                                        <button
                                                            onClick={() => toggleDeletionMark(admin.id)}
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
                                        {searchQuery
                                            ? `No admins found matching "${searchQuery}".`
                                            : `No ${viewType} admins found.`
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
