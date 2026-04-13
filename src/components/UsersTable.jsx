import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { getAdminDashboardUsers, getAdminDashboardFilters } from '../services/dataService';

export default function UsersTable() {
    // ── Data state ──
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── Pagination ──
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const LIMIT = 50;

    // ── Filters ──
    const [searchQuery, setSearchQuery] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [chapterFilter, setChapterFilter] = useState('');

    // ── Filter dropdown data ──
    const [filterCities, setFilterCities] = useState([]);
    const [filterChapters, setFilterChapters] = useState([]);

    // ── Debounced search ──
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, cityFilter, chapterFilter]);

    // ── Fetch filter options on mount ──
    useEffect(() => {
        async function loadFilters() {
            try {
                const data = await getAdminDashboardFilters();
                if (data?.cities) {
                    setFilterCities(data.cities);
                }
            } catch (err) {
                console.error('Failed to load filter options:', err);
            }
        }
        loadFilters();
    }, []);

    // Update chapters dropdown when city changes
    useEffect(() => {
        if (cityFilter) {
            const selectedCity = filterCities.find(c => c.cityId === cityFilter);
            setFilterChapters(selectedCity?.chapters || []);
        } else {
            // Show all chapters from all cities
            const allChapters = filterCities.flatMap(c => c.chapters || []);
            setFilterChapters(allChapters);
        }
        setChapterFilter('');
    }, [cityFilter, filterCities]);

    // ── Fetch users ──
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getAdminDashboardUsers({
                cityId: cityFilter,
                chapterId: chapterFilter,
                search: debouncedSearch,
                page,
                limit: LIMIT,
            });

            setUsers(result?.users || []);
            setTotalPages(result?.pagination?.totalPages || 1);
            setTotalUsers(result?.pagination?.totalUsers || 0);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setError(err.message);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [cityFilter, chapterFilter, debouncedSearch, page]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // ── Format business amount ──
    const formatBusiness = (amount) => {
        if (!amount || amount === 0) return '₹0';
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
        return `₹${amount}`;
    };

    // ── Truncate ID for display ──
    const shortId = (id) => {
        if (!id) return '—';
        if (id.length <= 8) return id;
        return id.substring(0, 8) + '…';
    };

    return (
        <div className="users-page animate-fade-in">
            <div className="table-controls">
                <div className="search-box">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <div className="filter-select-wrapper">
                        <select
                            value={cityFilter}
                            onChange={(e) => setCityFilter(e.target.value)}
                        >
                            <option value="">All Cities</option>
                            {filterCities.map(c => (
                                <option key={c.cityId} value={c.cityId}>{c.cityName}</option>
                            ))}
                        </select>
                        <ChevronDown className="select-arrow" size={16} />
                    </div>

                    <div className="filter-select-wrapper">
                        <select
                            value={chapterFilter}
                            onChange={(e) => setChapterFilter(e.target.value)}
                        >
                            <option value="">All Chapters</option>
                            {filterChapters.map(ch => (
                                <option key={ch.chapterId} value={ch.chapterId}>{ch.chapterName}</option>
                            ))}
                        </select>
                        <ChevronDown className="select-arrow" size={16} />
                    </div>
                </div>
            </div>

            {/* Result count */}
            <div style={{ padding: '0 0 8px 4px', fontSize: '0.85rem', color: 'var(--text-muted, #999)' }}>
                {loading ? 'Loading…' : `${totalUsers} user${totalUsers !== 1 ? 's' : ''} found`}
            </div>

            <div className="table-container">
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0', color: 'var(--text-muted, #999)' }}>
                        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', marginRight: 8 }} />
                        Loading users…
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#f87171' }}>
                        Failed to load users: {error}
                        <br />
                        <button onClick={fetchUsers} style={{ marginTop: 12, padding: '6px 16px', borderRadius: 6, border: '1px solid #f87171', background: 'transparent', color: '#f87171', cursor: 'pointer' }}>
                            Retry
                        </button>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Chapter</th>
                                <th>City</th>
                                <th>Business</th>
                                <th>Referrals</th>
                                <th>Visitors</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user.id}>
                                        <td><span className="id-badge" title={user.id}>#{shortId(user.id)}</span></td>
                                        <td>
                                            <div className="user-info">
                                                <div className="user-avatar">{user.name?.charAt(0) || '?'}</div>
                                                <div>
                                                    <span className="user-name">{user.name}</span>
                                                    {user.email && (
                                                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted, #999)' }}>{user.email}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>{user.chapterName || '—'}</td>
                                        <td>{user.cityName || '—'}</td>
                                        <td><span className="business-value">{formatBusiness(user.business)}</span></td>
                                        <td>{user.referrals || 0}</td>
                                        <td>{user.visitors || 0}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="no-results">
                                        No users found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, padding: '16px 0',
                    color: 'var(--text-muted, #999)', fontSize: '0.9rem'
                }}>
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 6,
                            border: '1px solid var(--border, #333)', background: 'transparent',
                            color: page === 1 ? '#555' : 'var(--text, #fff)', cursor: page === 1 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <ChevronLeft size={16} /> Prev
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 6,
                            border: '1px solid var(--border, #333)', background: 'transparent',
                            color: page === totalPages ? '#555' : 'var(--text, #fff)', cursor: page === totalPages ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}
