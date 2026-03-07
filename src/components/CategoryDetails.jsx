import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronRight, Download, Users, MapPin, Building2, TrendingUp, RefreshCw } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatIndianCurrency } from '../utils/formatters';

const CATEGORY_CONFIG = {
    business: {
        title: 'Business Analytics',
        metric: 'business',
        apiMetric: 'business',
        grandTotalLabel: 'Grand Total Business',
        userStatKey: 'totalBusinessTaken',
        userStatLabel: 'Business Taken',
        formatValue: (v) => `₹ ${formatIndianCurrency(v)}`,
        gradient: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
        color: '#667EEA',
    },
    referrals: {
        title: 'Referral Analytics',
        metric: 'referrals',
        apiMetric: 'referrals',
        grandTotalLabel: 'Grand Total Referrals',
        userStatKey: 'totalReferrals',
        userStatLabel: 'Referrals Given',
        formatValue: (v) => v.toLocaleString(),
        gradient: 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)',
        color: '#43E97B',
    },
    '1-2-1': {
        title: '1-to-1 Meeting Analytics',
        metric: 'one-to-one',
        apiMetric: 'one-to-one',
        grandTotalLabel: 'Grand Total 1-to-1 Meetings',
        userStatKey: 'totalOneToOne',
        userStatLabel: 'Meetings',
        formatValue: (v) => v.toLocaleString(),
        gradient: 'linear-gradient(135deg, #FA709A 0%, #FEE140 100%)',
        color: '#FA709A',
    },
    visitors: {
        title: 'Visitor Analytics',
        metric: 'visitors',
        apiMetric: 'visitors',
        grandTotalLabel: 'Grand Total Visitors',
        userStatKey: 'chapterTotal',
        userStatLabel: 'Visitors',
        formatValue: (v) => v.toLocaleString(),
        gradient: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
        color: '#4FACFE',
    },
};

