document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('form');

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = loginForm.querySelector('input[type="text"]').value.trim();
        const password = loginForm.querySelector('input[type="password"]').value.trim();

        if (!username || !password) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        // Validate credentials
        if (username === 'admin' && password === '1234') {
            alert('Login bem-sucedido!');
            window.location.replace('area-restrita.html');
        } else {
            alert('Usuário ou senha inválidos.');
        }
    });
});