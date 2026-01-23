import { useState, useMemo } from 'react';
import { Search, Filter, MoreVertical, Edit2, Trash2, ChevronDown } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function UsersTable() {
    const { data, loading } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        city: '',
        chapter: ''
    });

    const filteredUsers = useMemo(() => {
        return data.users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.id.toString().includes(searchQuery);
            const matchesCity = filters.city === '' || user.city === filters.city;
            const matchesChapter = filters.chapter === '' || user.chapter === filters.chapter;

            return matchesSearch && matchesCity && matchesChapter;
        });
    }, [data.users, searchQuery, filters]);


    const uniqueCities = [...new Set(data.users.map(u => u.city))];
    const uniqueChapters = [...new Set(data.users.map(u => u.chapter))];

    return (
        <div className="users-page animate-fade-in">
            <div className="table-controls">
                <div className="search-box">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search users by name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

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
                </div>
            </div>

            <div className="table-container">
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
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
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
                                    <td><span className="business-value">{user.business}</span></td>
                                    <td>{user.referrals}</td>
                                    <td>{user.visitors}</td>
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
                                <td colSpan="9" className="no-results">
                                    No users found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
