export default function StatCard({
    title,
    value,
    icon: Icon,
    change,
    changeType = 'positive',
    delay = 0,
    onClick
}) {
    return (
        <div
            className={`stat-card animate-fade-in animate-delay-${delay} ${onClick ? 'clickable' : ''}`}
            style={{ opacity: 0 }}
            onClick={onClick}
        >
            <div className="stat-card-header">
                <span className="stat-card-title">{title}</span>
                {Icon && (
                    <div className="stat-card-icon">
                        <Icon size={20} />
                    </div>
                )}
            </div>
            <div className="stat-card-value">{value}</div>
            {change && (
                <div className={`stat-card-change ${changeType}`}>
                    <span>{changeType === 'positive' ? '↑' : '↓'} {change}</span>
                    <span>vs last month</span>
                </div>
            )}
        </div>
    );
}
