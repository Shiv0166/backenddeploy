// Login page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Redirect if already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const loginData = await apiLogin({ email, password });
                setCurrentUser({
                    id: loginData.user?.id || '',
                    name: loginData.user?.name || '',
                    email: loginData.user?.email || email,
                    token: loginData.token || '',
                });
                window.location.href = 'index.html';
            } catch (error) {
                errorMessage.textContent = error.message || 'Invalid email or password';
                errorMessage.style.display = 'block';
            }
        });
    }
});
