import React, { useState, useEffect } from 'react';
import {
    Bell, CheckCircle, XCircle, Clock, RefreshCw,
    MapPin, User, Building2, AlertTriangle, X, Loader2, Inbox,
    ArrowLeftRight, ChevronRight, ArrowLeft, Users
} from 'lucide-react';
import { useData } from '../context/DataContext';

export default function NotificationsPage({ onNavigate }) {
    const {
        pendingChapters,
        chaptersLoading,
        fetchPendingChapterRequests,
        approveChapterRequest,
        rejectChapterRequest,
        // Member transfer request data
        pendingTransfers = [],
        transfersLoading = false,
        fetchPendingTransferRequests,
        approveTransferRequest,
        rejectTransferRequest,
    } = useData();

    const [activeView, setActiveView] = useState(null); // null = flash cards, 'chapters' or 'transfers'
    const [actionLoading, setActionLoading] = useState(null);
    const [rejectModal, setRejectModal] = useState({ open: false, id: null, name: '', type: '' });
    const [rejectReason, setRejectReason] = useState('');
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchPendingChapterRequests();
        if (fetchPendingTransferRequests) {
            fetchPendingTransferRequests();
        }
    }, []);

    // Auto-dismiss toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // ---- Chapter Request Handlers ----
    const handleApproveChapter = async (chapter) => {
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

    // ---- Transfer Request Handlers ----
    const handleApproveTransfer = async (transfer) => {
        const transferId = transfer._id || transfer.id;
        setActionLoading(transferId);
        try {
            if (approveTransferRequest) {
                await approveTransferRequest(transferId);
            }
            setToast({ type: 'success', message: `Transfer request for "${transfer.memberName || 'Member'}" approved!` });
        } catch (err) {
            setToast({ type: 'error', message: `Failed to approve transfer: ${err.message}` });
        } finally {
            setActionLoading(null);
        }
    };

    const openRejectModal = (item, type) => {
        setRejectModal({
            open: true,
            id: item._id || item.id,
            name: type === 'chapter'
                ? (item.name || item.chapterName || 'N/A')
                : (item.memberName || 'Member'),
            type
        });
        setRejectReason('');
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) return;
        const { id, type } = rejectModal;
        setActionLoading(id);
        setRejectModal({ open: false, id: null, name: '', type: '' });
        try {
            if (type === 'chapter') {
                await rejectChapterRequest(id, rejectReason.trim());
                setToast({ type: 'success', message: `Chapter request rejected.` });
            } else {
                if (rejectTransferRequest) {
                    await rejectTransferRequest(id, rejectReason.trim());
                }
                setToast({ type: 'success', message: `Transfer request rejected.` });
            }
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

    // ---- Flash Card Landing View ----
    const renderFlashCards = () => (
        <div className="notif-flash-cards-container animate-fade-in">
            <p className="notif-flash-subtitle">Select a category to view pending requests</p>
            <div className="notif-flash-grid">
                {/* New Chapter Request Card */}
                <button
                    className="notif-flash-card"
                    onClick={() => setActiveView('chapters')}
                    id="flash-card-chapter-request"
                >
                    <div className="notif-flash-icon-wrap notif-flash-icon-chapter">
                        <Building2 size={32} />
                    </div>
                    <div className="notif-flash-card-info">
                        <h3 className="notif-flash-card-title">New Chapter Request</h3>
                        <p className="notif-flash-card-desc">
                            Review and manage pending chapter creation requests from city admins
                        </p>
                    </div>
                    <div className="notif-flash-card-footer">
                        {pendingChapters.length > 0 ? (
                            <span className="notif-flash-badge notif-flash-badge-chapter">
                                {pendingChapters.length} Pending
                            </span>
                        ) : (
                            <span className="notif-flash-badge notif-flash-badge-clear">No Pending</span>
                        )}
                        <ChevronRight size={20} className="notif-flash-arrow" />
                    </div>
                </button>

                {/* Member Transfer Request Card */}
                <button
                    className="notif-flash-card"
                    onClick={() => setActiveView('transfers')}
                    id="flash-card-transfer-request"
                >
                    <div className="notif-flash-icon-wrap notif-flash-icon-transfer">
                        <ArrowLeftRight size={32} />
                    </div>
                    <div className="notif-flash-card-info">
                        <h3 className="notif-flash-card-title">Member Transfer Request</h3>
                        <p className="notif-flash-card-desc">
                            Review and manage member transfer requests between chapters
                        </p>
                    </div>
                    <div className="notif-flash-card-footer">
                        {pendingTransfers.length > 0 ? (
                            <span className="notif-flash-badge notif-flash-badge-transfer">
                                {pendingTransfers.length} Pending
                            </span>
                        ) : (
                            <span className="notif-flash-badge notif-flash-badge-clear">No Pending</span>
                        )}
                        <ChevronRight size={20} className="notif-flash-arrow" />
                    </div>
                </button>
            </div>
        </div>
    );

    // ---- Chapter Requests Detail View ----
    const renderChapterRequests = () => (
        <div className="animate-fade-in">
            {/* Section Header */}
            <div className="notif-header" style={{ borderBottom: 'none', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                <div className="notif-header-left">
                    <div className="notif-icon-wrap" style={{ width: '40px', height: '40px' }}>
                        <Building2 size={20} />
                    </div>
                    <div>
                        <h2 className="notif-title" style={{ fontSize: '1.3rem' }}>New Chapter Requests</h2>
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
                            <div className="notif-card-accent" />
                            <div className="notif-card-body">
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

                                <div className="notif-card-actions">
                                    <button
                                        className="notif-btn notif-btn-approve"
                                        onClick={() => handleApproveChapter(chapter)}
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
                                        onClick={() => openRejectModal(chapter, 'chapter')}
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
        </div>
    );

    // ---- Member Transfer Requests Detail View ----
    const renderTransferRequests = () => (
        <div className="animate-fade-in">
            {/* Section Header */}
            <div className="notif-header" style={{ borderBottom: 'none', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                <div className="notif-header-left">
                    <div className="notif-icon-wrap notif-icon-transfer" style={{ width: '40px', height: '40px' }}>
                        <ArrowLeftRight size={20} />
                    </div>
                    <div>
                        <h2 className="notif-title" style={{ fontSize: '1.3rem' }}>Member Transfer Requests</h2>
                        <p className="notif-subtitle" style={{ fontSize: '0.85rem' }}>
                            Pending member transfer requests between chapters
                        </p>
                    </div>
                </div>
                <div className="notif-header-right">
                    {pendingTransfers.length > 0 && (
                        <span className="notif-count-badge notif-count-transfer">{pendingTransfers.length} Pending</span>
                    )}
                    <button
                        className="notif-refresh-btn"
                        onClick={() => fetchPendingTransferRequests && fetchPendingTransferRequests()}
                        disabled={transfersLoading}
                        title="Refresh"
                    >
                        <RefreshCw size={18} className={transfersLoading ? 'spin-animation' : ''} />
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {transfersLoading && pendingTransfers.length === 0 && (
                <div className="notif-loading">
                    <Loader2 size={40} className="spin-animation" style={{ color: '#0984e3' }} />
                    <p>Loading pending transfer requests...</p>
                </div>
            )}

            {/* Empty State */}
            {!transfersLoading && pendingTransfers.length === 0 && (
                <div className="notif-empty">
                    <div className="notif-empty-icon" style={{ background: 'rgba(9, 132, 227, 0.08)', borderColor: 'rgba(9, 132, 227, 0.2)' }}>
                        <ArrowLeftRight size={56} style={{ color: '#0984e3' }} />
                    </div>
                    <h3>No Pending Transfer Requests</h3>
                    <p>All member transfer requests have been processed. New transfer requests will appear here.</p>
                </div>
            )}

            {/* Transfer Requests List */}
            <div className="notif-list">
                {pendingTransfers.map((transfer) => {
                    const transferId = transfer._id || transfer.id;
                    const isActing = actionLoading === transferId;
                    const memberName = transfer.userName || transfer.memberName || 'Unknown Member';
                    const memberEmail = transfer.memberEmail || transfer.userEmail || '';
                    const fromChapter = transfer.fromChapterName || transfer.fromChapter || transfer.currentChapter || 'N/A';
                    const toChapter = transfer.toChapterName || transfer.toChapter || transfer.requestedChapter || 'N/A';
                    const cityName = transfer.cityName || transfer.city || 'N/A';
                    const createdAt = transfer.createdAt || transfer.requestDate;
                    const reason = transfer.reason || transfer.transferReason || '';

                    return (
                        <div
                            key={transferId}
                            className={`notif-card notif-card-transfer ${isActing ? 'notif-card-acting' : ''}`}
                        >
                            <div className="notif-card-accent notif-card-accent-transfer" />
                            <div className="notif-card-body">
                                <div className="notif-card-top">
                                    <div className="notif-card-icon notif-card-icon-transfer">
                                        <ArrowLeftRight size={22} />
                                    </div>
                                    <div className="notif-card-info">
                                        <h3 className="notif-card-title">
                                            Member Transfer: <span className="notif-highlight-transfer">{memberName}</span>
                                        </h3>
                                        <p className="notif-card-desc">
                                            A request to transfer this member from one chapter to another.
                                        </p>
                                    </div>
                                    {createdAt && (
                                        <div className="notif-card-time">
                                            <Clock size={14} />
                                            <span>{getTimeAgo(createdAt)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="notif-details-grid">
                                    <div className="notif-detail">
                                        <User size={15} />
                                        <div>
                                            <span className="notif-detail-label">Member</span>
                                            <span className="notif-detail-value">{memberName}</span>
                                            {memberEmail && <span className="notif-detail-sub">{memberEmail}</span>}
                                        </div>
                                    </div>
                                    <div className="notif-detail">
                                        <Building2 size={15} />
                                        <div>
                                            <span className="notif-detail-label">From Chapter</span>
                                            <span className="notif-detail-value">{fromChapter}</span>
                                        </div>
                                    </div>
                                    <div className="notif-detail">
                                        <ArrowLeftRight size={15} />
                                        <div>
                                            <span className="notif-detail-label">To Chapter</span>
                                            <span className="notif-detail-value">{toChapter}</span>
                                        </div>
                                    </div>
                                    <div className="notif-detail">
                                        <MapPin size={15} />
                                        <div>
                                            <span className="notif-detail-label">City</span>
                                            <span className="notif-detail-value">{cityName}</span>
                                        </div>
                                    </div>
                                    {reason && (
                                        <div className="notif-detail" style={{ gridColumn: '1 / -1' }}>
                                            <AlertTriangle size={15} />
                                            <div>
                                                <span className="notif-detail-label">Reason</span>
                                                <span className="notif-detail-value">{reason}</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="notif-detail">
                                        <AlertTriangle size={15} />
                                        <div>
                                            <span className="notif-detail-label">Status</span>
                                            <span className="notif-status-badge notif-status-transfer">Pending Approval</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="notif-card-actions">
                                    <button
                                        className="notif-btn notif-btn-approve"
                                        onClick={() => handleApproveTransfer(transfer)}
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
                                        onClick={() => openRejectModal(transfer, 'transfer')}
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
        </div>
    );

    return (
        <main className="main-content">
            <header className="page-header center-header">
                <div className="header-content">
                    <h1 className="page-title">Notifications</h1>
                </div>
            </header>

            <div className="notifications-page animate-fade-in">
                {/* Back Button when viewing a detail section */}
                {activeView && (
                    <div className="back-btn-container">
                        <button className="back-btn" onClick={() => setActiveView(null)}>
                            <ArrowLeft size={18} />
                            <span>Back to Notifications</span>
                        </button>
                    </div>
                )}

                {/* Render the appropriate view */}
                {!activeView && renderFlashCards()}
                {activeView === 'chapters' && renderChapterRequests()}
                {activeView === 'transfers' && renderTransferRequests()}

                {/* Reject Reason Modal */}
                {rejectModal.open && (
                    <div className="modal-overlay" style={{ zIndex: 9999, backdropFilter: 'blur(12px)', background: 'rgba(0,0,0,0.7)' }}
                        onClick={() => setRejectModal({ open: false, id: null, name: '', type: '' })}
                    >
                        <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()} style={{
                            maxWidth: '480px',
                            background: '#1C2336',
                            border: '1px solid rgba(255,118,117,0.3)',
                            boxShadow: '0 0 50px rgba(0,0,0,0.5), 0 0 30px rgba(255,118,117,0.1)',
                        }}>
                            <button
                                onClick={() => setRejectModal({ open: false, id: null, name: '', type: '' })}
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
                                    Reject {rejectModal.type === 'chapter' ? 'Chapter' : 'Transfer'} Request
                                </h2>
                            </div>
                            <div style={{ padding: 'var(--spacing-xl) var(--spacing-2xl) var(--spacing-2xl)' }}>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)', lineHeight: 1.6 }}>
                                    You are about to reject the {rejectModal.type === 'chapter' ? 'chapter' : 'transfer'} request for <strong style={{ color: 'var(--text-primary)' }}>"{rejectModal.name}"</strong>.
                                    {rejectModal.type === 'chapter'
                                        ? ' This will delete the inactive chapter and admin records.'
                                        : ' The member will remain in their current chapter.'}
                                </p>
                                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Reason for Rejection *
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Provide a reason for rejecting this request..."
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
                                        onClick={() => setRejectModal({ open: false, id: null, name: '', type: '' })}
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
