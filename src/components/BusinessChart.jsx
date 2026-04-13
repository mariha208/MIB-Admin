import { useState, useEffect, useCallback } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import {
    getBusinessByChapter,
    getReferralsByChapter,
    getMeetsByChapter,
    getVisitorsByChapter,
} from '../services/dataService';

// Curated color palette for chapters (up to 12 chapters per city)
const CHAPTER_COLORS = [
    '#B49164', // gold (accent)
    '#6C9BCF', // blue
    '#E8815C', // coral
    '#6BCB77', // green
    '#C084FC', // purple
    '#F59E42', // orange
    '#38BDF8', // sky
    '#F472B6', // pink
    '#FBBF24', // amber
    '#34D399', // emerald
    '#FB7185', // rose
    '#A78BFA', // violet
];

const METRIC_CONFIG = {
    business: {
        title: 'Total Business by Chapter',
        fetcher: getBusinessByChapter,
        formatValue: (v) => {
            if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
            if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
            return `₹${v}`;
        },
    },
    referrals: {
        title: 'Total Referrals by Chapter',
        fetcher: getReferralsByChapter,
        formatValue: (v) => String(v),
    },
    meets: {
        title: 'Total 1-2-1 by Chapter',
        fetcher: getMeetsByChapter,
        formatValue: (v) => String(v),
    },
    visitors: {
        title: 'Total Visitors by Chapter',
        fetcher: getVisitorsByChapter,
        formatValue: (v) => String(v),
    },
};

const CustomTooltip = ({ active, payload, label, formatValue }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '12px 16px',
                boxShadow: 'var(--shadow-glow)',
            }}>
                <p style={{
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    marginBottom: '8px',
                    fontSize: '14px'
                }}>{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{
                        color: entry.color,
                        fontSize: '12px',
                        margin: '4px 0'
                    }}>
                        {entry.name}: {formatValue ? formatValue(entry.value) : entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

/**
 * BusinessChart — Fetches data from admin-dashboard API and renders a bar chart.
 *
 * @param {string} metric  — 'business' | 'referrals' | 'meets' | 'visitors'
 * @param {string} title   — Optional override title
 */
export default function BusinessChart({ metric = 'business', title }) {
    const [period, setPeriod] = useState('weekly');
    const [chartData, setChartData] = useState([]);
    const [chapterKeys, setChapterKeys] = useState([]);   // e.g. ["Alpha", "Beta", ...]
    const [grandTotal, setGrandTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const config = METRIC_CONFIG[metric] || METRIC_CONFIG.business;
    const displayTitle = title || config.title;

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await config.fetcher(period);
            // result: { period, grandTotal, cities: [{ cityName, chapters: [{ chapterName, chapterTotal }] }] }

            if (!result?.cities || result.cities.length === 0) {
                setChartData([]);
                setChapterKeys([]);
                setGrandTotal(0);
                setLoading(false);
                return;
            }

            // Collect all unique chapter names across all cities
            const allChapterNames = new Set();
            result.cities.forEach(city => {
                (city.chapters || []).forEach(ch => {
                    allChapterNames.add(ch.chapterName);
                });
            });
            const chapterList = [...allChapterNames];

            // Build recharts-compatible rows: one per city, with a key per chapter
            const rows = result.cities.map(city => {
                const row = { name: city.cityName };
                (city.chapters || []).forEach(ch => {
                    row[ch.chapterName] = ch.chapterTotal || 0;
                });
                return row;
            });

            setChartData(rows);
            setChapterKeys(chapterList);
            setGrandTotal(result.grandTotal || 0);
        } catch (err) {
            console.error('BusinessChart fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [period, metric]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="chart-section animate-fade-in animate-delay-4" style={{ opacity: 0 }}>
            <div className="chart-header">
                <div>
                    <h2 className="chart-title">{displayTitle}</h2>
                    {!loading && grandTotal > 0 && (
                        <span style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            marginLeft: '4px',
                        }}>
                            Grand Total: {config.formatValue(grandTotal)}
                        </span>
                    )}
                </div>
                <div className="chart-filters">
                    {['weekly', 'monthly', 'yearly'].map(p => (
                        <button
                            key={p}
                            className={`chart-filter-btn ${period === p ? 'active' : ''}`}
                            onClick={() => setPeriod(p)}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="chart-container">
                {loading ? (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        height: '100%', color: 'var(--text-muted)'
                    }}>
                        Loading chart data…
                    </div>
                ) : error ? (
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', height: '100%', color: '#f87171', gap: 12
                    }}>
                        <span>Failed to load chart: {error}</span>
                        <button
                            onClick={fetchData}
                            style={{
                                padding: '6px 16px', borderRadius: 6,
                                border: '1px solid #f87171', background: 'transparent',
                                color: '#f87171', cursor: 'pointer'
                            }}
                        >
                            Retry
                        </button>
                    </div>
                ) : chartData.length === 0 ? (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        height: '100%', color: 'var(--text-muted)', fontSize: '0.95rem'
                    }}>
                        No data for this period.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="var(--chart-grid)"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="name"
                                stroke="var(--chart-axis)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={{ stroke: 'var(--border-color)' }}
                            />
                            <YAxis
                                stroke="var(--chart-axis)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={{ stroke: 'var(--border-color)' }}
                                tickFormatter={config.formatValue}
                            />
                            <Tooltip content={<CustomTooltip formatValue={config.formatValue} />} />
                            <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="circle"
                            />
                            {chapterKeys.map((chName, idx) => (
                                <Bar
                                    key={chName}
                                    dataKey={chName}
                                    name={chName}
                                    fill={CHAPTER_COLORS[idx % CHAPTER_COLORS.length]}
                                    radius={[4, 4, 0, 0]}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
