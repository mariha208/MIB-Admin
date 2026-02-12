import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Trash2, UserPlus } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function AdminForm({ mode = 'create', adminId, onNavigate }) {
    const { data, addUser, updateUser, deleteUser } = useData();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        city: '',
        chapter: '',
        role: 'City Admin'
    });

    const uniqueCities = [...new Set(data.chapters.map(c => c.city))];
    const availableChapters = data.chapters
        .filter(c => !formData.city || c.city === formData.city)
        .map(c => c.name);

    useEffect(() => {
        if (mode === 'edit' && adminId) {
            const admin = data.users.find(u => u.id === parseInt(adminId));
            if (admin) {
                setFormData({
                    name: admin.name || '',
                    email: admin.email || '',
                    password: admin.password || '',
                    phone: admin.phone || '',
                    city: admin.city || '',
                    chapter: admin.chapter || '',
                    role: admin.role || 'City Admin'
                });
            }
        }
    }, [mode, adminId, data.users]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'create') {
                await addUser({ ...formData, status: 'Active' });
            } else {
                await updateUser(parseInt(adminId), formData);
            }
            onNavigate('admins');
        } catch (error) {
            console.error('Failed to save admin:', error);
            alert('Failed to save admin. Please try again.');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
            try {
                await deleteUser(parseInt(adminId));
                onNavigate('admins');
            } catch (error) {
                console.error('Failed to delete admin:', error);
                alert('Failed to delete admin. Please try again.');
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
                            fontSize: '14px'
                        }}
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                    <h1 className="page-title">{mode === 'create' ? 'Create New Admin' : 'Edit Admin'}</h1>
                </div>
            </header>

            <div className="admin-form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit} className="control-form" style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-color)',
                    padding: 'var(--spacing-xl)'
                }}>

                    <div className="form-section">
                        <h3 className="section-label" style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                            Personal Information
                        </h3>
                        <div className="field-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Full Name</label>
                                <input
                                    required
                                    type="text"
                                    className="control-input"
                                    style={{ width: '100%' }}
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Phone Number</label>
                                <input
                                    type="tel"
                                    className="control-input"
                                    style={{ width: '100%' }}
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+91..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section" style={{ marginTop: '24px' }}>
                        <h3 className="section-label" style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                            Account Details
                        </h3>
                        <div className="field-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Email Address</label>
                                <input
                                    required
                                    type="email"
                                    className="control-input"
                                    style={{ width: '100%' }}
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="admin@example.com"
                                />
                            </div>
                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Password</label>
                                <input
                                    required={mode === 'create'}
                                    type="text"
                                    className="control-input"
                                    style={{ width: '100%' }}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder={mode === 'edit' ? "Leave blank to keep current" : "Set password"}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section" style={{ marginTop: '24px' }}>
                        <h3 className="section-label" style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                            Assignment
                        </h3>
                        <div className="field-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>City</label>
                                <div className="filter-select-wrapper">
                                    <select
                                        required
                                        className="control-input"
                                        style={{ width: '100%' }}
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value, chapter: '' })}
                                    >
                                        <option value="">Select City</option>
                                        {uniqueCities.map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Chapter</label>
                                <div className="filter-select-wrapper">
                                    <select
                                        required
                                        className="control-input"
                                        style={{ width: '100%' }}
                                        value={formData.chapter}
                                        onChange={e => setFormData({ ...formData, chapter: e.target.value })}
                                        disabled={!formData.city}
                                    >
                                        <option value="">Select Chapter</option>
                                        {availableChapters.map(chapter => (
                                            <option key={chapter} value={chapter}>{chapter}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions" style={{ display: 'flex', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
                        <button
                            type="submit"
                            className="submit-btn"
                            style={{
                                flex: 1,
                                background: 'var(--accent-gradient)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '12px'
                            }}
                        >
                            <Save size={18} />
                            {mode === 'create' ? 'Create Admin' : 'Save Changes'}
                        </button>

                        {mode === 'edit' && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                style={{
                                    padding: '0 16px',
                                    background: 'rgba(255, 118, 117, 0.1)',
                                    color: '#ff7675',
                                    border: '1px solid rgba(255, 118, 117, 0.2)',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                title="Delete Admin"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
