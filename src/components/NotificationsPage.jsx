import React, { useState, useEffect } from 'react';
import {
    Bell, CheckCircle, XCircle, Clock, RefreshCw,
    MapPin, User, Building2, AlertTriangle, X, Loader2, Inbox
} from 'lucide-react';
import { useData } from '../context/DataContext';

export default function NotificationsPage({ onNavigate }) {
    const {
        pendingChapters,
        chaptersLoading,
        fetchPendingChapterRequests,
        approveChapterRequest,
        rejectChapterRequest,
    } = useData();

    const [actionLoading, setActionLoading] = useState(null); // chapterId being acted on
    const [rejectModal, setRejectModal] = useState({ open: false, chapterId: null, chapterName: '' });
    const [rejectReason, setRejectReason] = useState('');
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchPendingChapterRequests();
    }, []);

    // Auto-dismiss toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleApprove = async (chapter) => {
        const chapterId = chapter._id || chapter.id;
        setActionLoading(chapterId);
        try {
            await approveChapterRequest(chapterId);
            setToast({ type: 'success', message: `Chapter "${chapter.name || chapter.chapterName || 'N/A'}" approved successfully!` });
        } catch (err) {
            setToast({ type: 'error', message: `Failed to approve: ${err.message}` });
        } finally {
            setActionLoading(null);
        }
    };

    const openRejectModal = (chapter) => {
        setRejectModal({
            open: true,
            chapterId: chapter._id || chapter.id,
            chapterName: chapter.name || chapter.chapterName || 'N/A'
        });
        setRejectReason('');
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) return;
        const { chapterId } = rejectModal;
        setActionLoading(chapterId);
        setRejectModal({ open: false, chapterId: null, chapterName: '' });
        try {
            await rejectChapterRequest(chapterId, rejectReason.trim());
            setToast({ type: 'success', message: `Chapter request rejected.` });
        } catch (err) {
            setToast({ type: 'error', message: `Failed to reject: ${err.message}` });
        } finally {
            setActionLoading(null);
            setRejectReason('');
        }
    };

    const getTimeAgo = (dateStr) => {
        if (!dateStr) return '';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <main className="main-content">
            <header className="page-header center-header">
                <div className="header-content">
                    <h1 className="page-title">Notifications</h1>
                </div>
            </header>

            <div className="notifications-page animate-fade-in">
                {/* Section Header */}
                <div className="notif-header" style={{ borderBottom: 'none', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                    <div className="notif-header-left">
                        <div className="notif-icon-wrap" style={{ width: '40px', height: '40px' }}>
                            <Bell size={20} />
                        </div>
                        <div>
                            <h2 className="notif-title" style={{ fontSize: '1.3rem' }}>Chapter Requests</h2>
                            <p className="notif-subtitle" style={{ fontSize: '0.85rem' }}>
                                Pending chapter creation requests from city admins
                            </p>
                        </div>
                    </div>
                    <div className="notif-header-right">
                        {pendingChapters.length > 0 && (
                            <span className="notif-count-badge">{pendingChapters.length} Pending</span>
                        )}
                        <button
                            className="notif-refresh-btn"
                            onClick={() => fetchPendingChapterRequests()}
                            disabled={chaptersLoading}
                            title="Refresh"
                        >
                            <RefreshCw size={18} className={chaptersLoading ? 'spin-animation' : ''} />
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {chaptersLoading && pendingChapters.length === 0 && (
                    <div className="notif-loading">
                        <Loader2 size={40} className="spin-animation" style={{ color: 'var(--accent-primary)' }} />
                        <p>Loading pending chapter requests...</p>
                    </div>
                )}

                {/* Empty State */}
                {!chaptersLoading && pendingChapters.length === 0 && (
                    <div className="notif-empty">
                        <div className="notif-empty-icon">
                            <Inbox size={56} />
                        </div>
                        <h3>No Pending Requests</h3>
                        <p>All chapter creation requests have been processed. New requests from city admins will appear here.</p>
                    </div>
                )}

                {/* Chapter Requests List */}
                <div className="notif-list">
                    {pendingChapters.map((chapter) => {
                        const chapterId = chapter._id || chapter.id;
                        const isActing = actionLoading === chapterId;
                        const chapterName = chapter.name || chapter.chapterName || 'Unnamed Chapter';
                        const adminName = chapter.requestedByName || chapter.adminName || chapter.admin?.name || chapter.createdBy?.name || 'Unknown Admin';
                        const adminEmail = chapter.requestedByEmail || chapter.adminEmail || chapter.admin?.email || chapter.createdBy?.email || '';
                        const cityName = chapter.cityName || chapter.city || 'N/A';
                        const createdAt = chapter.createdAt || chapter.requestDate;

                        return (
                            <div
                                key={chapterId}
                                className={`notif-card ${isActing ? 'notif-card-acting' : ''}`}
                            >
                                {/* Card Accent */}
                                <div className="notif-card-accent" />

                                <div className="notif-card-body">
                                    {/* Top Row: Icon + Info + Time */}
                                    <div className="notif-card-top">
                                        <div className="notif-card-icon">
                                            <Building2 size={22} />
                                        </div>
                                        <div className="notif-card-info">
                                            <h3 className="notif-card-title">
                                                New Chapter Request: <span className="notif-highlight">{chapterName}</span>
                                            </h3>
                                            <p className="notif-card-desc">
                                                A city admin has requested to create a new chapter with an assigned chapter admin.
                                            </p>
                                        </div>
                                        {createdAt && (
                                            <div className="notif-card-time">
                                                <Clock size={14} />
                                                <span>{getTimeAgo(createdAt)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Details Grid */}
                                    <div className="notif-details-grid">
                                        <div className="notif-detail">
                                            <Building2 size={15} />
                                            <div>
                                                <span className="notif-detail-label">Chapter Name</span>
                                                <span className="notif-detail-value">{chapterName}</span>
                                            </div>
                                        </div>
                                        <div className="notif-detail">
                                            <User size={15} />
                                            <div>
                                                <span className="notif-detail-label">Chapter Admin</span>
                                                <span className="notif-detail-value">{adminName}</span>
                                                {adminEmail && <span className="notif-detail-sub">{adminEmail}</span>}
                                            </div>
                                        </div>
                                        <div className="notif-detail">
                                            <MapPin size={15} />
                                            <div>
                                                <span className="notif-detail-label">City</span>
                                                <span className="notif-detail-value">{cityName}</span>
                                            </div>
                                        </div>
                                        <div className="notif-detail">
                                            <AlertTriangle size={15} />
                                            <div>
                                                <span className="notif-detail-label">Status</span>
                                                <span className="notif-status-badge">Pending Approval</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="notif-card-actions">
                                        <button
                                            className="notif-btn notif-btn-approve"
                                            onClick={() => handleApprove(chapter)}
                                            disabled={isActing}
                                        >
                                            {isActing ? (
                                                <Loader2 size={16} className="spin-animation" />
                                            ) : (
                                                <CheckCircle size={16} />
                                            )}
                                            <span>Approve</span>
                                        </button>
                                        <button
                                            className="notif-btn notif-btn-reject"
                                            onClick={() => openRejectModal(chapter)}
                                            disabled={isActing}
                                        >
                                            <XCircle size={16} />
                                            <span>Reject</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Reject Reason Modal */}
                {rejectModal.open && (
                    <div className="modal-overlay" style={{ zIndex: 9999, backdropFilter: 'blur(12px)', background: 'rgba(0,0,0,0.7)' }}
                        onClick={() => setRejectModal({ open: false, chapterId: null, chapterName: '' })}
                    >
                        <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()} style={{
                            maxWidth: '480px',
                            background: '#1C2336',
                            border: '1px solid rgba(255,118,117,0.3)',
                            boxShadow: '0 0 50px rgba(0,0,0,0.5), 0 0 30px rgba(255,118,117,0.1)',
                        }}>
                            <button
                                onClick={() => setRejectModal({ open: false, chapterId: null, chapterName: '' })}
                                style={{
                                    position: 'absolute', top: '16px', right: '16px',
                                    background: 'transparent', border: 'none',
                                    color: 'var(--text-muted)', cursor: 'pointer', zIndex: 1,
                                }}
                            >
                                <X size={20} />
                            </button>
                            <div className="modal-header" style={{ background: 'rgba(255,118,117,0.08)', borderColor: 'rgba(255,118,117,0.2)' }}>
                                <h2 className="modal-title" style={{ color: '#ff7675', fontSize: '1.15rem' }}>
                                    <XCircle size={20} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
                                    Reject Chapter Request
                                </h2>
                            </div>
                            <div style={{ padding: 'var(--spacing-xl) var(--spacing-2xl) var(--spacing-2xl)' }}>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)', lineHeight: 1.6 }}>
                                    You are about to reject the chapter <strong style={{ color: 'var(--text-primary)' }}>"{rejectModal.chapterName}"</strong>.
                                    This will delete the inactive chapter and admin records.
                                </p>
                                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Reason for Rejection *
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Provide a reason for rejecting this chapter request..."
                                    rows={4}
                                    style={{
                                        width: '100%', background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                                        padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px',
                                        resize: 'vertical', fontFamily: 'var(--font-family)',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#ff7675'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                                />
                                <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-xl)', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => setRejectModal({ open: false, chapterId: null, chapterName: '' })}
                                        style={{
                                            padding: '10px 20px', background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                                            color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '500',
                                            transition: 'all 0.2s', fontSize: '14px',
                                        }}
                                        onMouseOver={(e) => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.color = 'var(--text-primary)'; }}
                                        onMouseOut={(e) => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.color = 'var(--text-secondary)'; }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        disabled={!rejectReason.trim()}
                                        style={{
                                            padding: '10px 24px', background: rejectReason.trim() ? '#ff7675' : 'rgba(255,118,117,0.3)',
                                            border: 'none', borderRadius: 'var(--radius-md)',
                                            color: 'white', cursor: rejectReason.trim() ? 'pointer' : 'not-allowed',
                                            fontWeight: '600', transition: 'all 0.2s', fontSize: '14px',
                                            boxShadow: rejectReason.trim() ? '0 4px 15px rgba(255,118,117,0.3)' : 'none',
                                        }}
                                    >
                                        Confirm Rejection
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toast Notification */}
                {toast && (
                    <div className={`notif-toast notif-toast-${toast.type}`}>
                        {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                        <span>{toast.message}</span>
                        <button onClick={() => setToast(null)} className="notif-toast-close">
                            <X size={14} />
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
