document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('nameInput').value.trim();
            const email = document.getElementById('emailInput').value.trim();
            
            localStorage.setItem('urbee-user-name', name);
            localStorage.setItem('urbee-user-email', email);
            
            window.location.href = 'proyecto.html';
        });
    }
});
