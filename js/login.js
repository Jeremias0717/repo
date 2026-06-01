document.addEventListener('DOMContentLoaded', function() {
    const savedEmail = localStorage.getItem('urbee-user-email');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const loginForm = document.getElementById('loginForm');

    if (savedEmail && emailInput && passwordInput) {
        emailInput.value = savedEmail;
        if (savedEmail !== 'johndoe123@xyz.com') {
            passwordInput.value = '';
        }
    }

    if (loginForm && emailInput && passwordInput) {
        loginForm.addEventListener('submit', function() {
            const email = emailInput.value.trim();
            if (email === 'johndoe123@xyz.com') {
                localStorage.setItem('urbee-user-name', 'John Doe');
                localStorage.setItem('urbee-user-email', 'johndoe123@xyz.com');
            } else if (email !== savedEmail) {
                localStorage.setItem('urbee-user-name', email.split('@')[0]);
                localStorage.setItem('urbee-user-email', email);
            }
        });
    }
});