export default function CategoryDetails({ type = 'business' }) {
    const {
        superAdminBusiness,
        superAdminReferrals,
        superAdminOneToOne,
        superAdminVisitors,
        superAdminLoading,
        fetchSuperAdminMetric,
    } = useData();

    const config = CATEGORY_CONFIG[type] || CATEGORY_CONFIG.business;

    // Track which cities/chapters are expanded
    const [expandedCities, setExpandedCities] = useState({});
    const [expandedChapters, setExpandedChapters] = useState({});

    // Fetch data on mount or type change
    useEffect(() => {
        fetchSuperAdminMetric(config.apiMetric);
    }, [type]);

    // Select the right data based on type
    const metricData = useMemo(() => {
        switch (config.apiMetric) {
            case 'business': return superAdminBusiness;
            case 'referrals': return superAdminReferrals;
            case 'one-to-one': return superAdminOneToOne;
            case 'visitors': return superAdminVisitors;
            default: return null;
        }
    }, [config.apiMetric, superAdminBusiness, superAdminReferrals, superAdminOneToOne, superAdminVisitors]);

    const toggleCity = (cityId) => {
        setExpandedCities((prev) => ({ ...prev, [cityId]: !prev[cityId] }));
    };

    const toggleChapter = (chapterId) => {
        setExpandedChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
    };

    const handleRefresh = () => {
        fetchSuperAdminMetric(config.apiMetric);
    };

    // Loading state
    if (superAdminLoading && !metricData) {
        return (
            <div className="category-details-page animate-fade-in" style={{ padding: 'var(--spacing-xl)' }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '300px',
                    gap: 'var(--spacing-lg)',
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        border: '4px solid var(--border-color)',
                        borderTopColor: config.color,
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                    }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                        Loading {config.title.toLowerCase()}...
                    </p>
                </div>
            </div>
        );
    }

    // No data state
    if (!metricData || !metricData.cities) {
        return (
            <div className="category-details-page animate-fade-in" style={{ padding: 'var(--spacing-xl)' }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '300px',
                    gap: 'var(--spacing-lg)',
                }}>
                    <MapPin size={48} style={{ color: 'var(--text-muted)' }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                        No data available. Click refresh to try again.
                    </p>
                    <button
                        onClick={handleRefresh}
                        style={{
                            background: config.gradient,
                            border: 'none',
                            color: 'white',
                            padding: '10px 24px',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>
            </div>
        );
    }

    const { grandTotal, cities } = metricData;

    return (
        <div className="category-details-page animate-fade-in" style={{ padding: '0 var(--spacing-lg) var(--spacing-xl)' }}>
            {/* Grand Total Banner */}
            <div style={{
                background: config.gradient,
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--spacing-xl) var(--spacing-2xl)',
                marginBottom: 'var(--spacing-xl)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* decorative circle */}
                <div style={{
                    position: 'absolute',
                    right: '-40px',
                    top: '-40px',
                    width: '160px',
                    height: '160px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                }} />
                <div>
                    <p style={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '13px',
                        fontWeight: '600',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        marginBottom: '4px',
                    }}>
                        {config.grandTotalLabel}
                    </p>
                    <p style={{
                        color: 'white',
                        fontSize: '36px',
                        fontWeight: '800',
                        lineHeight: 1.1,
                    }}>
                        {config.formatValue(grandTotal)}
                    </p>
                    <p style={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '13px',
                        marginTop: '6px',
                    }}>
                        Across {cities.length} {cities.length === 1 ? 'city' : 'cities'}
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={superAdminLoading}
                    style={{
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: 'var(--radius-md)',
                        cursor: superAdminLoading ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                        opacity: superAdminLoading ? 0.6 : 1,
                        zIndex: 1,
                    }}
                >
                    <RefreshCw size={16} style={{
                        animation: superAdminLoading ? 'spin 1s linear infinite' : 'none',
                    }} />
                    {superAdminLoading ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            {/* Cities Accordion */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {cities.map((cityData) => {
                    const isCityOpen = expandedCities[cityData.cityId] ?? false;

                    return (
                        <div key={cityData.cityId} style={{
                            background: 'var(--bg-card)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border-color)',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                        }}>
                            {/* City Header */}
                            <button
                                onClick={() => toggleCity(cityData.cityId)}
                                style={{
                                    width: '100%',
                                    padding: 'var(--spacing-lg) var(--spacing-xl)',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    transition: 'background 0.2s',
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                    <div style={{
                                        width: '42px',
                                        height: '42px',
                                        borderRadius: 'var(--radius-md)',
                                        background: config.gradient,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <MapPin size={20} color="white" />
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <p style={{
                                            color: 'var(--text-primary)',
                                            fontSize: '16px',
                                            fontWeight: '700',
                                            marginBottom: '2px',
                                        }}>
                                            {cityData.cityName}
                                        </p>
                                        <p style={{
                                            color: 'var(--text-muted)',
                                            fontSize: '13px',
                                        }}>
                                            {cityData.chapters?.length || 0} chapters
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
                                    <div style={{
                                        background: `${config.color}15`,
                                        padding: '6px 16px',
                                        borderRadius: 'var(--radius-full)',
                                        border: `1px solid ${config.color}30`,
                                    }}>
                                        <span style={{
                                            color: config.color,
                                            fontSize: '14px',
                                            fontWeight: '700',
                                        }}>
                                            {config.formatValue(cityData.cityTotal)}
                                        </span>
                                    </div>
                                    <div style={{
                                        transform: isCityOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s',
                                        color: 'var(--text-muted)',
                                    }}>
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            </button>

                            {/* City Body — chapters */}
                            {isCityOpen && (
                                <div style={{
                                    padding: '0 var(--spacing-xl) var(--spacing-lg)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 'var(--spacing-sm)',
                                }}>
                                    {cityData.chapters.map((chapterData) => {
                                        const isChapterOpen = expandedChapters[chapterData.chapterId] ?? false;
                                        const hasUsers = chapterData.users && chapterData.users.length > 0;

                                        return (
                                            <div key={chapterData.chapterId} style={{
                                                background: 'rgba(255,255,255,0.02)',
                                                borderRadius: 'var(--radius-md)',
                                                border: '1px solid var(--border-color)',
                                                overflow: 'hidden',
                                            }}>
                                                {/* Chapter Header */}
                                                <button
                                                    onClick={() => hasUsers && toggleChapter(chapterData.chapterId)}
                                                    style={{
                                                        width: '100%',
                                                        padding: 'var(--spacing-md) var(--spacing-lg)',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        cursor: hasUsers ? 'pointer' : 'default',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        transition: 'background 0.2s',
                                                    }}
                                                    onMouseOver={(e) => hasUsers && (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                                        <div style={{
                                                            width: '34px',
                                                            height: '34px',
                                                            borderRadius: 'var(--radius-sm)',
                                                            background: 'rgba(255,255,255,0.05)',
                                                            border: '1px solid var(--border-color)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}>
                                                            <Building2 size={16} style={{ color: 'var(--text-muted)' }} />
                                                        </div>
                                                        <div style={{ textAlign: 'left' }}>
                                                            <p style={{
                                                                color: 'var(--text-primary)',
                                                                fontSize: '14px',
                                                                fontWeight: '600',
                                                                marginBottom: '1px',
                                                            }}>
                                                                {chapterData.chapterName}
                                                            </p>
                                                            <p style={{
                                                                color: 'var(--text-muted)',
                                                                fontSize: '12px',
                                                            }}>
                                                                {chapterData.memberCount} members
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                                        <span style={{
                                                            color: config.color,
                                                            fontSize: '14px',
                                                            fontWeight: '700',
                                                        }}>
                                                            {config.formatValue(chapterData.chapterTotal)}
                                                        </span>
                                                        {hasUsers && (
                                                            <div style={{
                                                                transform: isChapterOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                transition: 'transform 0.2s',
                                                                color: 'var(--text-muted)',
                                                            }}>
                                                                <ChevronDown size={16} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>

                                                {/* Chapter Body — users table */}
                                                {isChapterOpen && hasUsers && (
                                                    <div style={{
                                                        borderTop: '1px solid var(--border-color)',
                                                        overflow: 'auto',
                                                    }}>
                                                        <table className="data-table" style={{ margin: 0 }}>
                                                            <thead>
                                                                <tr>
                                                                    <th style={{ padding: '10px 16px', fontSize: '12px' }}>#</th>
                                                                    <th style={{ padding: '10px 16px', fontSize: '12px' }}>Member</th>
                                                                    <th style={{ padding: '10px 16px', fontSize: '12px' }}>Email</th>
                                                                    <th style={{ padding: '10px 16px', fontSize: '12px' }}>Phone</th>
                                                                    <th style={{ padding: '10px 16px', fontSize: '12px', textAlign: 'right' }}>
                                                                        {config.userStatLabel}
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {chapterData.users.map((u, idx) => (
                                                                    <tr key={u.id}>
                                                                        <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                                                            {idx + 1}
                                                                        </td>
                                                                        <td style={{ padding: '10px 16px' }}>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                                <div style={{
                                                                                    width: '32px',
                                                                                    height: '32px',
                                                                                    borderRadius: '50%',
                                                                                    background: config.gradient,
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    fontSize: '13px',
                                                                                    fontWeight: '700',
                                                                                    color: 'white',
                                                                                    flexShrink: 0,
                                                                                }}>
                                                                                    {u.name?.charAt(0) || '?'}
                                                                                </div>
                                                                                <span style={{
                                                                                    color: 'var(--text-primary)',
                                                                                    fontWeight: '600',
                                                                                    fontSize: '13px',
                                                                                }}>
                                                                                    {u.name}
                                                                                </span>
                                                                            </div>
                                                                        </td>
                                                                        <td style={{
                                                                            padding: '10px 16px',
                                                                            color: 'var(--text-secondary)',
                                                                            fontSize: '13px',
                                                                        }}>
                                                                            {u.email || '—'}
                                                                        </td>
                                                                        <td style={{
                                                                            padding: '10px 16px',
                                                                            color: 'var(--text-secondary)',
                                                                            fontSize: '13px',
                                                                        }}>
                                                                            {u.phone || '—'}
                                                                        </td>
                                                                        <td style={{
                                                                            padding: '10px 16px',
                                                                            textAlign: 'right',
                                                                            fontWeight: '700',
                                                                            fontSize: '14px',
                                                                            color: config.color,
                                                                        }}>
                                                                            {config.formatValue(u[config.userStatKey] || 0)}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Spin keyframe (inline for the loading spinner) */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
