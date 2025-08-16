document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const currentMode = localStorage.getItem('darkMode');

    if (currentMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
    });

    const form = document.querySelector('.formulario-contato form');
    const feedback = document.getElementById('feedback');

    // Prefill form with saved data
    const savedData = JSON.parse(localStorage.getItem('contactFormData')) || {};
    document.getElementById('nome').value = savedData.nome || '';
    document.getElementById('email').value = savedData.email || '';
    document.getElementById('mensagem').value = savedData.mensagem || '';

    form.addEventListener('input', () => {
        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const mensagem = document.getElementById('mensagem').value.trim();

        localStorage.setItem('contactFormData', JSON.stringify({ nome, email, mensagem }));
    });

    const messageInput = document.getElementById('mensagem');
    const charCounter = document.createElement('div');
    charCounter.textContent = '0/500 caracteres';
    charCounter.style.marginTop = '10px';
    charCounter.style.fontSize = '0.9rem';
    charCounter.style.color = '#555';

    messageInput.parentNode.insertBefore(charCounter, messageInput.nextSibling);

    messageInput.addEventListener('input', () => {
        const charCount = messageInput.value.length;
        charCounter.textContent = `${charCount}/500 caracteres`;
        if (charCount > 500) {
            charCounter.style.color = 'red';
        } else {
            charCounter.style.color = '#555';
        }
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const mensagem = document.getElementById('mensagem').value.trim();

        if (!nome || !email || !mensagem) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        if (!validateEmail(email)) {
            alert('Por favor, insira um email válido.');
            return;
        }

        feedback.textContent = 'Enviando mensagem...';
        feedback.style.display = 'block';

        const spinner = document.createElement('div');
        spinner.classList.add('spinner');
        spinner.textContent = 'Enviando...';
        form.appendChild(spinner);

        setTimeout(() => {
            spinner.remove();
            feedback.textContent = 'Mensagem enviada com sucesso!';
            form.reset();
            localStorage.removeItem('contactFormData');
        }, 2000); // Simulate a 2-second submission delay
    });

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});