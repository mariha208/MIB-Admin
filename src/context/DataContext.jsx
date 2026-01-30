import { createContext, useContext, useState, useEffect } from 'react';

// Initial mock data - this will be replaced with API calls
const initialData = {
    stats: {
        totalBusiness: 15600000,
        totalReferrals: 89,
        total121: 234,
        totalVisitors: 67,
    },
    chapters: [
        { id: 1, name: 'Chapter 1', city: 'Surat', members: 45 },
        { id: 2, name: 'Chapter 2', city: 'Surat', members: 32 },
        { id: 3, name: 'Chapter 3', city: 'Mumbai', members: 52 },
        { id: 4, name: 'Chapter 4', city: 'Mumbai', members: 41 },
    ],
    users: [
        { id: 101, name: 'John Doe', email: 'john@example.com', password: 'pass', phone: '+91 98765 43210', transactionDetails: 'TXN_MIB_8892', city: 'Surat', cityId: 'SUR', chapter: 'Chapter 1', chapterId: '1', business: '₹1.2L', referrals: 15, visitors: 2, one2one: 12, status: 'Active' },
        { id: 102, name: 'Jane Smith', email: 'jane@world.com', password: 'pass', phone: '+91 88776 65544', transactionDetails: 'TXN_MIB_1120', city: 'Mumbai', cityId: 'MUM', chapter: 'Chapter 3', chapterId: '3', business: '₹5.4L', referrals: 28, visitors: 5, one2one: 20, status: 'Active' },
        { id: 103, name: 'Rahul Verma', email: 'rahul.v@gmail.com', password: 'pass', phone: '+91 99009 88112', transactionDetails: 'TXN_MIB_4432', city: 'Surat', cityId: 'SUR', chapter: 'Chapter 2', chapterId: '2', business: '₹80K', referrals: 10, visitors: 1, one2one: 8, status: 'Inactive' },
        { id: 104, name: 'Sneha Kapur', email: 'sneha@mib.org', password: 'pass', phone: '+91 77221 13344', transactionDetails: 'TXN_MIB_9901', city: 'Mumbai', cityId: 'MUM', chapter: 'Chapter 4', chapterId: '4', business: '₹2.1L', referrals: 22, visitors: 3, one2one: 18, status: 'Active' },
        { id: 105, name: 'Amit Shah', email: 'amit.s@corp.com', password: 'pass', phone: '+91 91122 33445', transactionDetails: 'TXN_MIB_2209', city: 'Ahmedabad', cityId: 'AHM', chapter: 'Chapter 1', chapterId: '1', business: '₹3.5L', referrals: 18, visitors: 4, one2one: 15, status: 'Active' },
        { id: 106, name: 'Priya Joshi', email: 'priya.j@dev.in', password: 'pass', phone: '+91 88990 01122', transactionDetails: 'TXN_MIB_7761', city: 'Baroda', cityId: 'BAR', chapter: 'Chapter 2', chapterId: '2', business: '₹1.8L', referrals: 12, visitors: 2, one2one: 10, status: 'Active' },
    ],
    businessData: [],
    referralsData: [],
    visitorsData: [],
};

const DataContext = createContext(null);

export function DataProvider({ children }) {
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Simulated API fetch - replace with real API calls
    const fetchData = async () => {
        setLoading(true);
        try {
            // TODO: Replace with actual API endpoint
            // const response = await fetch('/api/dashboard');
            // const result = await response.json();
            // setData(result);

            // For now, use mock data
            await new Promise(resolve => setTimeout(resolve, 500));
            setData(initialData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // CRUD operations - ready for API integration
    const updateStat = async (statName, value) => {
        setData(prev => ({
            ...prev,
            stats: { ...prev.stats, [statName]: value }
        }));
        // TODO: API call to update stat
    };

    const addUser = async (user) => {
        setData(prev => ({
            ...prev,
            users: [...prev.users, { ...user, id: Date.now() }]
        }));
        // TODO: API call to add user
    };

    const updateUser = async (userId, updates) => {
        setData(prev => ({
            ...prev,
            users: prev.users.map(u => u.id === userId ? { ...u, ...updates } : u)
        }));
        // TODO: API call to update user
    };

    const deleteUser = async (userId) => {
        setData(prev => ({
            ...prev,
            users: prev.users.filter(u => u.id !== userId)
        }));
        // TODO: API call to delete user
    };

    const addChapter = async (chapter) => {
        setData(prev => ({
            ...prev,
            chapters: [...prev.chapters, { ...chapter, id: Date.now() }]
        }));
        // TODO: API call to add chapter
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <DataContext.Provider value={{
            data,
            loading,
            error,
            fetchData,
            updateStat,
            addUser,
            updateUser,
            deleteUser,
            addChapter,
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
