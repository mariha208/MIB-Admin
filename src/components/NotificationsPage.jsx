import React from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, Clock, ArrowLeft } from 'lucide-react';

const MOCK_NOTIFICATIONS = [
    {
        id: 1,
        type: 'success',
        title: 'New Chapter Added',
        message: 'Chapter 5 has been successfully added to Mumbai region.',
        time: '2 hours ago',
        read: false
    },
    {
        id: 2,
        type: 'info',
        title: 'Weekly Report Available',
        message: 'The weekly business report for Surat is now ready for review.',
        time: '5 hours ago',
        read: false
    },
    {
        id: 3,
        type: 'warning',
        title: 'Membership Expiry',
        message: '5 memberships are expiring in the next 7 days in Ahmedabad/Chatpata.',
        time: '1 day ago',
        read: true
    },
    {
        id: 4,
        type: 'success',
        title: 'Event Photos Uploaded',
        message: 'New photos for "Networking Dinner" have been uploaded by Admin.',
        time: '2 days ago',
        read: true
    },
    {
        id: 5,
        type: 'info',
        title: 'System Update',
        message: 'MIB Admin panel has been updated with the new "Sage Green" theme.',
        time: '3 days ago',
        read: true
    }
];

const getIcon = (type) => {
    switch (type) {
        case 'success':
            return <CheckCircle size={20} className="text-emerald-500" />;
        case 'warning':
            return <AlertTriangle size={20} className="text-amber-500" />;
        case 'info':
        default:
            return <Info size={20} className="text-blue-500" />;
    }
};

export default function NotificationsPage({ onNavigate }) {
    return (
        <div className="notifications-page animate-fade-in">

            <div className="table-controls">
                <h2 className="section-title text-white">Notifications</h2>
            </div>

            <div className="notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {MOCK_NOTIFICATIONS.map((notification) => (
                    <div
                        key={notification.id}
                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            padding: '1.5rem',
                            display: 'flex',
                            gap: '1rem',
                            position: 'relative',
                            transition: 'all var(--transition-base)',
                            cursor: 'pointer'
                        }}
                    >
                        <div className="notification-icon" style={{
                            background: 'var(--bg-secondary)',
                            padding: '10px',
                            borderRadius: '50%',
                            height: 'fit-content',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {getIcon(notification.type)}
                        </div>

                        <div className="notification-content" style={{ flex: 1 }}>
                            <div className="notification-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <h3 className="notification-title" style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    color: 'var(--text-primary)',
                                    margin: 0
                                }}>
                                    {notification.title}
                                </h3>
                                <div className="notification-time" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.85rem',
                                    color: 'var(--text-muted)'
                                }}>
                                    <Clock size={14} />
                                    {notification.time}
                                </div>
                            </div>
                            <p className="notification-message" style={{
                                color: 'var(--text-secondary)',
                                margin: 0,
                                lineHeight: '1.5'
                            }}>
                                {notification.message}
                            </p>
                        </div>

                        {!notification.read && (
                            <div className="unread-dot" style={{
                                position: 'absolute',
                                top: '1.5rem',
                                right: '1.5rem',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: 'var(--accent-primary)'
                            }} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
