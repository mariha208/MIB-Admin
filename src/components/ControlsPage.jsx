import { useState } from 'react';
import { Plus, Edit2, Trash2, ChevronRight, ArrowLeft, Key, BarChart3, Calendar, Upload, X } from 'lucide-react';
import ControlFormModal from './ControlFormModal';

const MOCK_HISTORY = [
    { id: 1, type: 'Country', giver: 'Admin', givenTo: 'India Head', date: '20-Jan-2026', level: 'National', password: 'India@2026' },
    { id: 2, type: 'City', giver: 'Admin', givenTo: 'Mumbai Lead', date: '19-Jan-2026', level: 'Mumbai', password: 'Mum#Lead$25' },
    { id: 3, type: 'Chapter', giver: 'Admin', givenTo: 'Chapter 3 Sec', date: '18-Jan-2026', level: 'Chapter 3', password: 'Chap3Sec!99' },
];

const CONTROL_OPTIONS = [
    { id: 'password', label: 'Password Control', icon: Key },
    { id: 'event', label: 'Event Reports', icon: BarChart3 },
    { id: 'weekly', label: 'Weekly Reports', icon: Calendar },
    { id: 'upload', label: 'Upload Events', icon: Upload },
];

const CITIES = [
    { name: 'Vadodara', gradient: 'linear-gradient(135deg, #FF6B6B 0%, #EE5D5D 100%)' },
    { name: 'Surat', gradient: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)' },
    { name: 'Ahmedabad', gradient: 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)' },
    { name: 'Mumbai', gradient: 'linear-gradient(135deg, #FA709A 0%, #FEE140 100%)' },
    { name: 'Baruch', gradient: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)' },
];

const MOCK_EVENTS = [
    { id: 1, city: 'Mumbai', name: 'Annual Tech Meet', date: '15-Jan-2026', place: 'Grand Hyatt', mibMembers: 50, attended: 45, visitors: 10, photos: 12, videos: 2 },
    { id: 2, city: 'Mumbai', name: 'Networking Dinner', date: '20-Jan-2026', place: 'Taj Lands End', mibMembers: 30, attended: 28, visitors: 5, photos: 8, videos: 1 },
    { id: 3, city: 'Ahmedabad', name: 'Business Summit', date: '10-Jan-2026', place: 'Hyatt Regency', mibMembers: 60, attended: 55, visitors: 15, photos: 20, videos: 3 },
    { id: 4, city: 'Surat', name: 'Textile Expo', date: '05-Jan-2026', place: 'Surat Convention Centre', mibMembers: 40, attended: 35, visitors: 20, photos: 15, videos: 2 },
    { id: 5, city: 'Vadodara', name: 'Startup Pitch', date: '12-Jan-2026', place: 'Sayaji Hotel', mibMembers: 25, attended: 20, visitors: 8, photos: 5, videos: 1 },
    { id: 6, city: 'Baruch', name: 'Industrial Meet', date: '22-Jan-2026', place: 'Regenta Central', mibMembers: 20, attended: 18, visitors: 4, photos: 6, videos: 0 },
];

const WEEKLY_DATA = [
    {
        city: 'Mumbai',
        gradient: 'linear-gradient(135deg, #FA709A 0%, #FEE140 100%)',
        chapters: ['Chapter 5', 'Chapter 6', 'Chapter 7']
    },
    {
        city: 'Surat',
        gradient: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
        chapters: ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4']
    },
    {
        city: 'Ahmedabad',
        gradient: 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)',
        chapters: ['Chatpata', 'Dal Dal', 'Halchal']
    },
    {
        city: 'Baruch',
        gradient: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
        chapters: ['Chapter 8', 'Chapter 9']
    },
    {
        city: 'Vadodara',
        gradient: 'linear-gradient(135deg, #FF6B6B 0%, #EE5D5D 100%)',
        chapters: ['Chapter 10', 'Chapter 11']
    },
];

