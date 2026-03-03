// Data Service - Bridge between Frontend and Backend
// This connects to the actual backend API

const API_BASE_URL = '/api/v1'; // Using versioned API endpoint

// Helper function for API requests
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            // Add auth headers here if needed
            // 'Authorization': `Bearer ${getToken()}`
        },
        ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
}

// Authentication - Sign In
export async function signIn(email, password) {
    console.log('[dataService] signIn called with email:', email);

    try {
        const url = `${API_BASE_URL}/auth/signin`;
        console.log('[dataService] Making POST request to:', url);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        console.log('[dataService] Response status:', response.status);

        const data = await response.json();
        console.log('[dataService] Response data:', data);

        if (!response.ok) {
            console.error('[dataService] Sign in failed:', data);
            throw new Error(data.message || data.error || `Sign in failed: ${response.status}`);
        }

        console.log('[dataService] Sign in successful:', data);
        console.log('[dataService] Token locations in response:');
        console.log('  - data.token:', data.token);
        console.log('  - data.user?.token:', data.user?.token);
        console.log('  - data.accessToken:', data.accessToken);
        return data;
    } catch (error) {
        console.error('[dataService] Sign in error:', error);
        throw error;
    }
}

// Dashboard Stats
export async function getDashboardStats() {
    // TODO: return apiRequest('/dashboard/stats');
    return {
        totalBusiness: 156,
        totalReferrals: 89,
        total121: 234,
        totalVisitors: 67,
    };
}

// Users
export async function getUsers() {
    // TODO: return apiRequest('/users');
    return [];
}

export async function createUser(userData) {
    // TODO: return apiRequest('/users', { method: 'POST', body: JSON.stringify(userData) });
    return { id: Date.now(), ...userData };
}

export async function updateUser(userId, userData) {
    // TODO: return apiRequest(`/users/${userId}`, { method: 'PUT', body: JSON.stringify(userData) });
    return { id: userId, ...userData };
}

export async function deleteUser(userId) {
    // TODO: return apiRequest(`/users/${userId}`, { method: 'DELETE' });
    return { success: true };
}

// Chapters
export async function getChapters() {
    // TODO: return apiRequest('/chapters');
    return [
        { id: 1, name: 'Chapter 1', city: 'Surat', members: 45 },
        { id: 2, name: 'Chapter 2', city: 'Surat', members: 32 },
        { id: 3, name: 'Chapter 3', city: 'Mumbai', members: 52 },
        { id: 4, name: 'Chapter 4', city: 'Mumbai', members: 41 },
    ];
}

export async function createChapter(chapterData) {
    // TODO: return apiRequest('/chapters', { method: 'POST', body: JSON.stringify(chapterData) });
    return { id: Date.now(), ...chapterData };
}

// Business Data
export async function getBusinessData(filters = {}) {
    // TODO: return apiRequest('/business', { ...filters });
    return [];
}

// Referrals
export async function getReferrals(filters = {}) {
    // TODO: return apiRequest('/referrals', { ...filters });
    return [];
}

// 1-2-1 Meetings
export async function getMeetings(filters = {}) {
    // TODO: return apiRequest('/meetings', { ...filters });
    return [];
}

// Visitors
export async function getVisitors(filters = {}) {
    // TODO: return apiRequest('/visitors', { ...filters });
    return [];
}

// Helper function to get auth token from localStorage
export function getAuthToken() {
    const token = localStorage.getItem('mib-admin-token');
    console.log('[dataService] getAuthToken - token:', token ? token.substring(0, 15) + '...' : 'NULL');
    return token;
}

// Pending User Requests - Connected to actual backend
// Now accepts token as parameter for reliability
export async function getPendingRequests(token = null) {
    console.log('[dataService] getPendingRequests called');

    // Use provided token or try to get from localStorage
    const authToken = token || getAuthToken();
    console.log('[dataService] Using token:', authToken ? authToken.substring(0, 15) + '...' : 'NONE');

    if (!authToken) {
        console.warn('[dataService] No auth token available, returning empty array');
        return [];
    }

    try {
        const url = `${API_BASE_URL}/admin/pending-requests`;
        console.log('[dataService] Making GET request to:', url);
        console.log('[dataService] Authorization header: Bearer', authToken.substring(0, 10) + '...');

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
        });

        console.log('[dataService] Response status:', response.status);

        const data = await response.json();
        console.log('[dataService] Response data:', data);

        if (!response.ok) {
            console.error('[dataService] Failed to fetch pending requests:', data);
            throw new Error(data.message || data.error || `Failed to fetch: ${response.status}`);
        }

        // Handle the response structure from your backend
        // Your backend returns: { data: { requests: [...], count: N } }

        // Check for nested data.data.requests structure
        if (data.data && data.data.requests) {
            console.log('[dataService] Returning pending requests from data.data.requests:', data.data.requests);
            return data.data.requests;
        }

        // Check for data.requests structure
        if (data.requests) {
            console.log('[dataService] Returning pending requests from data.requests:', data.requests);
            return data.requests;
        }

        // Fallback for data.data array structure
        if (data.data && Array.isArray(data.data)) {
            console.log('[dataService] Returning pending requests from data.data:', data.data);
            return data.data;
        }

        // If it's already an array, return it
        if (Array.isArray(data)) {
            console.log('[dataService] Returning raw array:', data);
            return data;
        }

        console.log('[dataService] Returning raw response:', data);
        return data;
    } catch (error) {
        console.error('[dataService] Error fetching pending requests:', error);
        throw error;
    }
}

export async function approvePendingRequest(requestId) {
    console.log('[dataService] approvePendingRequest called for ID:', requestId);

    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No authentication token found. Please login first.');
        }

        const url = `${API_BASE_URL}/admin/pending-requests/${requestId}/approve`;
        console.log('[dataService] Making POST request to:', url);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        console.log('[dataService] Approve response status:', response.status);

        const data = await response.json();
        console.log('[dataService] Approve response data:', data);

        if (!response.ok) {
            throw new Error(data.message || data.error || `Failed to approve: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('[dataService] Error approving request:', error);
        throw error;
    }
}

export async function denyPendingRequest(requestId, reason = 'Registration denied by administrator.') {
    console.log('[dataService] denyPendingRequest called for ID:', requestId);

    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No authentication token found. Please login first.');
        }

        const url = `${API_BASE_URL}/admin/pending-requests/${requestId}/deny`;
        console.log('[dataService] Making POST request to:', url);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ reason }),
        });

        console.log('[dataService] Deny response status:', response.status);

        const data = await response.json();
        console.log('[dataService] Deny response data:', data);

        if (!response.ok) {
            throw new Error(data.message || data.error || `Failed to deny: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('[dataService] Error denying request:', error);
        throw error;
    }
}
