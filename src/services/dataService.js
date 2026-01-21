// Data Service - Bridge between Frontend and Backend
// Replace these functions with actual API calls when backend is ready

const API_BASE_URL = '/api'; // Change to your actual API URL

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
