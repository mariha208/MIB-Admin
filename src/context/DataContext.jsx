import { createContext, useContext, useState, useEffect } from 'react';
import { getPendingRequests, approvePendingRequest, denyPendingRequest, signIn } from '../services/dataService';

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
    pendingRequests: [], // Added pending requests
};

const DataContext = createContext(null);

export function DataProvider({ children }) {
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const [pendingLoading, setPendingLoading] = useState(false);
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

    // Fetch pending requests from backend API
    // Accepts optional token parameter for cases where localStorage might not be synced yet
    const fetchPendingRequests = async (authToken = null) => {
        console.log('[DataContext] fetchPendingRequests called with token:', authToken ? 'PROVIDED' : 'NOT PROVIDED');
        
        // Get token from parameter or localStorage
        const token = authToken || localStorage.getItem('mib-admin-token');
        console.log('[DataContext] Token to use:', token ? token.substring(0, 15) + '...' : 'NONE');
        
        if (!token) {
            console.warn('[DataContext] No token available, skipping fetch');
            return;
        }
        
        setPendingLoading(true);
        try {
            const pendingData = await getPendingRequests(token);
            console.log('[DataContext] Fetched pending requests:', pendingData);
            setData(prev => ({
                ...prev,
                pendingRequests: Array.isArray(pendingData) ? pendingData : []
            }));
            console.log('[DataContext] Pending requests updated in state');
        } catch (err) {
            console.error('[DataContext] Failed to fetch pending requests:', err);
            setError(err.message);
        } finally {
            setPendingLoading(false);
        }
    };

    // Approve a pending request - moves user from pending to users table
    const approveRequest = async (requestId) => {
        try {
            console.log('[DataContext] Approving request:', requestId);
            const result = await approvePendingRequest(requestId);
            console.log('[DataContext] Approve API result:', result);
            
            // Find the request that was approved to get its data
            const approvedRequest = data.pendingRequests.find(req => req.id === requestId);
            console.log('[DataContext] Approved request data:', approvedRequest);
            
            // Get user data from API response or use request data
            const newUserData = result.data || result.user || {};
            
            // Create the new user object to add to users table
            const newUser = {
                id: newUserData.userId || newUserData.id || requestId,
                name: newUserData.name || approvedRequest?.name || 'N/A',
                email: newUserData.email || approvedRequest?.email || 'N/A',
                phone: approvedRequest?.phone || approvedRequest?.phoneNumber || 'N/A',
                transactionDetails: approvedRequest?.transactionId || approvedRequest?.transactionDetails || 'N/A',
                city: approvedRequest?.city || 'N/A',
                cityId: approvedRequest?.cityId || 'N/A',
                chapter: approvedRequest?.chapter || 'N/A',
                chapterId: approvedRequest?.chapterId || 'N/A',
                business: '₹0',
                referrals: 0,
                visitors: 0,
                one2one: 0,
                status: 'Active'
            };
            
            console.log('[DataContext] New user to add:', newUser);
            
            // Update local state:
            // 1. Remove from pendingRequests
            // 2. Add to users array
            setData(prev => ({
                ...prev,
                pendingRequests: prev.pendingRequests.filter(req => req.id !== requestId),
                users: [...prev.users, newUser]
            }));
            
            console.log('[DataContext] User moved from pending to users table');
            return { success: true, user: newUser };
        } catch (err) {
            console.error('[DataContext] Failed to approve request:', err);
            throw err;
        }
    };

    // Deny a pending request - removes from pending requests
    const denyRequest = async (requestId) => {
        try {
            console.log('[DataContext] Denying request:', requestId);
            await denyPendingRequest(requestId);
            console.log('[DataContext] Deny API call successful');
            
            // Remove from pendingRequests
            setData(prev => ({
                ...prev,
                pendingRequests: prev.pendingRequests.filter(req => req.id !== requestId)
            }));
            
            console.log('[DataContext] Request removed from pending list');
            return { success: true };
        } catch (err) {
            console.error('[DataContext] Failed to deny request:', err);
            throw err;
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



    // Authentication State
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('mib-admin-user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                // If password is missing (old session), force logout/null
                if (parsed.password) return parsed;
                localStorage.removeItem('mib-admin-user');
            } catch (e) {
                localStorage.removeItem('mib-admin-user');
            }
        }
        return null;
    });

    const [loginLoading, setLoginLoading] = useState(false);

    const login = async (email, password) => {
        console.log('[DataContext] login called with email:', email);
        setLoginLoading(true);
        
        try {
            console.log('[DataContext] Calling signIn API...');
            const response = await signIn(email, password);
            console.log('[DataContext] signIn API response:', response);
            
            // Extract user data from the response
            // Adjust based on your actual API response structure
            const userData = response.user || response.data || response;
            console.log('[DataContext] Extracted user data:', userData);
            
            const loggedInUser = {
                id: userData.id,
                name: userData.name || userData.email?.split('@')[0] || 'User',
                email: userData.email || email,
                role: userData.role || 'Administrator',
                avatar: (userData.name || email).charAt(0).toUpperCase(),
                token: response.token || userData.token,
            };
            
            console.log('[DataContext] Setting logged in user:', loggedInUser);
            setUser(loggedInUser);
            localStorage.setItem('mib-admin-user', JSON.stringify(loggedInUser));
            
            // Extract token from various possible response structures
            // Your backend returns: { success: true, user: { token: "...", ... } }
            const token = response.token || 
                          response.user?.token ||
                          response.accessToken || 
                          response.data?.token || 
                          response.data?.accessToken ||
                          userData.token ||
                          userData.accessToken;
            
            console.log('[DataContext] Token extraction check:');
            console.log('  - response.token:', response.token);
            console.log('  - response.user?.token:', response.user?.token);
            console.log('  - userData.token:', userData.token);
            console.log('  - Final extracted token:', token ? token.substring(0, 10) + '...' : 'NONE');
            
            // Store token if available
            if (token) {
                console.log('[DataContext] Storing auth token:', token.substring(0, 10) + '...');
                localStorage.setItem('mib-admin-token', token);
                
                // Fetch pending requests after successful login - pass token directly!
                console.log('[DataContext] Fetching pending requests with token directly...');
                await fetchPendingRequests(token);
            } else {
                console.warn('[DataContext] WARNING: No token found in login response! Pending requests will not work.');
            }
            
            return { success: true, user: loggedInUser };
        } catch (error) {
            console.error('[DataContext] Login failed:', error);
            return { success: false, error: error.message || 'Login failed' };
        } finally {
            setLoginLoading(false);
        }
    };

    const logout = () => {
        console.log('[DataContext] Logging out user');
        setUser(null);
        localStorage.removeItem('mib-admin-user');
        localStorage.removeItem('mib-admin-token');
        // Clear pending requests on logout
        setData(prev => ({ ...prev, pendingRequests: [] }));
    };

    useEffect(() => {
        fetchData();
        // Only fetch pending requests if user is already authenticated (has token)
        const token = localStorage.getItem('mib-admin-token');
        if (token) {
            console.log('[DataContext] User has token, fetching pending requests on mount...');
            fetchPendingRequests();
        } else {
            console.log('[DataContext] No token found, skipping pending requests fetch');
        }
    }, []);

    return (
        <DataContext.Provider value={{
            data,
            loading,
            pendingLoading,
            loginLoading,
            error,
            user,
            isAuthenticated: !!user,
            login,
            logout,
            fetchData,
            fetchPendingRequests,
            approveRequest,
            denyRequest,
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

