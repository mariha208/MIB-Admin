import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, ChevronRight, ArrowLeft, Key, BarChart3, Calendar, Upload, X, FileText, CalendarCheck, MapPin, BookOpen } from 'lucide-react';
import ControlFormModal from './ControlFormModal';
import { getEventReports, deleteEventReport, getUploadedEvents, deleteUploadedEvent, createUploadedEvent, getCitiesForDropdown, createCity, createNewChapter, getAdminCities, getAdminChapters, deleteCity, updateCity, deleteChapter, updateChapter } from '../services/dataService';

const MOCK_HISTORY = [
    { id: 2, type: 'City', giver: 'Admin', givenTo: 'Mumbai Lead', date: '19-Jan-2026', level: 'Mumbai', password: 'Mum#Lead$25' },
    { id: 3, type: 'Chapter', giver: 'Admin', givenTo: 'Chapter 3 Sec', date: '18-Jan-2026', level: 'Chapter 3', password: 'Chap3Sec!99' },
];

const CONTROL_OPTIONS = [
    { id: 'password', label: 'Password Control', icon: Key },
    { id: 'events', label: 'Event', icon: CalendarCheck },
    { id: 'event', label: 'Event Reports', icon: BarChart3 },
    { id: 'weekly', label: 'Weekly Reports', icon: Calendar },
    { id: 'upload', label: 'Upload Events', icon: Upload },
    { id: 'submitted', label: 'Submitted Reports', icon: FileText },
    { id: 'addCity', label: 'Add New City', icon: MapPin },
    { id: 'addChapter', label: 'Add New Chapter', icon: BookOpen },
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

const INITIAL_HISTORY = [
    { id: 2, type: 'Mumbai', giver: 'Admin', givenTo: 'Mumbai Lead', date: '19-Jan-2026', level: 'City', password: 'Mum#Lead$25' },
    { id: 3, type: 'Chapter 3 Sec', giver: 'Admin', givenTo: 'Chapter 3 Sec', date: '18-Jan-2026', level: 'Chapter 3', password: 'Chap3Sec!99' },
];

export default function ControlsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [view, setView] = useState(
        () => localStorage.getItem('mib-controls-view') || 'list'
    );

    // Persist controls sub-page so it survives refresh
    const setViewPersisted = (v) => {
        setView(v);
        localStorage.setItem('mib-controls-view', v);
    };
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('mib_control_history');
        return saved ? JSON.parse(saved) : INITIAL_HISTORY;
    });

    useEffect(() => {
        localStorage.setItem('mib_control_history', JSON.stringify(history));
    }, [history]);

    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [selectedCityForWeeklyReport, setSelectedCityForWeeklyReport] = useState(null);
    const [selectedCityForUpload, setSelectedCityForUpload] = useState(null);
    const [selectedCityForEvents, setSelectedCityForEvents] = useState(null);
    const [eventPhoto, setEventPhoto] = useState(null);

    // Upload event form state
    const [uploadFormData, setUploadFormData] = useState({
        eventName: '',
        eventDate: '',
        fullAddress: '',
        mapLink: '',
        timing: '',
        note: '',
        registrationLink: '',
    });
    const [uploadSubmitting, setUploadSubmitting] = useState(false);
    const [citiesList, setCitiesList] = useState([]);

    // Dynamic cities fetched from the database for Event / Event Reports / Upload views
    const [dbCities, setDbCities] = useState([]);
    const [dbCitiesLoading, setDbCitiesLoading] = useState(false);

    // Add New City form state
    const [cityFormData, setCityFormData] = useState({ cityName: '', state: '', country: '' });
    const [citySubmitting, setCitySubmitting] = useState(false);

    // Add New Chapter form state
    const [chapterFormData, setChapterFormData] = useState({ chapterName: '', cityId: '', description: '', meetingDay: '', meetingTime: '', venueAddress: '' });
    const [chapterSubmitting, setChapterSubmitting] = useState(false);
    const [adminCitiesList, setAdminCitiesList] = useState([]);

    // Existing cities list for management (shown under Add New City)
    const [existingCities, setExistingCities] = useState([]);
    const [citiesLoading, setCitiesLoading] = useState(false);

    // Existing chapters list for management (shown under Add New Chapter)
    const [existingChapters, setExistingChapters] = useState([]);
    const [chaptersLoading, setChaptersLoading] = useState(false);
    const [chaptersFilterCityId, setChaptersFilterCityId] = useState('');

    // Edit modal state
    const [editingCity, setEditingCity] = useState(null);
    const [editCityData, setEditCityData] = useState({ cityName: '', state: '', country: '' });
    const [editingChapter, setEditingChapter] = useState(null);
    const [editChapterData, setEditChapterData] = useState({ chapterName: '', description: '', meetingDay: '', meetingTime: '', venueAddress: '' });

    // Submitted reports state (from API)
    const [submittedReports, setSubmittedReports] = useState([]);
    const [reportsLoading, setReportsLoading] = useState(false);
    const [reportsError, setReportsError] = useState(null);

    // Uploaded events state (from API)
    const [uploadedEvents, setUploadedEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(false);
    const [eventsError, setEventsError] = useState(null);

    // Fetch reports when 'submitted' or 'event' view is opened
    useEffect(() => {
        if (view === 'submitted' || view === 'event') {
            setReportsLoading(true);
            setReportsError(null);
            getEventReports()
                .then((reports) => {
                    setSubmittedReports(reports);
                    setReportsLoading(false);
                })
                .catch((err) => {
                    console.error('Failed to fetch reports:', err);
                    setReportsError(err.message || 'Failed to load reports');
                    setReportsLoading(false);
                });
        }
    }, [view]);

    // Fetch uploaded events when 'events' view is opened
    useEffect(() => {
        if (view === 'events') {
            setEventsLoading(true);
            setEventsError(null);
            getUploadedEvents()
                .then((events) => {
                    setUploadedEvents(Array.isArray(events) ? events : []);
                    setEventsLoading(false);
                })
                .catch((err) => {
                    console.error('Failed to fetch uploaded events:', err);
                    setEventsError(err.message || 'Failed to load events');
                    setEventsLoading(false);
                });
        }
    }, [view]);

    // Fetch cities list for upload form (to resolve cityId)
    useEffect(() => {
        if (view === 'upload') {
            getCitiesForDropdown()
                .then((cities) => setCitiesList(Array.isArray(cities) ? cities : []))
                .catch((err) => console.error('Failed to fetch cities:', err));
        }
    }, [view]);

    // Fetch cities from the database for Event, Event Reports, and Upload views
    useEffect(() => {
        if (view === 'events' || view === 'event' || view === 'upload') {
            setDbCitiesLoading(true);
            getAdminCities()
                .then((cities) => {
                    const arr = Array.isArray(cities) ? cities : [];
                    // Build gradient-mapped city objects from DB data
                    const GRADIENT_PALETTE = [
                        'linear-gradient(135deg, #FF6B6B 0%, #EE5D5D 100%)',
                        'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
                        'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)',
                        'linear-gradient(135deg, #FA709A 0%, #FEE140 100%)',
                        'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
                        'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
                        'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
                        'linear-gradient(135deg, #0acffe 0%, #495aff 100%)',
                    ];
                    const mapped = arr.map((c, i) => ({
                        name: c.cityName || c.name || 'Unknown',
                        id: c._id || c.id || c.cityId,
                        gradient: GRADIENT_PALETTE[i % GRADIENT_PALETTE.length],
                    }));
                    setDbCities(mapped);
                    setDbCitiesLoading(false);
                })
                .catch((err) => {
                    console.error('Failed to fetch DB cities:', err);
                    setDbCitiesLoading(false);
                });
        }
    }, [view]);

    // Fetch admin cities for addChapter view
    useEffect(() => {
        if (view === 'addChapter') {
            getAdminCities()
                .then((cities) => setAdminCitiesList(Array.isArray(cities) ? cities : []))
                .catch((err) => console.error('Failed to fetch admin cities:', err));
        }
    }, [view]);

    // Fetch existing cities when addCity view loads
    const fetchExistingCities = () => {
        setCitiesLoading(true);
        getAdminCities()
            .then((cities) => {
                setExistingCities(Array.isArray(cities) ? cities : []);
                setCitiesLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch existing cities:', err);
                setCitiesLoading(false);
            });
    };

    useEffect(() => {
        if (view === 'addCity') {
            fetchExistingCities();
        }
    }, [view]);

    // Fetch existing chapters when addChapter view loads
    const fetchExistingChapters = (filterCityId = '') => {
        setChaptersLoading(true);
        getAdminChapters(filterCityId)
            .then((chapters) => {
                setExistingChapters(Array.isArray(chapters) ? chapters : []);
                setChaptersLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch existing chapters:', err);
                setChaptersLoading(false);
            });
    };

    useEffect(() => {
        if (view === 'addChapter') {
            fetchExistingChapters(chaptersFilterCityId);
        }
    }, [view, chaptersFilterCityId]);

    // Handle delete city
    const handleDeleteCity = async (cityId, cityName) => {
        if (!window.confirm(`Are you sure you want to delete "${cityName}"? This will fail if chapters or users are still linked to this city.`)) return;
        try {
            await deleteCity(cityId);
            alert(`City "${cityName}" deleted successfully!`);
            setExistingCities((prev) => prev.filter((c) => (c._id || c.id) !== cityId));
        } catch (err) {
            alert('Failed to delete city: ' + err.message);
        }
    };

    // Handle update city
    const handleUpdateCity = async () => {
        if (!editCityData.cityName.trim()) { alert('City name is required'); return; }
        const cityId = editingCity._id || editingCity.id;
        try {
            const payload = { cityName: editCityData.cityName.trim() };
            if (editCityData.state.trim()) payload.state = editCityData.state.trim();
            if (editCityData.country.trim()) payload.country = editCityData.country.trim();
            await updateCity(cityId, payload);
            alert(`City updated successfully!`);
            setEditingCity(null);
            fetchExistingCities();
        } catch (err) {
            alert('Failed to update city: ' + err.message);
        }
    };

    // Handle delete chapter
    const handleDeleteChapter = async (chapterId, chapterName) => {
        if (!window.confirm(`Are you sure you want to delete "${chapterName}"? This will clean up admins, users, and pending requests linked to this chapter.`)) return;
        try {
            await deleteChapter(chapterId);
            alert(`Chapter "${chapterName}" deleted successfully!`);
            setExistingChapters((prev) => prev.filter((c) => (c._id || c.id) !== chapterId));
        } catch (err) {
            alert('Failed to delete chapter: ' + err.message);
        }
    };

    // Handle update chapter
    const handleUpdateChapter = async () => {
        if (!editChapterData.chapterName.trim()) { alert('Chapter name is required'); return; }
        const chapterId = editingChapter._id || editingChapter.id;
        try {
            const payload = { chapterName: editChapterData.chapterName.trim() };
            if (editChapterData.description.trim()) payload.description = editChapterData.description.trim();
            if (editChapterData.meetingDay.trim()) payload.meetingDay = editChapterData.meetingDay.trim();
            if (editChapterData.meetingTime.trim()) payload.meetingTime = editChapterData.meetingTime.trim();
            if (editChapterData.venueAddress.trim()) payload.venueAddress = editChapterData.venueAddress.trim();
            await updateChapter(chapterId, payload);
            alert(`Chapter updated successfully!`);
            setEditingChapter(null);
            fetchExistingChapters(chaptersFilterCityId);
        } catch (err) {
            alert('Failed to update chapter: ' + err.message);
        }
    };

    const handleDeleteReport = async (reportId) => {
        if (!window.confirm('Are you sure you want to delete this report?')) return;
        try {
            await deleteEventReport(reportId);
            setSubmittedReports((prev) => prev.filter((r) => (r._id || r.id) !== reportId));
        } catch (err) {
            alert('Failed to delete report: ' + err.message);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            await deleteUploadedEvent(eventId);
            setUploadedEvents((prev) => prev.filter((e) => (e._id || e.id) !== eventId));
        } catch (err) {
            alert('Failed to delete event: ' + err.message);
        }
    };

    const availableCities = useMemo(() => {
        const cities = new Set();
        // Extract cities from CITIES constant
        CITIES.forEach(c => cities.add(c.name));
        // Extract cities from history logs
        history.forEach(log => {
            if (log.level === 'City') {
                cities.add(log.type);
            } else if (log.level && log.level !== 'City' && log.level !== 'Chapter') {
                // If it's a chapter, level field stores the city name
                cities.add(log.level);
            }
        });
        return Array.from(cities).sort();
    }, [history]);

    const handleAddControl = (newData) => {
        const newEntry = {
            id: history.length > 0 ? Math.max(...history.map(h => h.id)) + 1 : 1,
            giver: 'Admin',
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
            ...newData
        };
        setHistory([newEntry, ...history]);
    };

    const renderListView = () => (
        <div className="control-list animate-fade-in">
            {CONTROL_OPTIONS.map((option) => (
                <div
                    key={option.id}
                    className="control-card"
                    onClick={() => setViewPersisted(option.id)}
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
        // ========== Event (Uploaded Events) View ==========
        if (view === 'events') {
            // Gradient palette for event cards
            const EVENT_GRADIENTS = [
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
                'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
                'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
                'linear-gradient(135deg, #f5576c 0%, #ff6b6b 100%)',
                'linear-gradient(135deg, #0acffe 0%, #495aff 100%)',
            ];

            // Build city list dynamically from uploaded events + DB cities
            const eventCities = new Set();
            uploadedEvents.forEach(e => {
                const city = e.cityName || e.city;
                if (city) eventCities.add(city);
            });
            const allEventCities = dbCities.length > 0 ? [...dbCities] : [...CITIES];
            eventCities.forEach(cityName => {
                const normalizedCityName = (cityName || '').trim().toLowerCase();
                if (!allEventCities.some(c => (c.name || '').trim().toLowerCase() === normalizedCityName)) {
                    allEventCities.push({ name: cityName, gradient: EVENT_GRADIENTS[allEventCities.length % EVENT_GRADIENTS.length] });
                }
            });

            // If a specific city is selected to see its events
            if (selectedCityForEvents) {
                const cityEvents = uploadedEvents.filter(e =>
                    (e.cityName || e.city || '').trim().toLowerCase() === selectedCityForEvents.trim().toLowerCase()
                );

                return (
                    <div className="users-page animate-fade-in">
                        <div className="back-btn-container">
                            <button className="back-btn" onClick={() => setSelectedCityForEvents(null)}>
                                <ArrowLeft size={18} />
                                Back to Cities
                            </button>
                        </div>

                        {/* Premium Header for City Events */}
                        <div style={{ textAlign: 'center', marginBottom: '2.5rem', position: 'relative' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', background: 'var(--accent-gradient)', borderRadius: '16px', marginBottom: '1rem', boxShadow: '0 8px 32px rgba(180, 145, 100, 0.3)' }}>
                                <CalendarCheck size={32} color="white" />
                            </div>
                            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                {selectedCityForEvents} Events
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto' }}>
                                {cityEvents.length > 0
                                    ? `Showing ${cityEvents.length} uploaded event${cityEvents.length !== 1 ? 's' : ''} for ${selectedCityForEvents}`
                                    : `No events have been uploaded for ${selectedCityForEvents} yet.`}
                            </p>
                        </div>

                        {cityEvents.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--bg-card)', borderRadius: '24px', border: '1px dashed var(--border-color)' }}>
                                <CalendarCheck size={64} style={{ opacity: 0.15, marginBottom: '1.5rem', color: 'var(--accent-primary)' }} />
                                <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '1.3rem' }}>No Events Yet</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Upload events for {selectedCityForEvents} to see them here.</p>
                            </div>
                        ) : (
                            <div className="event-cards-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                                gap: '1.5rem',
                                padding: '0.5rem'
                            }}>
                                {cityEvents.map((event, index) => {
                                    const gradient = EVENT_GRADIENTS[index % EVENT_GRADIENTS.length];
                                    const eventName = event.eventName || event.title || event.event_name || event.name || 'Untitled Event';
                                    const cityName = event.cityName || event.city || '—';
                                    const eventDate = event.eventDate || event.date || event.event_date || '—';
                                    const eventPlace = event.fullAddress || event.full_address || event.location || event.address || event.eventPlace || event.place || '';
                                    const eventTiming = event.timing || event.time || '';
                                    const eventNote = event.note || event.description || '';
                                    const eventPhoto = event.imageUri || event.image_uri || event.eventPhoto || event.event_photo || event.photoUrl || event.photo || event.image || '';
                                    const mapLink = event.mapLink || event.locationGmapLink || event.map_link || event.location_gmap_link || event.gmapLink || '';
                                    const regLink = event.registrationLink || event.registrationFormLink || event.registration_link || event.registration_form_link || event.formLink || '';

                                    return (
                                        <div
                                            key={event._id || event.id || index}
                                            className="event-card-item"
                                            style={{
                                                background: 'var(--bg-card)',
                                                borderRadius: '20px',
                                                border: '1px solid var(--border-color)',
                                                overflow: 'hidden',
                                                transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                                cursor: 'default',
                                                position: 'relative',
                                                animation: `fadeInUp 0.5s ease ${index * 0.08}s both`
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-6px)';
                                                e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.3), 0 0 40px rgba(180, 145, 100, 0.1)';
                                                e.currentTarget.style.borderColor = 'rgba(180, 145, 100, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = 'var(--border-color)';
                                            }}
                                        >
                                            {/* Card Header with Gradient */}
                                            <div style={{
                                                background: gradient,
                                                padding: '1.5rem',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                minHeight: eventPhoto ? '180px' : '120px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'flex-end',
                                            }}>
                                                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                                                <div style={{ position: 'absolute', bottom: '-30px', left: '-15px', width: '80px', height: '80px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
                                                {eventPhoto && (
                                                    <img src={eventPhoto} alt={eventName} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />
                                                )}
                                                <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(10px)', color: 'white', padding: '5px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', zIndex: 2 }}>
                                                    📍 {cityName}
                                                </span>
                                                <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(10px)', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', zIndex: 2 }}>
                                                    {index + 1}
                                                </span>
                                                <h3 style={{ color: 'white', fontSize: '1.4rem', fontWeight: '700', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.3)', lineHeight: '1.3', position: 'relative', zIndex: 2 }}>
                                                    {eventName}
                                                </h3>
                                            </div>

                                            {/* Card Body */}
                                            <div style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(180, 145, 100, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><CalendarCheck size={16} color="#b49164" /></div>
                                                        <div style={{ flex: 1 }}><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Event Name</span><p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '600' }}>{eventName}</p></div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(79, 172, 254, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Calendar size={16} color="#4facfe" /></div>
                                                        <div><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Event Date</span><p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '500' }}>{eventDate}</p></div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(67, 233, 123, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontSize: '14px' }}>🏛️</span></div>
                                                        <div style={{ flex: 1 }}><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Address</span><p style={{ margin: 0, fontSize: '0.9rem', color: eventPlace ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: '500' }}>{eventPlace || '—'}</p></div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0, 206, 201, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontSize: '14px' }}>📍</span></div>
                                                        <div style={{ flex: 1 }}>
                                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Location Link</span>
                                                            {mapLink ? (
                                                                <a href={mapLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#00cec9', textDecoration: 'none', fontWeight: '500', marginTop: '2px', padding: '4px 10px', background: 'rgba(0, 206, 201, 0.08)', borderRadius: '8px', border: '1px solid rgba(0, 206, 201, 0.15)', width: 'fit-content', transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 206, 201, 0.18)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 206, 201, 0.08)'; }}>🗺️ Open Maps →</a>
                                                            ) : (<p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>—</p>)}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(250, 112, 154, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontSize: '14px' }}>⏰</span></div>
                                                        <div><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Timing</span><p style={{ margin: 0, fontSize: '0.9rem', color: eventTiming ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: '500' }}>{eventTiming || '—'}</p></div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(161, 140, 209, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontSize: '14px' }}>📝</span></div>
                                                        <div style={{ flex: 1 }}><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Note</span><p style={{ margin: 0, fontSize: '0.85rem', color: eventNote ? 'var(--text-secondary)' : 'var(--text-muted)', lineHeight: '1.5' }}>{eventNote || '—'}</p></div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(108, 92, 231, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FileText size={16} color="#6c5ce7" /></div>
                                                        <div style={{ flex: 1 }}>
                                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Registration Link</span>
                                                            {regLink ? (
                                                                <a href={regLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#6c5ce7', textDecoration: 'none', fontWeight: '500', marginTop: '2px', padding: '4px 10px', background: 'rgba(108, 92, 231, 0.08)', borderRadius: '8px', border: '1px solid rgba(108, 92, 231, 0.15)', width: 'fit-content', transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(108, 92, 231, 0.18)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(108, 92, 231, 0.08)'; }}>📋 Open Form →</a>
                                                            ) : (<p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>—</p>)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Card Footer - Photo & Delete */}
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        {eventPhoto ? (
                                                            <div onClick={() => window.open(eventPhoto, '_blank')} style={{ width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', border: '2px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.2s ease' }} title="Click to view full image" onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.transform = 'scale(1.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'scale(1)'; }}>
                                                                <img src={eventPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            </div>
                                                        ) : (
                                                            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <span style={{ fontSize: '16px', opacity: 0.4 }}>📷</span>
                                                            </div>
                                                        )}
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{eventPhoto ? 'View photo ↗' : 'No photo'}</span>
                                                    </div>
                                                    <button onClick={() => handleDeleteEvent(event._id || event.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', background: 'rgba(248, 113, 113, 0.08)', color: '#f87171', fontSize: '0.75rem', fontWeight: '600', border: '1px solid rgba(248, 113, 113, 0.15)', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248, 113, 113, 0.2)'; e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.4)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(248, 113, 113, 0.08)'; e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.15)'; }}>
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            }

            // Normal Events View (showing city cards)
            return (
                <div className="users-page animate-fade-in">
                    <div className="back-btn-container">
                        <button className="back-btn" onClick={() => setViewPersisted('list')}>
                            <ArrowLeft size={18} />
                            Back to Control Panel
                        </button>
                    </div>

                    {eventsLoading ? (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
                            <div style={{ width: '56px', height: '56px', border: '3px solid var(--border-color)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1.5rem' }} />
                            <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Loading events...</p>
                        </div>
                    ) : eventsError ? (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(248, 113, 113, 0.05)', borderRadius: '20px', border: '1px dashed rgba(248, 113, 113, 0.3)' }}>
                            <div style={{ width: '64px', height: '64px', background: 'rgba(248, 113, 113, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.5rem' }}>❌</div>
                            <p style={{ color: '#f87171', fontSize: '1rem', marginBottom: '1rem' }}>{eventsError}</p>
                            <button className="primary-btn" style={{ padding: '0.75rem 2rem' }} onClick={() => { setEventsError(null); setViewPersisted('events'); }}>Try Again</button>
                        </div>
                    ) : (
                        <>
                            <div className="table-controls">
                                <h2 className="section-title text-white">Uploaded Events per City</h2>
                            </div>
                            <div className="city-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1.5rem',
                                padding: '1rem'
                            }}>
                                {allEventCities.map((city) => {
                                    const eventCount = uploadedEvents.filter(e =>
                                        (e.cityName || e.city || '').trim().toLowerCase() === city.name.trim().toLowerCase()
                                    ).length;

                                    return (
                                        <div
                                            key={city.name}
                                            className="city-card hover-scale"
                                            onClick={() => setSelectedCityForEvents(city.name)}
                                            style={{
                                                background: city.gradient,
                                                borderRadius: '16px',
                                                padding: '2rem',
                                                display: 'flex',
                                                flexDirection: 'column',
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
                                                margin: '0 0 0.5rem 0'
                                            }}>
                                                {city.name}
                                            </h3>
                                            <div style={{
                                                background: 'rgba(0,0,0,0.2)',
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                color: 'white',
                                                fontSize: '0.85rem',
                                                fontWeight: '500'
                                            }}>
                                                {eventCount} {eventCount === 1 ? 'Event' : 'Events'}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            );
        }

        if (view === 'password') {
            return (
                <div className="users-page animate-fade-in">
                    <div className="back-btn-container">
                        <button className="back-btn" onClick={() => setViewPersisted('list')}>
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
                                {history.map((log) => (
                                    <tr key={log.id}>
                                        <td><span className="id-badge">#{log.id}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span className="user-name">{log.type}</span>
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.level}</span>
                                            </div>
                                        </td>
                                        <td><span style={{ color: 'var(--text-secondary)' }}>{log.givenTo}</span></td>
                                        <td><code style={{ background: 'var(--bg-secondary)', color: 'var(--accent-primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{log.password}</code></td>
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
                const cityEvents = submittedReports.filter(e =>
                    (e.cityName || e.city || '').toLowerCase() === selectedCity.toLowerCase()
                );

                if (reportsLoading) {
                    return (
                        <div className="users-page animate-fade-in">
                            <div className="back-btn-container">
                                <button className="back-btn" onClick={() => setSelectedCity(null)}>
                                    <ArrowLeft size={18} />
                                    Back to Cities
                                </button>
                            </div>
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                                Loading reports...
                            </div>
                        </div>
                    );
                }

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
                                        <th>SUBMITTED BY</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cityEvents.length > 0 ? (
                                        cityEvents.map((event) => (
                                            <tr key={event._id || event.id}>
                                                <td><span className="user-name">{event.eventName || event.title || event.event_name || event.name || '—'}</span></td>
                                                <td>{event.eventDate || event.date || event.event_date || '—'}</td>
                                                <td>{event.fullAddress || event.full_address || event.location || event.address || event.eventPlace || event.place || '—'}</td>
                                                <td style={{ textAlign: 'center' }}>{event.totalMibMembers || event.mibMembers || 0}</td>
                                                <td style={{ textAlign: 'center' }}>{event.totalMembersAttended || event.attended || 0}</td>
                                                <td style={{ textAlign: 'center' }}>{event.totalVisitors || event.visitors || 0}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                        <span>{event.photoCount || event.photos || 0} 📷</span>
                                                        <span>{event.videoCount || event.videos || 0} 🎥</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{ fontSize: '13px' }}>{event.submittedByName || '—'}</span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="icon-btn delete"
                                                        title="Delete Report"
                                                        onClick={() => handleDeleteReport(event._id || event.id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
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

            // Loading state for city list
            if (reportsLoading) {
                return (
                    <div className="users-page animate-fade-in">
                        <div className="back-btn-container">
                            <button className="back-btn" onClick={() => setViewPersisted('list')}>
                                <ArrowLeft size={18} />
                                Back to Control History
                            </button>
                        </div>
                        <h2 className="section-title text-white" style={{ marginBottom: '2rem' }}>Event Reports</h2>
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                            <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                            Loading reports...
                        </div>
                    </div>
                );
            }

            if (reportsError) {
                return (
                    <div className="users-page animate-fade-in">
                        <div className="back-btn-container">
                            <button className="back-btn" onClick={() => setViewPersisted('list')}>
                                <ArrowLeft size={18} />
                                Back to Control History
                            </button>
                        </div>
                        <h2 className="section-title text-white" style={{ marginBottom: '2rem' }}>Event Reports</h2>
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#f87171' }}>
                            <p>❌ {reportsError}</p>
                            <button className="back-btn" style={{ margin: '1rem auto', display: 'inline-flex' }} onClick={() => { setReportsError(null); setViewPersisted('event'); }}>
                                Retry
                            </button>
                        </div>
                    </div>
                );
            }

            // Build city list dynamically from API reports + DB cities
            const apiCities = new Set();
            submittedReports.forEach(r => {
                const city = r.cityName || r.city;
                if (city) apiCities.add(city);
            });
            // Merge: show DB cities + any extra cities from API data
            const allCities = dbCities.length > 0 ? [...dbCities] : [...CITIES];
            apiCities.forEach(cityName => {
                if (!allCities.find(c => c.name.toLowerCase() === cityName.toLowerCase())) {
                    allCities.push({ name: cityName, gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' });
                }
            });

            return (
                <div className="users-page animate-fade-in">
                    <div className="back-btn-container">
                        <button className="back-btn" onClick={() => setViewPersisted('list')}>
                            <ArrowLeft size={18} />
                            Back to Control History
                        </button>
                    </div>

                    <h2 className="section-title text-white" style={{ marginBottom: '0.5rem' }}>Event Reports</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                        {submittedReports.length} report{submittedReports.length !== 1 ? 's' : ''} submitted. Select a city to view details.
                    </p>

                    <div className="city-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.5rem',
                        padding: '1rem'
                    }}>
                        {allCities.map((city) => {
                            const count = submittedReports.filter(r =>
                                (r.cityName || r.city || '').toLowerCase() === city.name.toLowerCase()
                            ).length;
                            return (
                                <div
                                    key={city.name}
                                    className="city-card hover-scale"
                                    onClick={() => setSelectedCity(city.name)}
                                    style={{
                                        background: city.gradient,
                                        borderRadius: '16px',
                                        padding: '2rem',
                                        display: 'flex',
                                        flexDirection: 'column',
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
                                    <span style={{
                                        color: 'rgba(255,255,255,0.85)',
                                        fontSize: '0.85rem',
                                        marginTop: '0.5rem',
                                        background: 'rgba(0,0,0,0.2)',
                                        padding: '2px 10px',
                                        borderRadius: '12px'
                                    }}>
                                        {count} report{count !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            );
                        })}
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
                                                            style={{ cursor: 'pointer', textDecoration: 'underline', color: 'var(--text-primary)' }}
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
                                            <tr style={{ background: 'var(--hover-bg)', fontWeight: 'bold' }}>
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
                        <button className="back-btn" onClick={() => setViewPersisted('list')}>
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
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
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
                        <button className="back-btn" onClick={() => setViewPersisted('list')}>
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

                        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '2rem', borderRadius: '12px' }}>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                setUploadSubmitting(true);
                                try {
                                    // Find the cityId from the fetched cities list
                                    const matchedCity = citiesList.find(
                                        c => (c.name || c.cityName || '').toLowerCase() === selectedCityForUpload.toLowerCase()
                                    );
                                    const cityId = matchedCity?.id || matchedCity?._id || matchedCity?.cityId || '';

                                    const eventData = {
                                        eventName: uploadFormData.eventName,
                                        eventDate: uploadFormData.eventDate,
                                        timing: uploadFormData.timing,
                                        cityId: cityId,
                                        fullAddress: uploadFormData.fullAddress,
                                        mapLink: uploadFormData.mapLink,
                                        note: uploadFormData.note,
                                        registrationLink: uploadFormData.registrationLink,
                                        eventPhoto: eventPhoto || '',
                                    };

                                    console.log('[ControlsPage] Submitting event:', eventData);
                                    await createUploadedEvent(eventData);
                                    alert('Event uploaded successfully!');
                                    setUploadFormData({ eventName: '', eventDate: '', fullAddress: '', mapLink: '', timing: '', note: '', registrationLink: '' });
                                    setEventPhoto(null);
                                    setSelectedCityForUpload(null);
                                    setViewPersisted('events'); // navigate to the events list to see the new event
                                } catch (err) {
                                    console.error('[ControlsPage] Failed to upload event:', err);
                                    alert('Failed to upload event: ' + err.message);
                                } finally {
                                    setUploadSubmitting(false);
                                }
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
                                        background: eventPhoto ? `url(${eventPhoto}) center/cover no-repeat` : 'var(--bg-secondary)',
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
                                            <span style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Upload Event Photo</span>
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
                                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '500' }}>Event Name *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Fun fair"
                                        required
                                        value={uploadFormData.eventName}
                                        onChange={(e) => setUploadFormData(prev => ({ ...prev, eventName: e.target.value }))}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '500' }}>Date *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 25 Jan, 2025"
                                        required
                                        value={uploadFormData.eventDate}
                                        onChange={(e) => setUploadFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '500' }}>Full Address *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. TGB, Surat"
                                        required
                                        value={uploadFormData.fullAddress}
                                        onChange={(e) => setUploadFormData(prev => ({ ...prev, fullAddress: e.target.value }))}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '500' }}>Location (Gmap Link)</label>
                                    <input
                                        type="url"
                                        placeholder="Paste Google Maps URL here"
                                        value={uploadFormData.mapLink}
                                        onChange={(e) => setUploadFormData(prev => ({ ...prev, mapLink: e.target.value }))}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '500' }}>Timing *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 5:00 to 9:00 pm"
                                        required
                                        value={uploadFormData.timing}
                                        onChange={(e) => setUploadFormData(prev => ({ ...prev, timing: e.target.value }))}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '500' }}>Note</label>
                                    <textarea
                                        placeholder="Any special notes..."
                                        rows="3"
                                        value={uploadFormData.note}
                                        onChange={(e) => setUploadFormData(prev => ({ ...prev, note: e.target.value }))}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                    ></textarea>
                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '500' }}>Registration Form Link</label>
                                    <input
                                        type="url"
                                        placeholder="https://forms.gle/..."
                                        value={uploadFormData.registrationLink}
                                        onChange={(e) => setUploadFormData(prev => ({ ...prev, registrationLink: e.target.value }))}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={uploadSubmitting}
                                    style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', opacity: uploadSubmitting ? 0.6 : 1, cursor: uploadSubmitting ? 'not-allowed' : 'pointer' }}
                                >
                                    {uploadSubmitting ? 'Uploading...' : 'Submit Event'}
                                </button>
                            </form>
                        </div>
                    </div>
                );
            }

            return (
                <div className="users-page animate-fade-in">
                    <div className="back-btn-container">
                        <button className="back-btn" onClick={() => setViewPersisted('list')}>
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
                        {dbCitiesLoading ? (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                                Loading cities...
                            </div>
                        ) : (dbCities.length > 0 ? dbCities : CITIES).map((city) => (
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

        if (view === 'submitted') {
            return (
                <div className="users-page animate-fade-in">
                    <div className="back-btn-container">
                        <button className="back-btn" onClick={() => setViewPersisted('list')}>
                            <ArrowLeft size={18} />
                            Back to Control Panel
                        </button>
                    </div>

                    <div className="table-controls">
                        <h2 className="section-title text-white">Submitted Event Reports</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                            Reports submitted by City Admins from the mobile app.
                        </p>
                    </div>

                    {reportsLoading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                            <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                            Loading reports...
                        </div>
                    ) : reportsError ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#f87171' }}>
                            <p>❌ {reportsError}</p>
                            <button className="back-btn" style={{ margin: '1rem auto', display: 'inline-flex' }} onClick={() => setViewPersisted('submitted')}>
                                Retry
                            </button>
                        </div>
                    ) : submittedReports.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                            <p>No event reports submitted yet.</p>
                        </div>
                    ) : (
                        <div className="table-container shadow-lg">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>CITY</th>
                                        <th>EVENT NAME</th>
                                        <th>DATE</th>
                                        <th>PLACE</th>
                                        <th style={{ textAlign: 'center' }}>MIB MEMBERS</th>
                                        <th style={{ textAlign: 'center' }}>ATTENDED</th>
                                        <th style={{ textAlign: 'center' }}>VISITORS</th>
                                        <th>MEDIA</th>
                                        <th>SUBMITTED BY</th>
                                        <th>NOTE</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submittedReports.map((report) => (
                                        <tr key={report._id || report.id}>
                                            <td>
                                                <span style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>
                                                    {report.cityName || '—'}
                                                </span>
                                            </td>
                                            <td><span className="user-name">{report.eventName || report.title || report.event_name || report.name || '—'}</span></td>
                                            <td>{report.eventDate || report.date || report.event_date || '—'}</td>
                                            <td>{report.fullAddress || report.full_address || report.location || report.address || report.eventPlace || report.place || '—'}</td>
                                            <td style={{ textAlign: 'center' }}>{report.totalMibMembers || 0}</td>
                                            <td style={{ textAlign: 'center' }}>{report.totalMembersAttended || 0}</td>
                                            <td style={{ textAlign: 'center' }}>{report.totalVisitors || 0}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                    <span>{report.photoCount || 0} 📷</span>
                                                    <span>{report.videoCount || 0} 🎥</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '13px' }}>{report.submittedByName || '—'}</span>
                                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{report.submittedByEmail || ''}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '150px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                                    title={report.note || report.description || ''}
                                                >
                                                    {report.note || report.description || '—'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="icon-btn delete"
                                                    title="Delete Report"
                                                    onClick={() => handleDeleteReport(report._id || report.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            );
        }

        // ========== Add New City View ==========
        if (view === 'addCity') {
            const inputStyle = { width: '100%', padding: '0.9rem 0.9rem 0.9rem 2.75rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '1rem', transition: 'all 0.2s ease', outline: 'none' };
            const labelStyle = { display: 'block', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: '600', fontSize: '0.9rem', letterSpacing: '0.3px' };
            const focusGreen = (e) => { e.target.style.borderColor = '#43E97B'; e.target.style.boxShadow = '0 0 0 3px rgba(67, 233, 123, 0.15)'; };
            const blurReset = (e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; };

            return (
                <div className="users-page animate-fade-in">
                    <div className="back-btn-container">
                        <button className="back-btn" onClick={() => setViewPersisted('list')}>
                            <ArrowLeft size={18} />
                            Back to Control Panel
                        </button>
                    </div>

                    {/* Premium Header */}
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', background: 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)', borderRadius: '20px', marginBottom: '1.25rem', boxShadow: '0 8px 32px rgba(67, 233, 123, 0.3)' }}>
                            <MapPin size={36} color="white" />
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Add New City</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto' }}>Create a new city for member management and events.</p>
                    </div>

                    <div style={{ maxWidth: '520px', margin: '0 auto', background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '2.5rem', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            if (!cityFormData.cityName.trim()) { alert('Please enter a city name'); return; }
                            setCitySubmitting(true);
                            try {
                                const payload = { cityName: cityFormData.cityName.trim() };
                                if (cityFormData.state.trim()) payload.state = cityFormData.state.trim();
                                if (cityFormData.country.trim()) payload.country = cityFormData.country.trim();
                                await createCity(payload);
                                alert(`City "${cityFormData.cityName.trim()}" created successfully!`);
                                setCityFormData({ cityName: '', state: '', country: '' });
                                fetchExistingCities(); // refresh the list
                            } catch (err) {
                                console.error('[ControlsPage] Failed to create city:', err);
                                alert('Failed to create city: ' + err.message);
                            } finally {
                                setCitySubmitting(false);
                            }
                        }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={labelStyle}>City Name *</label>
                                <div style={{ position: 'relative' }}>
                                    <MapPin size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                    <input
                                        type="text"
                                        placeholder="e.g. Ahmedabad, Mumbai, Surat"
                                        required
                                        value={cityFormData.cityName}
                                        onChange={(e) => setCityFormData(prev => ({ ...prev, cityName: e.target.value }))}
                                        style={inputStyle}
                                        onFocus={focusGreen}
                                        onBlur={blurReset}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={labelStyle}>State <span style={{ fontWeight: '400', color: 'var(--text-muted)' }}>(optional)</span></label>
                                <div style={{ position: 'relative' }}>
                                    <MapPin size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                    <input
                                        type="text"
                                        placeholder="e.g. Gujarat, Maharashtra"
                                        value={cityFormData.state}
                                        onChange={(e) => setCityFormData(prev => ({ ...prev, state: e.target.value }))}
                                        style={inputStyle}
                                        onFocus={focusGreen}
                                        onBlur={blurReset}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={labelStyle}>Country <span style={{ fontWeight: '400', color: 'var(--text-muted)' }}>(optional)</span></label>
                                <div style={{ position: 'relative' }}>
                                    <MapPin size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                    <input
                                        type="text"
                                        placeholder="e.g. India"
                                        value={cityFormData.country}
                                        onChange={(e) => setCityFormData(prev => ({ ...prev, country: e.target.value }))}
                                        style={inputStyle}
                                        onFocus={focusGreen}
                                        onBlur={blurReset}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={citySubmitting}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    fontSize: '1.05rem',
                                    fontWeight: '600',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: citySubmitting ? 'not-allowed' : 'pointer',
                                    background: citySubmitting ? 'var(--border-color)' : 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)',
                                    color: 'white',
                                    transition: 'all 0.3s ease',
                                    boxShadow: citySubmitting ? 'none' : '0 4px 15px rgba(67, 233, 123, 0.35)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    letterSpacing: '0.3px',
                                }}
                                onMouseEnter={(e) => { if (!citySubmitting) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                {citySubmitting ? (
                                    <><div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Creating...</>
                                ) : (
                                    <><Plus size={20} /> Create City</>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Existing Cities Table */}
                    <div style={{ maxWidth: '800px', margin: '3rem auto 0' }}>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={20} style={{ color: '#43E97B' }} /> Existing Cities
                            <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: '12px', marginLeft: '0.5rem' }}>
                                {existingCities.length}
                            </span>
                        </h3>

                        {citiesLoading ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTop: '3px solid #43E97B', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                                Loading cities...
                            </div>
                        ) : existingCities.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
                                <MapPin size={48} style={{ opacity: 0.15, marginBottom: '1rem', color: '#43E97B' }} />
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No cities created yet. Create one above!</p>
                            </div>
                        ) : (
                            <div className="table-container shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>CITY NAME</th>
                                            <th>STATE</th>
                                            <th>COUNTRY</th>
                                            <th>CHAPTERS</th>
                                            <th>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {existingCities.map((city, index) => (
                                            <tr key={city._id || city.id || index} style={{ animation: `fadeInUp 0.3s ease ${index * 0.05}s both` }}>
                                                <td><span className="user-name">{city.cityName || city.name || '—'}</span></td>
                                                <td style={{ color: 'var(--text-secondary)' }}>{city.state || '—'}</td>
                                                <td style={{ color: 'var(--text-secondary)' }}>{city.country || '—'}</td>
                                                <td>
                                                    <span style={{ background: 'rgba(67, 233, 123, 0.1)', color: '#43E97B', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600' }}>
                                                        {city.chapterCount ?? city.chapters?.length ?? '—'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-buttons" style={{ display: 'flex', gap: '6px' }}>
                                                        <button
                                                            className="icon-btn edit"
                                                            title="Edit City"
                                                            onClick={() => {
                                                                setEditingCity(city);
                                                                setEditCityData({
                                                                    cityName: city.cityName || city.name || '',
                                                                    state: city.state || '',
                                                                    country: city.country || ''
                                                                });
                                                            }}
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            className="icon-btn delete"
                                                            title="Delete City"
                                                            onClick={() => handleDeleteCity(city._id || city.id, city.cityName || city.name)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Edit City Modal */}
                    {editingCity && (
                        <div className="modal-overlay" style={{ zIndex: 9999, backdropFilter: 'blur(12px)', background: 'rgba(0,0,0,0.7)' }} onClick={() => setEditingCity(null)}>
                            <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', position: 'relative', borderRadius: '20px' }}>
                                <button onClick={() => setEditingCity(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', zIndex: 1 }}>
                                    <X size={22} />
                                </button>
                                <div style={{ padding: '2rem' }}>
                                    <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Edit2 size={20} style={{ color: '#43E97B' }} /> Edit City
                                    </h3>
                                    <div style={{ marginBottom: '1.25rem' }}>
                                        <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>City Name *</label>
                                        <input type="text" value={editCityData.cityName} onChange={(e) => setEditCityData(prev => ({ ...prev, cityName: e.target.value }))} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.95rem' }} />
                                    </div>
                                    <div style={{ marginBottom: '1.25rem' }}>
                                        <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>State</label>
                                        <input type="text" value={editCityData.state} onChange={(e) => setEditCityData(prev => ({ ...prev, state: e.target.value }))} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.95rem' }} />
                                    </div>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>Country</label>
                                        <input type="text" value={editCityData.country} onChange={(e) => setEditCityData(prev => ({ ...prev, country: e.target.value }))} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.95rem' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button onClick={() => setEditingCity(null)} style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                                        <button onClick={handleUpdateCity} style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)', color: 'white', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(67, 233, 123, 0.3)' }}>Save Changes</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        // ========== Add New Chapter View ==========
        if (view === 'addChapter') {
            const inputStyle = { width: '100%', padding: '0.9rem 0.9rem 0.9rem 2.75rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '1rem', transition: 'all 0.2s ease', outline: 'none' };
            const inputStyleNoIcon = { width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '1rem', transition: 'all 0.2s ease', outline: 'none' };
            const labelStyle = { display: 'block', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: '600', fontSize: '0.9rem', letterSpacing: '0.3px' };
            const focusPurple = (e) => { e.target.style.borderColor = '#667EEA'; e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.15)'; };
            const blurReset = (e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; };

            return (
                <div className="users-page animate-fade-in">
                    <div className="back-btn-container">
                        <button className="back-btn" onClick={() => setViewPersisted('list')}>
                            <ArrowLeft size={18} />
                            Back to Control Panel
                        </button>
                    </div>

                    {/* Premium Header */}
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)', borderRadius: '20px', marginBottom: '1.25rem', boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)' }}>
                            <BookOpen size={36} color="white" />
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Add New Chapter</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto' }}>Create a new chapter under an existing city.</p>
                    </div>

                    <div style={{ maxWidth: '560px', margin: '0 auto', background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '2.5rem', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            if (!chapterFormData.chapterName.trim()) { alert('Please enter a chapter name'); return; }
                            if (!chapterFormData.cityId) { alert('Please select a city'); return; }
                            setChapterSubmitting(true);
                            try {
                                const payload = {
                                    cityId: chapterFormData.cityId,
                                    chapterName: chapterFormData.chapterName.trim(),
                                };
                                if (chapterFormData.description.trim()) payload.description = chapterFormData.description.trim();
                                if (chapterFormData.meetingDay.trim()) payload.meetingDay = chapterFormData.meetingDay.trim();
                                if (chapterFormData.meetingTime.trim()) payload.meetingTime = chapterFormData.meetingTime.trim();
                                if (chapterFormData.venueAddress.trim()) payload.venueAddress = chapterFormData.venueAddress.trim();
                                await createNewChapter(payload);
                                alert(`Chapter "${chapterFormData.chapterName.trim()}" created successfully!`);
                                setChapterFormData({ chapterName: '', cityId: '', description: '', meetingDay: '', meetingTime: '', venueAddress: '' });
                                fetchExistingChapters(chaptersFilterCityId); // refresh the list
                            } catch (err) {
                                console.error('[ControlsPage] Failed to create chapter:', err);
                                alert('Failed to create chapter: ' + err.message);
                            } finally {
                                setChapterSubmitting(false);
                            }
                        }}>
                            {/* City Selection */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={labelStyle}>Select City *</label>
                                <div style={{ position: 'relative' }}>
                                    <MapPin size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                    <select
                                        required
                                        value={chapterFormData.cityId}
                                        onChange={(e) => setChapterFormData(prev => ({ ...prev, cityId: e.target.value }))}
                                        style={{ ...inputStyle, appearance: 'none', cursor: 'pointer', color: chapterFormData.cityId ? 'var(--text-primary)' : 'var(--text-muted)' }}
                                        onFocus={focusPurple}
                                        onBlur={blurReset}
                                    >
                                        <option value="">— Choose a city —</option>
                                        {adminCitiesList.map((city) => (
                                            <option key={city._id || city.id || city.cityId} value={city._id || city.id || city.cityId}>
                                                {city.cityName || city.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronRight size={18} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                </div>
                                {adminCitiesList.length === 0 && (
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>Loading cities...</p>
                                )}
                            </div>

                            {/* Chapter Name */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={labelStyle}>Chapter Name *</label>
                                <div style={{ position: 'relative' }}>
                                    <BookOpen size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                    <input
                                        type="text"
                                        placeholder="e.g. Chapter 1, Chatpata, Dal Dal"
                                        required
                                        value={chapterFormData.chapterName}
                                        onChange={(e) => setChapterFormData(prev => ({ ...prev, chapterName: e.target.value }))}
                                        style={inputStyle}
                                        onFocus={focusPurple}
                                        onBlur={blurReset}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={labelStyle}>Description <span style={{ fontWeight: '400', color: 'var(--text-muted)' }}>(optional)</span></label>
                                <textarea
                                    placeholder="Brief description of this chapter..."
                                    rows="2"
                                    value={chapterFormData.description}
                                    onChange={(e) => setChapterFormData(prev => ({ ...prev, description: e.target.value }))}
                                    style={{ ...inputStyleNoIcon, resize: 'vertical' }}
                                    onFocus={focusPurple}
                                    onBlur={blurReset}
                                />
                            </div>

                            {/* Meeting Day & Time Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={labelStyle}>Meeting Day <span style={{ fontWeight: '400', color: 'var(--text-muted)' }}>(opt)</span></label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Wednesday"
                                        value={chapterFormData.meetingDay}
                                        onChange={(e) => setChapterFormData(prev => ({ ...prev, meetingDay: e.target.value }))}
                                        style={inputStyleNoIcon}
                                        onFocus={focusPurple}
                                        onBlur={blurReset}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Meeting Time <span style={{ fontWeight: '400', color: 'var(--text-muted)' }}>(opt)</span></label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 7:00 PM"
                                        value={chapterFormData.meetingTime}
                                        onChange={(e) => setChapterFormData(prev => ({ ...prev, meetingTime: e.target.value }))}
                                        style={inputStyleNoIcon}
                                        onFocus={focusPurple}
                                        onBlur={blurReset}
                                    />
                                </div>
                            </div>

                            {/* Venue Address */}
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={labelStyle}>Venue Address <span style={{ fontWeight: '400', color: 'var(--text-muted)' }}>(optional)</span></label>
                                <input
                                    type="text"
                                    placeholder="e.g. Grand Hyatt, Mumbai"
                                    value={chapterFormData.venueAddress}
                                    onChange={(e) => setChapterFormData(prev => ({ ...prev, venueAddress: e.target.value }))}
                                    style={inputStyleNoIcon}
                                    onFocus={focusPurple}
                                    onBlur={blurReset}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={chapterSubmitting}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    fontSize: '1.05rem',
                                    fontWeight: '600',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: chapterSubmitting ? 'not-allowed' : 'pointer',
                                    background: chapterSubmitting ? 'var(--border-color)' : 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                                    color: 'white',
                                    transition: 'all 0.3s ease',
                                    boxShadow: chapterSubmitting ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.35)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    letterSpacing: '0.3px',
                                }}
                                onMouseEnter={(e) => { if (!chapterSubmitting) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                {chapterSubmitting ? (
                                    <><div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Creating...</>
                                ) : (
                                    <><Plus size={20} /> Create Chapter</>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Existing Chapters Table */}
                    <div style={{ maxWidth: '900px', margin: '3rem auto 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                <BookOpen size={20} style={{ color: '#667EEA' }} /> Existing Chapters
                                <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: '12px', marginLeft: '0.5rem' }}>
                                    {existingChapters.length}
                                </span>
                            </h3>
                            <select
                                value={chaptersFilterCityId}
                                onChange={(e) => setChaptersFilterCityId(e.target.value)}
                                style={{ padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.85rem', cursor: 'pointer', minWidth: '160px' }}
                            >
                                <option value="">All Cities</option>
                                {adminCitiesList.map((city) => (
                                    <option key={city._id || city.id || city.cityId} value={city._id || city.id || city.cityId}>
                                        {city.cityName || city.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {chaptersLoading ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTop: '3px solid #667EEA', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                                Loading chapters...
                            </div>
                        ) : existingChapters.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
                                <BookOpen size={48} style={{ opacity: 0.15, marginBottom: '1rem', color: '#667EEA' }} />
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                    {chaptersFilterCityId ? 'No chapters found for this city.' : 'No chapters created yet. Create one above!'}
                                </p>
                            </div>
                        ) : (
                            <div className="table-container shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>CHAPTER NAME</th>
                                            <th>CITY</th>
                                            <th>MEETING DAY</th>
                                            <th>MEETING TIME</th>
                                            <th>MEMBERS</th>
                                            <th>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {existingChapters.map((chapter, index) => (
                                            <tr key={chapter._id || chapter.id || index} style={{ animation: `fadeInUp 0.3s ease ${index * 0.05}s both` }}>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span className="user-name">{chapter.chapterName || chapter.name || '—'}</span>
                                                        {(chapter.description) && (
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{chapter.description}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{ background: 'rgba(102, 126, 234, 0.1)', color: '#667EEA', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600' }}>
                                                        {chapter.cityName || chapter.city?.name || chapter.city || '—'}
                                                    </span>
                                                </td>
                                                <td style={{ color: 'var(--text-secondary)' }}>{chapter.meetingDay || '—'}</td>
                                                <td style={{ color: 'var(--text-secondary)' }}>{chapter.meetingTime || '—'}</td>
                                                <td>
                                                    <span style={{ background: 'rgba(67, 233, 123, 0.1)', color: '#43E97B', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600' }}>
                                                        {chapter.memberCount ?? chapter.members?.length ?? '—'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-buttons" style={{ display: 'flex', gap: '6px' }}>
                                                        <button
                                                            className="icon-btn edit"
                                                            title="Edit Chapter"
                                                            onClick={() => {
                                                                setEditingChapter(chapter);
                                                                setEditChapterData({
                                                                    chapterName: chapter.chapterName || chapter.name || '',
                                                                    description: chapter.description || '',
                                                                    meetingDay: chapter.meetingDay || '',
                                                                    meetingTime: chapter.meetingTime || '',
                                                                    venueAddress: chapter.venueAddress || ''
                                                                });
                                                            }}
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            className="icon-btn delete"
                                                            title="Delete Chapter"
                                                            onClick={() => handleDeleteChapter(chapter._id || chapter.id, chapter.chapterName || chapter.name)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Edit Chapter Modal */}
                    {editingChapter && (
                        <div className="modal-overlay" style={{ zIndex: 9999, backdropFilter: 'blur(12px)', background: 'rgba(0,0,0,0.7)' }} onClick={() => setEditingChapter(null)}>
                            <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', position: 'relative', borderRadius: '20px' }}>
                                <button onClick={() => setEditingChapter(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', zIndex: 1 }}>
                                    <X size={22} />
                                </button>
                                <div style={{ padding: '2rem' }}>
                                    <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Edit2 size={20} style={{ color: '#667EEA' }} /> Edit Chapter
                                    </h3>
                                    <div style={{ marginBottom: '1.25rem' }}>
                                        <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>Chapter Name *</label>
                                        <input type="text" value={editChapterData.chapterName} onChange={(e) => setEditChapterData(prev => ({ ...prev, chapterName: e.target.value }))} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.95rem' }} />
                                    </div>
                                    <div style={{ marginBottom: '1.25rem' }}>
                                        <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>Description</label>
                                        <textarea value={editChapterData.description} onChange={(e) => setEditChapterData(prev => ({ ...prev, description: e.target.value }))} rows="2" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.95rem', resize: 'vertical' }} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                        <div>
                                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>Meeting Day</label>
                                            <input type="text" value={editChapterData.meetingDay} onChange={(e) => setEditChapterData(prev => ({ ...prev, meetingDay: e.target.value }))} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.95rem' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>Meeting Time</label>
                                            <input type="text" value={editChapterData.meetingTime} onChange={(e) => setEditChapterData(prev => ({ ...prev, meetingTime: e.target.value }))} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.95rem' }} />
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>Venue Address</label>
                                        <input type="text" value={editChapterData.venueAddress} onChange={(e) => setEditChapterData(prev => ({ ...prev, venueAddress: e.target.value }))} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.95rem' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button onClick={() => setEditingChapter(null)} style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                                        <button onClick={handleUpdateChapter} style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)', color: 'white', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)' }}>Save Changes</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                <div className="back-btn-container" style={{ textAlign: 'left' }}>
                    <button className="back-btn" onClick={() => setViewPersisted('list')}>
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
                onSubmit={handleAddControl}
                cities={availableCities}
            />
        </main>
    );
}

