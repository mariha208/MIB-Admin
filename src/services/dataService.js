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

// ==========================================
// Admin Management - Connected to backend
// ==========================================

// Helper for authenticated API requests
async function authApiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('mib-admin-token');
    if (!token) {
        throw new Error('No authentication token found. Please login first.');
    }

    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[dataService] ${options.method || 'GET'} ${url}`);
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();
    console.log('[dataService] Response:', response.status, data);

    if (!response.ok) {
        throw new Error(data.message || data.error || `API Error: ${response.status}`);
    }

    return data;
}

// Extract array data from various backend response structures
function extractArrayData(data) {
    // { data: { admins: [...] } } or { data: { users: [...] } } or { data: [...] }
    if (data.data) {
        if (Array.isArray(data.data)) return data.data;
        if (data.data.admins) return data.data.admins;
        if (data.data.users) return data.data.users;
        if (data.data.requests) return data.data.requests;
        if (data.data.members) return data.data.members;
    }
    // { admins: [...] } or { users: [...] }
    if (data.admins) return data.admins;
    if (data.users) return data.users;
    if (data.members) return data.members;
    // Already an array
    if (Array.isArray(data)) return data;
    // Return as-is
    return data;
}

// GET City Admins - GET /admin/admins?role=City_Admin
export async function getCityAdmins(search = '') {
    let endpoint = '/admin/admins?role=City_Admin';
    if (search) endpoint += `&search=${encodeURIComponent(search)}`;
    const data = await authApiRequest(endpoint);
    return extractArrayData(data);
}

// GET Chapter Admins - GET /admin/admins?role=Chapter_Admin
export async function getChapterAdmins(search = '') {
    let endpoint = '/admin/admins?role=Chapter_Admin';
    if (search) endpoint += `&search=${encodeURIComponent(search)}`;
    const data = await authApiRequest(endpoint);
    return extractArrayData(data);
}

// DELETE Admin - DELETE /admin/admins/:id (removes admin, back to Member)
export async function removeAdmin(adminId) {
    console.log('[dataService] removeAdmin called for ID:', adminId);
    const data = await authApiRequest(`/admin/admins/${adminId}`, { method: 'DELETE' });
    return data;
}

// GET Members for assignment - GET /admin/users?membersOnly=true
export async function getMembersForAssignment(search = '') {
    let endpoint = '/admin/users?membersOnly=true';
    if (search) endpoint += `&search=${encodeURIComponent(search)}`;
    const data = await authApiRequest(endpoint);
    return extractArrayData(data);
}

// POST Assign Admin - POST /admin/assign-admin
export async function assignAdmin(userId, role, cityId, chapterId = null) {
    console.log('[dataService] assignAdmin called:', { userId, role, cityId, chapterId });
    const body = { userId, role, cityId };
    if (chapterId) body.chapterId = chapterId;
    const data = await authApiRequest('/admin/assign-admin', {
        method: 'POST',
        body: JSON.stringify(body),
    });
    return data;
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

// ==========================================
// Chapter Management - Connected to backend
// ==========================================

// GET Pending Chapters - GET /chapters/pending?status=Pending
export async function getPendingChapters() {
    console.log('[dataService] getPendingChapters called');
    try {
        const data = await authApiRequest('/chapters/pending?status=Pending');
        console.log('[dataService] Pending chapters response:', data);

        // Handle various response structures
        // Backend returns: { success: true, data: { requests: [...], count: N } }
        if (data.data && data.data.requests) return data.data.requests;
        if (data.data && data.data.chapters) return data.data.chapters;
        if (data.data && Array.isArray(data.data)) return data.data;
        if (data.requests) return data.requests;
        if (data.chapters) return data.chapters;
        if (Array.isArray(data)) return data;
        return data;
    } catch (error) {
        console.error('[dataService] Error fetching pending chapters:', error);
        throw error;
    }
}

// POST Approve Chapter - POST /chapters/:id/approve
export async function approveChapter(chapterId) {
    console.log('[dataService] approveChapter called for ID:', chapterId);
    try {
        const data = await authApiRequest(`/chapters/${chapterId}/approve`, {
            method: 'POST',
        });
        console.log('[dataService] Approve chapter response:', data);
        return data;
    } catch (error) {
        console.error('[dataService] Error approving chapter:', error);
        throw error;
    }
}

// POST Reject Chapter - POST /chapters/:id/reject
export async function rejectChapter(chapterId, reason) {
    console.log('[dataService] rejectChapter called for ID:', chapterId, 'reason:', reason);
    try {
        const data = await authApiRequest(`/chapters/${chapterId}/reject`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
        });
        console.log('[dataService] Reject chapter response:', data);
        return data;
    } catch (error) {
        console.error('[dataService] Error rejecting chapter:', error);
        throw error;
    }
}

export async function denyPendingRequest(requestId) {
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

// ==========================================
// Reports Management - Connected to backend
// ==========================================

// GET All Reports (Super Admin) - GET /reports?city=
export async function getEventReports(cityFilter = null) {
    console.log('[dataService] getEventReports called, cityFilter:', cityFilter);
    let endpoint = '/reports';
    if (cityFilter) {
        endpoint += `?city=${encodeURIComponent(cityFilter)}`;
    }
    const data = await authApiRequest(endpoint);
    console.log('[dataService] Event reports response:', data);
    // Handle various response shapes
    if (data.data?.reports) return data.data.reports;
    if (data.reports) return data.reports;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data)) return data;
    return data;
}

// GET Single Report (Super Admin) - GET /reports/:id
export async function getReportById(reportId) {
    console.log('[dataService] getReportById called for ID:', reportId);
    const data = await authApiRequest(`/reports/${reportId}`);
    console.log('[dataService] Single report response:', data);
    return data.data?.report || data.report || data.data || data;
}

// DELETE Report (Super Admin) - DELETE /reports/:id
export async function deleteEventReport(reportId) {
    console.log('[dataService] deleteEventReport called for ID:', reportId);
    const data = await authApiRequest(`/reports/${reportId}`, { method: 'DELETE' });
    console.log('[dataService] Delete report response:', data);
    return data;
}
