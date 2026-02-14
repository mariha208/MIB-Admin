import { useState, useEffect } from 'react';
import { ArrowLeft, Search, ChevronDown, UserPlus, Loader2 } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function AdminForm({ mode = 'create', adminId, onNavigate, viewType = 'chapter' }) {
    const {
        membersForAssignment,
        fetchMembersForAssignment,
        assignNewAdmin,
    } = useData();

    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [memberSearch, setMemberSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingMembers, setIsFetchingMembers] = useState(false);

    // Fetch members on mount
    useEffect(() => {
        loadMembers();
    }, []);

    // Debounced search for members
    useEffect(() => {
        const timer = setTimeout(() => {
            loadMembers(memberSearch);
        }, 400);
        return () => clearTimeout(timer);
    }, [memberSearch]);

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

    const selectedMember = membersForAssignment.find(
        m => m.id === selectedMemberId || m.id?.toString() === selectedMemberId
    );

    const handleAssign = async () => {
        if (!selectedMember) return;

        const role = viewType === 'city' ? 'City_Admin' : 'Chapter_Admin';
        const cityId = selectedMember.cityId || selectedMember.city;

        const confirmMsg = viewType === 'city'
            ? `Are you sure you want to make "${selectedMember.name}" a City Admin for "${selectedMember.cityName || cityId}"?`
            : `Are you sure you want to make "${selectedMember.name}" a Chapter Admin?`;

        if (window.confirm(confirmMsg)) {
            setIsLoading(true);
            try {
                await assignNewAdmin(
                    selectedMember.id,
                    role,
                    cityId,
                    viewType === 'chapter' ? (selectedMember.chapterId || selectedMember.chapter) : null
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
                    <p className="page-subtitle">Select a member to assign as administrator.</p>
                </div>
            </header>

            <div className="form-container" style={{
                maxWidth: '700px',
                margin: '40px auto',
                padding: '32px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: 'var(--shadow-lg)'
            }}>
                {/* Search Members */}
                <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>
                        Search Members
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={memberSearch}
                            onChange={(e) => setMemberSearch(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 40px',
                                background: 'rgba(0, 0, 0, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: 'var(--radius-md)',
                                color: 'white',
                                fontSize: '15px',
                                boxSizing: 'border-box'
                            }}
                        />
                        {isFetchingMembers && (
                            <Loader2 size={16} className="spin" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-primary)' }} />
                        )}
                    </div>
                </div>

                {/* Members List */}
                <div className="form-group" style={{ marginBottom: '32px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>
                        Select Member ({membersForAssignment.length} available)
                    </label>
                    <div style={{
                        maxHeight: '300px',
                        overflowY: 'auto',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}>
                        {membersForAssignment.length > 0 ? (
                            membersForAssignment.map(member => {
                                const isSelected = selectedMemberId === member.id || selectedMemberId === member.id?.toString();
                                return (
                                    <div
                                        key={member.id}
                                        onClick={() => setSelectedMemberId(member.id)}
                                        style={{
                                            padding: '14px 18px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            cursor: 'pointer',
                                            background: isSelected ? 'rgba(108, 92, 231, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                            transition: 'background 0.2s',
                                            borderLeft: isSelected ? '3px solid var(--accent-primary)' : '3px solid transparent'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div className="user-avatar" style={{
                                                width: '36px', height: '36px', fontSize: '14px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                borderRadius: '50%', background: isSelected ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.1)',
                                                color: 'white', fontWeight: '600'
                                            }}>
                                                {(member.name || '?').charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                                                    {member.name || 'N/A'}
                                                </div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                    {member.cityName || member.city || ''}{member.chapterName || member.chapter ? ` • ${member.chapterName || member.chapter}` : ''}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                            #{member.id}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                {isFetchingMembers ? (
                                    <>
                                        <Loader2 size={20} className="spin" style={{ marginBottom: '8px' }} />
                                        <p>Loading members...</p>
                                    </>
                                ) : (
                                    <p>No members found{memberSearch ? ` matching "${memberSearch}"` : ''}.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Selected Member Preview */}
                {selectedMember && (
                    <div style={{
                        padding: '16px 20px',
                        background: 'rgba(108, 92, 231, 0.08)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(108, 92, 231, 0.2)',
                        marginBottom: '24px'
                    }}>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Selected:</p>
                        <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                            {selectedMember.name} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>#{selectedMember.id}</span>
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                            {selectedMember.cityName || selectedMember.city || 'N/A'}
                            {selectedMember.chapterName || selectedMember.chapter ? ` • ${selectedMember.chapterName || selectedMember.chapter}` : ''}
                        </p>
                    </div>
                )}

                {/* Assign Button */}
                <button
                    onClick={handleAssign}
                    disabled={!selectedMemberId || isLoading}
                    style={{
                        width: '100%',
                        padding: '14px',
                        background: selectedMemberId ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.05)',
                        color: selectedMemberId ? 'white' : 'rgba(255, 255, 255, 0.3)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: selectedMemberId ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: selectedMemberId ? 'var(--shadow-glow)' : 'none'
                    }}
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={18} className="spin" />
                            Assigning...
                        </>
                    ) : (
                        <>
                            <UserPlus size={18} />
                            Assign as {viewType === 'city' ? 'City' : 'Chapter'} Admin
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
