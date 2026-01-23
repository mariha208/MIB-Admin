import {
    LayoutDashboard,
    Users,
    Settings,
    Briefcase,
    Share2,
    UserPlus,
    UserCheck,
    Menu,
    X,
    Shield,
    Bell,
} from 'lucide-react';

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'controls', label: 'Controls', icon: Shield },
    { id: 'business', label: 'Business', icon: Briefcase },
    { id: 'referrals', label: 'Referrals', icon: Share2 },
    { id: '1-2-1', label: '1-2-1', icon: UserPlus },
    { id: 'visitors', label: 'Visitors', icon: UserCheck },
    { id: 'login', label: 'Login Detail', icon: Settings },
];

export default function Sidebar({ activeItem = 'dashboard', onNavClick, isOpen, onToggle }) {
    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo" onClick={onToggle} style={{ cursor: 'pointer' }}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </div>
                <h1 className="sidebar-title">MIB Admin</h1>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                        <a
                            key={item.id}
                            className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                onNavClick?.(item.id);
                                if (isOpen) onToggle(); // Close sidebar after click
                            }}
                            href="#"
                        >
                            <IconComponent className="nav-item-icon" size={20} />
                            <span className="nav-item-text">{item.label}</span>
                        </a>
                    );
                })}
            </nav>
        </aside>
    );
}
