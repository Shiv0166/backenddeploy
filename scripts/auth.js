// Authentication management
const AUTH_KEY = 'foodhub_auth';
const USERS_KEY = 'foodhub_users';
const API_BASE = '/auth';

// Get current user
function getCurrentUser() {
    const authData = localStorage.getItem(AUTH_KEY);
    return authData ? JSON.parse(authData) : null;
}

// Set current user
function setCurrentUser(user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

function getAuthToken() {
    const user = getCurrentUser();
    return user?.token || '';
}

// Remove current user
function logout() {
    localStorage.removeItem(AUTH_KEY);
}

// Get all users
function getUsers() {
    const usersData = localStorage.getItem(USERS_KEY);
    return usersData ? JSON.parse(usersData) : [];
}

// Add new user
function addUser(user) {
    const users = getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Check if user exists
function userExists(email) {
    const users = getUsers();
    return users.some(user => user.email === email);
}

// Validate login
function validateLogin(email, password) {
    const users = getUsers();
    return users.find(user => user.email === email && user.password === password);
}

async function apiRegister({ name, email, password }) {
    const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Registration failed');
    return data;
}

async function apiLogin({ email, password }) {
    const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    return data;
}

// Update UI based on auth state
function updateAuthUI() {
    const currentUser = getCurrentUser();
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');

    if (currentUser) {
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
        if (userName) userName.textContent = currentUser.name;
        
        if (logoutBtn) {
            logoutBtn.onclick = function() {
                logout();
                window.location.href = 'index.html';
            };
        }
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }
}

// Check if user is authenticated (for protected pages)
function requireAuth() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Please login to access this page');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Initialize auth UI on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateAuthUI);
} else {
    updateAuthUI();
}
