import { useState, useMemo } from 'react';
import { ArrowLeft, Search, ChevronDown, UserPlus, Check } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function AdminForm({ mode = 'create', adminId, onNavigate, viewType = 'chapter' }) {
    const { data, updateUser } = useData();
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedChapter, setSelectedChapter] = useState('');
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Get unique cities from users
    const cities = useMemo(() => {
        const uniqueCities = [...new Set(data.users.map(u => u.city))].sort();
        return uniqueCities;
    }, [data.users]);

    // Get chapters based on selected city
    const chapters = useMemo(() => {
        if (!selectedCity) return [];
        const cityChapters = data.users
            .filter(u => u.city === selectedCity && u.chapter !== 'All')
            .map(u => u.chapter);
        return [...new Set(cityChapters)].sort();
    }, [data.users, selectedCity]);

    // Get available members based on selection
    const availableMembers = useMemo(() => {
        if (!selectedCity) return [];
        if (viewType === 'chapter' && !selectedChapter) return [];

        return data.users.filter(user => {
            const matchesCity = user.city === selectedCity;
            const matchesChapter = viewType === 'city' ? true : user.chapter === selectedChapter;
            const isUser = user.role === 'User';

            // For city admin, we want to see all users in that city
            // For chapter admin, we want to see users in that specific chapter
            return matchesCity && matchesChapter && isUser;
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [data.users, selectedCity, selectedChapter, viewType]);

    const handleAssign = async () => {
        if (!selectedMemberId) return;

        const member = data.users.find(u => u.id.toString() === selectedMemberId);
        if (!member) return;

        // Validation for existing admin
        const targetChapter = viewType === 'city' ? 'All' : selectedChapter;

        const existingAdmin = data.users.find(u =>
            u.city === selectedCity &&
            u.chapter === targetChapter &&
            u.role === 'City Admin' &&
            (u.approvalStatus === 'Approved' || !u.approvalStatus)
        );

        if (existingAdmin) {
            const level = viewType === 'city' ? 'City' : `Chapter (${selectedChapter})`;
            alert(`Warning: '${selectedCity} - ${level}' already has an assigned Admin (${existingAdmin.name}).\n\nPlease remove the existing admin first.`);
            return;
        }

        const confirmMsg = viewType === 'city'
            ? `Are you sure you want to make ${member.name} the Admin for the entire city of ${selectedCity}?`
            : `Are you sure you want to make ${member.name} the Admin for ${selectedCity} - ${selectedChapter}?`;

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
                    <p className="page-subtitle">Select a member to assign as administrator.</p>
                </div>
            </header>

            <div className="form-container" style={{
                maxWidth: '600px',
                margin: '40px auto',
                padding: '32px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: 'var(--shadow-lg)'
            }}>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Select City</label>
                    <div className="select-wrapper" style={{ position: 'relative' }}>
                        <select
                            value={selectedCity}
                            onChange={(e) => {
                                setSelectedCity(e.target.value);
                                setSelectedChapter('');
                                setSelectedMemberId('');
                            }}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'rgba(0, 0, 0, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: 'var(--radius-md)',
                                color: 'white',
                                fontSize: '15px',
                                appearance: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="">Select a city...</option>
                            {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }} />
                    </div>
                </div>

                {viewType === 'chapter' && (
                    <div className="form-group" style={{ marginBottom: '24px', opacity: selectedCity ? 1 : 0.5, pointerEvents: selectedCity ? 'auto' : 'none', transition: 'all 0.3s' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Select Chapter</label>
                        <div className="select-wrapper" style={{ position: 'relative' }}>
                            <select
                                value={selectedChapter}
                                onChange={(e) => {
                                    setSelectedChapter(e.target.value);
                                    setSelectedMemberId('');
                                }}
                                disabled={!selectedCity}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'white',
                                    fontSize: '15px',
                                    appearance: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="">Select a chapter...</option>
                                {chapters.map(chapter => (
                                    <option key={chapter} value={chapter}>{chapter}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }} />
                        </div>
                    </div>
                )}

                <div className="form-group" style={{ marginBottom: '32px', opacity: (selectedCity && (viewType === 'city' || selectedChapter)) ? 1 : 0.5, pointerEvents: (selectedCity && (viewType === 'city' || selectedChapter)) ? 'auto' : 'none', transition: 'all 0.3s' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Select Member</label>
                    <div className="select-wrapper" style={{ position: 'relative' }}>
                        <select
                            value={selectedMemberId}
                            onChange={(e) => setSelectedMemberId(e.target.value)}
                            disabled={!selectedCity || (viewType === 'chapter' && !selectedChapter)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'rgba(0, 0, 0, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: 'var(--radius-md)',
                                color: 'white',
                                fontSize: '15px',
                                appearance: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="">Select a member to promote...</option>
                            {availableMembers.map(member => (
                                <option key={member.id} value={member.id}>{member.name} (#{member.id})</option>
                            ))}
                        </select>
                        <ChevronDown size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }} />
                    </div>
                </div>

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
                        'Assigning...'
                    ) : (
                        <>
                            <UserPlus size={18} />
                            Assign {viewType === 'city' ? 'City' : 'Chapter'} Admin
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