export default function ControlsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [view, setView] = useState('list'); // 'list', 'password', 'event', etc.

    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [selectedCityForWeeklyReport, setSelectedCityForWeeklyReport] = useState(null);
    const [selectedCityForUpload, setSelectedCityForUpload] = useState(null);
    const [eventPhoto, setEventPhoto] = useState(null);

    const renderListView = () => (
        <div className="control-list animate-fade-in">
            {CONTROL_OPTIONS.map((option) => (
                <div
                    key={option.id}
                    className="control-card"
                    onClick={() => setView(option.id)}
                >
                    <div className="control-card-content">
                        <option.icon size={24} className="text-accent" />
                        <span className="control-card-title">{option.label}</span>
                    </div>
                    <ChevronRight className="control-card-arrow" />
                </div>
            ))}
        </div>
    );

    const renderDetailView = () => {
        if (view === 'password') {
            return (
                <div className="users-page animate-fade-in">
                    <div className="back-btn-container">
                        <button className="back-btn" onClick={() => setView('list')}>
                            <ArrowLeft size={18} />
                            Back to Control History
                        </button>
                    </div>

                    <div className="table-controls">
                        <h2 className="section-title text-white">Password Assignment Logs</h2>
                    </div>

                    <div className="table-container shadow-lg">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>LOG ID</th>
                                    <th>CONTROL LEVEL</th>
                                    <th>GIVEN TO</th>
                                    <th>PASSWORD</th>
                                    <th>ASSIGNED BY</th>
                                    <th>DATE</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_HISTORY.map((log) => (
                                    <tr key={log.id}>
                                        <td><span className="id-badge">#{log.id}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span className="user-name">{log.type}</span>
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.level}</span>
                                            </div>
                                        </td>
                                        <td><span style={{ color: 'var(--text-secondary)' }}>{log.givenTo}</span></td>
                                        <td><code style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{log.password}</code></td>
                                        <td>{log.giver}</td>
                                        <td>{log.date}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="icon-btn edit" title="Edit"><Edit2 size={16} /></button>
                                                <button className="icon-btn delete" title="Revoke"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        if (view === 'event') {
            if (selectedCity) {
                const cityEvents = MOCK_EVENTS.filter(e => e.city === selectedCity);
                return (
                    <div className="users-page animate-fade-in">
                        <div className="back-btn-container">
                            <button className="back-btn" onClick={() => setSelectedCity(null)}>
                                <ArrowLeft size={18} />
                                Back to Cities
                            </button>
                        </div>

                        <div className="table-controls">
                            <h2 className="section-title text-white">{selectedCity} Events</h2>
                        </div>

                        <div className="table-container shadow-lg">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>NAME</th>
                                        <th>DATE</th>
                                        <th>PLACE</th>
                                        <th>MIB MEMBERS</th>
                                        <th>ATTENDED</th>
                                        <th>VISITORS</th>
                                        <th>MEDIA</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cityEvents.length > 0 ? (
                                        cityEvents.map((event) => (
                                            <tr key={event.id}>
                                                <td><span className="user-name">{event.name}</span></td>
                                                <td>{event.date}</td>
                                                <td>{event.place}</td>
                                                <td style={{ textAlign: 'center' }}>{event.mibMembers}</td>
                                                <td style={{ textAlign: 'center' }}>{event.attended}</td>
                                                <td style={{ textAlign: 'center' }}>{event.visitors}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                        <span>{event.photos} 📷</span>
                                                        <span>{event.videos} 🎥</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                                No events found for {selectedCity}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            }

            return (
                <div className="users-page animate-fade-in">
                    <div className="back-btn-container">
                        <button className="back-btn" onClick={() => setView('list')}>
                            <ArrowLeft size={18} />
                            Back to Control History
                        </button>
                    </div>

                    <h2 className="section-title text-white" style={{ marginBottom: '2rem' }}>Event Reports</h2>

                    <div className="city-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.5rem',
                        padding: '1rem'
                    }}>
                        {CITIES.map((city) => (
                            <div
                                key={city.name}
                                className="city-card hover-scale"
                                onClick={() => setSelectedCity(city.name)}
                                style={{
                                    background: city.gradient,
                                    borderRadius: '16px',
                                    padding: '2rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                    minHeight: '120px'
                                }}
                            >
                                <h3 style={{
                                    color: 'white',
                                    fontSize: '1.5rem',
                                    fontWeight: '600',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    margin: 0
                                }}>
                                    {city.name}
                                </h3>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        const MOCK_CHAPTER_REPORTS = [
            { id: 1, chapter: 'Chapter 1', city: 'Surat', memberName: 'Arpit Shah', date: '21/01/2026', businessDone: 0, referrals: 0, oneToOne: 0, visitors: 0 },
            { id: 2, chapter: 'Chapter 1', city: 'Surat', memberName: 'Ravi Patel', date: '21/01/2026', businessDone: 50000, referrals: 2, oneToOne: 1, visitors: 0 },
            { id: 3, chapter: 'Chapter 5', city: 'Mumbai', memberName: 'Sneha Gupta', date: '20/01/2026', businessDone: 150000, referrals: 5, oneToOne: 3, visitors: 1 },
            { id: 4, chapter: 'Chatpata', city: 'Ahmedabad', memberName: 'Rahul Mehta', date: '19/01/2026', businessDone: 25000, referrals: 1, oneToOne: 2, visitors: 0 },
            { id: 5, chapter: 'Chapter 2', city: 'Surat', memberName: 'Priya Desai', date: '21/01/2026', businessDone: 12000, referrals: 3, oneToOne: 2, visitors: 1 },
            { id: 6, chapter: 'Chapter 5', city: 'Mumbai', memberName: 'Amit Kapoor', date: '20/01/2026', businessDone: 200000, referrals: 8, oneToOne: 5, visitors: 2 },
            { id: 7, chapter: 'Dal Dal', city: 'Ahmedabad', memberName: 'Vikram Singh', date: '19/01/2026', businessDone: 75000, referrals: 4, oneToOne: 1, visitors: 1 },
            { id: 8, chapter: 'Chapter 6', city: 'Mumbai', memberName: 'Anita Roy', date: '20/01/2026', businessDone: 45000, referrals: 2, oneToOne: 0, visitors: 0 },
            { id: 9, chapter: 'Chapter 8', city: 'Baruch', memberName: 'Karan Patel', date: '22/01/2026', businessDone: 30000, referrals: 1, oneToOne: 1, visitors: 0 },
            { id: 10, chapter: 'Chapter 10', city: 'Vadodara', memberName: 'Suresh Shah', date: '12/01/2026', businessDone: 10000, referrals: 0, oneToOne: 0, visitors: 0 },
        ];

        if (view === 'weekly') {
            if (selectedChapter) {
                const chapterReports = MOCK_CHAPTER_REPORTS.filter(r => r.chapter === selectedChapter);
                // Find the city for this chapter
                const cityData = WEEKLY_DATA.find(d => d.chapters.includes(selectedChapter));
                const city = cityData ? cityData.city : '';

                return (
                    <div className="users-page animate-fade-in">
                        <div className="back-btn-container">
                            <button className="back-btn" onClick={() => setSelectedChapter(null)}>
                                <ArrowLeft size={18} />
                                Back to {selectedCityForWeeklyReport ? `${selectedCityForWeeklyReport} Report` : 'Weekly Cities'}
                            </button>
                        </div>

                        <div className="table-controls" style={{ marginBottom: '2rem' }}>
                            <h2 className="section-title text-white" style={{ marginBottom: '0.25rem' }}>{selectedChapter}</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>{city}</p>
                        </div>

                        <div className="table-container shadow-lg">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>MEMBER NAME</th>
                                        <th>DATE</th>
                                        <th style={{ textAlign: 'center' }}>BUSINESS DONE (₹)</th>
                                        <th style={{ textAlign: 'center' }}>REFERRALS</th>
                                        <th style={{ textAlign: 'center' }}>1-2-1</th>
                                        <th style={{ textAlign: 'center' }}>VISITORS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chapterReports.length > 0 ? (
                                        chapterReports.map((report) => (
                                            <tr key={report.id}>
                                                <td><span className="user-name">{report.memberName}</span></td>
                                                <td>{report.date}</td>
                                                <td style={{ textAlign: 'center', color: '#4ade80' }}>₹ {report.businessDone.toLocaleString()}</td>
                                                <td style={{ textAlign: 'center' }}>{report.referrals}</td>
                                                <td style={{ textAlign: 'center' }}>{report.oneToOne}</td>
                                                <td style={{ textAlign: 'center' }}>{report.visitors}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                                No reports found for {selectedChapter}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            }

            if (selectedCityForWeeklyReport) {
                const cityReports = MOCK_CHAPTER_REPORTS.filter(r => r.city === selectedCityForWeeklyReport);

                // Aggregate data by Chapter
                const chapterAggregation = cityReports.reduce((acc, curr) => {
                    if (!acc[curr.chapter]) {
                        acc[curr.chapter] = {
                            chapter: curr.chapter,
                            businessDone: 0,
                            referrals: 0,
                            oneToOne: 0,
                            visitors: 0
                        };
                    }
                    acc[curr.chapter].businessDone += curr.businessDone;
                    acc[curr.chapter].referrals += curr.referrals;
                    acc[curr.chapter].oneToOne += curr.oneToOne;
                    acc[curr.chapter].visitors += curr.visitors;
                    return acc;
                }, {});

                const aggregatedReports = Object.values(chapterAggregation);

                // Calculate Totals
                const totals = aggregatedReports.reduce((acc, curr) => ({
                    businessDone: acc.businessDone + curr.businessDone,
                    referrals: acc.referrals + curr.referrals,
                    oneToOne: acc.oneToOne + curr.oneToOne,
                    visitors: acc.visitors + curr.visitors
                }), { businessDone: 0, referrals: 0, oneToOne: 0, visitors: 0 });

                return (
                    <div className="users-page animate-fade-in">
                        <div className="back-btn-container">
                            <button className="back-btn" onClick={() => setSelectedCityForWeeklyReport(null)}>
                                <ArrowLeft size={18} />
                                Back to Weekly Cities
                            </button>
                        </div>

                        <div className="table-controls" style={{ marginBottom: '2rem' }}>
                            <h2 className="section-title text-white">{selectedCityForWeeklyReport} Report</h2>
                        </div>

                        <div className="table-container shadow-lg">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>CHAPTER NAME</th>
                                        <th style={{ textAlign: 'center' }}>BUSINESS DONE (₹)</th>
                                        <th style={{ textAlign: 'center' }}>REFERRALS</th>
                                        <th style={{ textAlign: 'center' }}>1-2-1</th>
                                        <th style={{ textAlign: 'center' }}>VISITORS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {aggregatedReports.length > 0 ? (
                                        <>
                                            {aggregatedReports.map((report) => (
                                                <tr key={report.chapter}>
                                                    <td>
                                                        <span
                                                            className="user-name"
                                                            style={{ cursor: 'pointer', textDecoration: 'underline', color: 'white' }}
                                                            onClick={() => setSelectedChapter(report.chapter)}
                                                        >
                                                            {report.chapter}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'center', color: '#4ade80' }}>₹ {report.businessDone.toLocaleString()}</td>
                                                    <td style={{ textAlign: 'center' }}>{report.referrals}</td>
                                                    <td style={{ textAlign: 'center' }}>{report.oneToOne}</td>
                                                    <td style={{ textAlign: 'center' }}>{report.visitors}</td>
                                                </tr>
                                            ))}
                                            {/* Total Row */}
                                            <tr style={{ background: 'rgba(255,255,255,0.05)', fontWeight: 'bold' }}>
                                                <td style={{ textAlign: 'right', paddingRight: '1rem' }}>TOTAL ({aggregatedReports.length} Chapters)</td>
                                                <td style={{ textAlign: 'center', color: '#4ade80' }}>₹ {totals.businessDone.toLocaleString()}</td>
                                                <td style={{ textAlign: 'center' }}>{totals.referrals}</td>
                                                <td style={{ textAlign: 'center' }}>{totals.oneToOne}</td>
                                                <td style={{ textAlign: 'center' }}>{totals.visitors}</td>
                                            </tr>
                                        </>
                                    ) : (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                                No reports found for {selectedCityForWeeklyReport}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            }

            return (
                <div className="users-page animate-fade-in">
                    <div className="back-btn-container">
                        <button className="back-btn" onClick={() => setView('list')}>
                            <ArrowLeft size={18} />
                            Back to Control History
                        </button>
                    </div>

                    <h2 className="section-title text-white" style={{ marginBottom: '2rem' }}>Weekly Reports</h2>

                    <div className="city-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '1.5rem',
                        padding: '1rem'
                    }}>
                        {WEEKLY_DATA.map((item) => (
                            <div
                                key={item.city}
                                className="city-card hover-scale"
                                style={{
                                    background: item.gradient,
                                    borderRadius: '16px',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                    minHeight: '200px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    cursor: 'pointer'
                                }}
                                onClick={() => setSelectedCityForWeeklyReport(item.city)}
                            >
                                <h3 style={{
                                    color: 'white',
                                    fontSize: '1.8rem',
                                    fontWeight: '700',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    marginBottom: '1rem',
                                    borderBottom: '2px solid rgba(255,255,255,0.3)',
                                    paddingBottom: '0.5rem'
                                }}>
                                    {item.city}
                                </h3>
                                <ul style={{
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0,
                                    flex: 1,
                                    background: 'rgba(0,0,0,0.1)',
                                    borderRadius: '8px',
                                    padding: '1rem'
                                }}>
                                    {item.chapters.map((chapter, idx) => (
                                        <li
                                            key={idx}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedChapter(chapter);
                                            }}
                                            style={{
                                                color: 'white',
                                                fontSize: '1.1rem',
                                                marginBottom: '0.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                padding: '4px 8px',
                                                borderRadius: '6px'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            title="Click to view chapter report"
                                        >
                                            <span style={{ marginRight: '8px', opacity: 0.8 }}>•</span>
                                            <span style={{ textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.5)', textUnderlineOffset: '4px' }}>{chapter}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (view === 'weekly') {
            return (
                <div className="users-page animate-fade-in">
                    <div className="back-btn-container">
                        <button className="back-btn" onClick={() => setView('list')}>
                            <ArrowLeft size={18} />
                            Back to Control History
                        </button>
                    </div>

                    <h2 className="section-title text-white" style={{ marginBottom: '2rem' }}>Weekly Reports</h2>

                    <div className="city-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '1.5rem',
                        padding: '1rem'
                    }}>
                        {WEEKLY_DATA.map((item) => (
                            <div
                                key={item.city}
                                className="city-card hover-scale"
                                style={{
                                    background: item.gradient,
                                    borderRadius: '16px',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                    minHeight: '200px',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <h3 style={{
                                    color: 'white',
                                    fontSize: '1.8rem',
                                    fontWeight: '700',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    marginBottom: '1rem',
                                    borderBottom: '2px solid rgba(255,255,255,0.3)',
                                    paddingBottom: '0.5rem'
                                }}>
                                    {item.city}
                                </h3>
                                <ul style={{
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0,
                                    flex: 1,
                                    background: 'rgba(0,0,0,0.1)',
                                    borderRadius: '8px',
                                    padding: '1rem'
                                }}>
                                    {item.chapters.map((chapter, idx) => (
                                        <li key={idx} style={{
                                            color: 'white',
                                            fontSize: '1.1rem',
                                            marginBottom: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontWeight: '500'
                                        }}>
                                            <span style={{ marginRight: '8px', opacity: 0.8 }}>•</span>
                                            {chapter}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (view === 'upload') {
            if (selectedCityForUpload) {
                return (
                    <div className="users-page animate-fade-in">
                        <div className="back-btn-container">
                            <button className="back-btn" onClick={() => {
                                setSelectedCityForUpload(null);
                                setEventPhoto(null);
                            }}>
                                <ArrowLeft size={18} />
                                Back to Upload Cities
                            </button>
                        </div>

                        <div className="table-controls" style={{ marginBottom: '2rem' }}>
                            <h2 className="section-title text-white">Upload New Event - {selectedCityForUpload}</h2>
                        </div>

                        <div style={{ maxWidth: '600px', margin: '0 auto', background: '#1e293b', padding: '2rem', borderRadius: '12px' }}>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                alert('Event Uploaded Successfully!');
                                setSelectedCityForUpload(null);
                                setEventPhoto(null);
                                setView('list');
                            }}>
                                <div
                                    onClick={() => document.getElementById('event-photo-input').click()}
                                    style={{
                                        width: '100%',
                                        height: '200px',
                                        border: '2px dashed #475569',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        marginBottom: '2rem',
                                        background: eventPhoto ? `url(${eventPhoto}) center/cover no-repeat` : 'rgba(255,255,255,0.05)',
                                        position: 'relative'
                                    }}
                                >
                                    {!eventPhoto && (
                                        <>
                                            <div style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '50%',
                                                border: '2px solid rgba(255,255,255,0.5)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: '1rem'
                                            }}>
                                                <Plus size={24} color="rgba(255,255,255,0.7)" />
                                            </div>
                                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>Upload Event Photo</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        id="event-photo-input"
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setEventPhoto(reader.result);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    {eventPhoto && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEventPhoto(null);
                                            }}
                                            style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                background: 'rgba(0,0,0,0.5)',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '30px',
                                                height: '30px',
                                                color: 'white',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '0.5rem', fontWeight: '500' }}>Event Name *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Fun fair"
                                        required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '0.5rem', fontWeight: '500' }}>Date *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 25 Jan, 2025"
                                        required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '0.5rem', fontWeight: '500' }}>Full Address *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. TGB, Surat"
                                        required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '0.5rem', fontWeight: '500' }}>Location (Gmap Link)</label>
                                    <input
                                        type="url"
                                        placeholder="Paste Google Maps URL here"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '0.5rem', fontWeight: '500' }}>Timing *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 5:00 to 9:00 pm"
                                        required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '0.5rem', fontWeight: '500' }}>Note</label>
                                    <textarea
                                        placeholder="Any special notes..."
                                        rows="3"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white' }}
                                    ></textarea>
                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '0.5rem', fontWeight: '500' }}>Registration Form Link</label>
                                    <input
                                        type="url"
                                        placeholder="https://forms.gle/..."
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white' }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="primary-btn"
                                    style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                                >
                                    Submit Event
                                </button>
                            </form>
                        </div>
                    </div>
                );
            }

            return (
                <div className="users-page animate-fade-in">
                    <div className="back-btn-container">
                        <button className="back-btn" onClick={() => setView('list')}>
                            <ArrowLeft size={18} />
                            Back to Control History
                        </button>
                    </div>

                    <h2 className="section-title text-white" style={{ marginBottom: '2rem' }}>Upload Events - Select City</h2>

                    <div className="city-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.5rem',
                        padding: '1rem'
                    }}>
                        {CITIES.map((city) => (
                            <div
                                key={city.name}
                                className="city-card hover-scale"
                                onClick={() => setSelectedCityForUpload(city.name)}
                                style={{
                                    background: city.gradient,
                                    borderRadius: '16px',
                                    padding: '2rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                    minHeight: '120px'
                                }}
                            >
                                <h3 style={{
                                    color: 'white',
                                    fontSize: '1.5rem',
                                    fontWeight: '600',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    margin: 0
                                }}>
                                    {city.name}
                                </h3>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                <div className="back-btn-container" style={{ textAlign: 'left' }}>
                    <button className="back-btn" onClick={() => setView('list')}>
                        <ArrowLeft size={18} />
                        Back to Control History
                    </button>
                </div>
                <h2 className="section-title text-white" style={{ marginBottom: 'var(--spacing-md)' }}>
                    {CONTROL_OPTIONS.find(opt => opt.id === view)?.label}
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>This section is currently under development.</p>
            </div>
        );
    };

    return (
        <main className="main-content">
            <header className="page-header center-header">
                <div className="header-content">
                    <h1 className="page-title">Control Panel</h1>
                    <p className="page-subtitle">Track and manage administrative controls across all levels.</p>
                </div>
            </header>

            {view === 'list' ? renderListView() : renderDetailView()}

            {/* Floating Action Button - Only show inside Password Control */}
            {view === 'password' && (
                <button
                    className="fab-btn animate-fade-in"
                    onClick={() => setIsModalOpen(true)}
                    aria-label="Add Control"
                >
                    <Plus size={28} />
                </button>
            )}

            <ControlFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </main>
    );
}
