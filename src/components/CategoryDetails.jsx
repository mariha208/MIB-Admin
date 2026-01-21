import { useState, useMemo } from 'react';
import { ChevronDown, Download, Edit2, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import BusinessChart from './BusinessChart';

const CATEGORY_CONFIG = {
    business: {
        title: 'Business Analytics',
        tableHeader: 'Business',
        dataKey: 'business',
        chartTitle: 'Total Business by Chapter'
    },
    referrals: {
        title: 'Referrals History',
        tableHeader: 'Referrals',
        dataKey: 'referrals',
        chartTitle: 'Referrals by Chapter'
    },
    '1-2-1': {
        title: '1-2-1 Meeting Logs',
        tableHeader: '1-2-1',
        dataKey: 'one2one',
        chartTitle: '1-2-1 Meetings by Chapter'
    },
    visitors: {
        title: 'Visitor Analytics',
        tableHeader: 'Visitors',
        dataKey: 'visitors',
        chartTitle: 'Visitors by Chapter'
    }
};

export default function CategoryDetails({ type = 'business' }) {
    const { data, loading } = useData();
    const config = CATEGORY_CONFIG[type] || CATEGORY_CONFIG.business;

    const [filters, setFilters] = useState({
        city: '',
        chapter: ''
    });

    const filteredData = useMemo(() => {
        return data.users.filter(user => {
            const matchesCity = filters.city === '' || user.city === filters.city;
            const matchesChapter = filters.chapter === '' || user.chapter === filters.chapter;
            return matchesCity && matchesChapter;
        });
    }, [data.users, filters]);

    const uniqueCities = [...new Set(data.users.map(u => u.city))];
    const uniqueChapters = [...new Set(data.users.map(u => u.chapter))];

    return (
        <div className="category-details-page animate-fade-in">
            <div className="chart-container-large mb-2xl">
                <BusinessChart title={config.chartTitle} />
            </div>

            <div className="users-page">
                <div className="table-controls">
                    <h2 className="section-title text-white">{config.title} Pool</h2>

                    <div className="filter-group">
                        <div className="filter-select-wrapper">
                            <select
                                value={filters.city}
                                onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                            >
                                <option value="">All Cities</option>
                                {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <ChevronDown className="select-arrow" size={16} />
                        </div>

                        <div className="filter-select-wrapper">
                            <select
                                value={filters.chapter}
                                onChange={(e) => setFilters(prev => ({ ...prev, chapter: e.target.value }))}
                            >
                                <option value="">All Chapters</option>
                                {uniqueChapters.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <ChevronDown className="select-arrow" size={16} />
                        </div>

                        <button className="icon-btn edit" title="Export" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Download size={16} />
                            <span>Export</span>
                        </button>
                    </div>
                </div>

                <div className="table-container shadow-lg">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Chapter</th>
                                <th>City</th>
                                <th>{config.tableHeader}</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((user) => (
                                    <tr key={user.id}>
                                        <td><span className="id-badge">#{user.id}</span></td>
                                        <td>
                                            <div className="user-info">
                                                <div className="user-avatar">{user.name.charAt(0)}</div>
                                                <span className="user-name">{user.name}</span>
                                            </div>
                                        </td>
                                        <td>{user.chapter}</td>
                                        <td>{user.city}</td>
                                        <td><span className="business-value">{user[config.dataKey]}</span></td>
                                        <td>
                                            <span className={`status-pill ${user.status.toLowerCase()}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="icon-btn edit" title="Edit"><Edit2 size={16} /></button>
                                                <button className="icon-btn delete" title="Delete"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="no-results">
                                        No results found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
