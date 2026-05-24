// Register page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Redirect if already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');
    
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validate passwords match
            if (password !== confirmPassword) {
                errorMessage.textContent = 'Passwords do not match';
                errorMessage.style.display = 'block';
                return;
            }
            
            try {
                await apiRegister({ name, email, password });
                const loginData = await apiLogin({ email, password });
                setCurrentUser({
                    id: loginData.user?.id || '',
                    name: loginData.user?.name || name,
                    email: loginData.user?.email || email,
                    token: loginData.token || '',
                });
                window.location.href = 'index.html';
            } catch (error) {
                errorMessage.textContent = error.message || 'Registration failed';
                errorMessage.style.display = 'block';
            }
        });
    }
});
