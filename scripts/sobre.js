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

    const loadTeamData = async () => {
        try {
            const response = await fetch('team.json');
            const teamData = await response.json();

            const teamContainer = document.querySelector('.membros');
            teamContainer.innerHTML = '';

            teamData.forEach(member => {
                const memberDiv = document.createElement('div');
                memberDiv.classList.add('membro');

                memberDiv.innerHTML = `
                    <img src="${member.photo}" alt="Foto de ${member.name}">
                    <h3>${member.name}</h3>
                    <p>${member.role}</p>
                `;

                teamContainer.appendChild(memberDiv);
            });
        } catch (error) {
            console.error('Erro ao carregar dados da equipe:', error);
        }
    };

    loadTeamData();

    const teamMembers = document.querySelectorAll('.membro');

    teamMembers.forEach(member => {
        member.addEventListener('click', () => {
            const modal = document.createElement('div');
            modal.style.position = 'fixed';
            modal.style.top = '50%';
            modal.style.left = '50%';
            modal.style.transform = 'translate(-50%, -50%)';
            modal.style.backgroundColor = '#fff';
            modal.style.padding = '20px';
            modal.style.borderRadius = '10px';
            modal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            modal.style.zIndex = '1000';

            const name = member.querySelector('h3').textContent;
            const role = member.querySelector('p').textContent;

            modal.innerHTML = `
                <h2>${name}</h2>
                <p>${role}</p>
                <button id="close-modal">Fechar</button>
            `;

            document.body.appendChild(modal);

            const closeModal = document.getElementById('close-modal');
            closeModal.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        });
    });

    const timelineItems = document.querySelectorAll('.timeline li');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.5 });

    timelineItems.forEach(item => observer.observe(item));
    teamMembers.forEach(member => observer.observe(member));

    const scrollToTopButton = document.createElement('button');
    scrollToTopButton.textContent = 'Voltar ao Topo';
    scrollToTopButton.style.position = 'fixed';
    scrollToTopButton.style.bottom = '20px';
    scrollToTopButton.style.right = '20px';
    scrollToTopButton.style.padding = '10px';
    scrollToTopButton.style.backgroundColor = '#0078d7';
    scrollToTopButton.style.color = 'white';
    scrollToTopButton.style.border = 'none';
    scrollToTopButton.style.borderRadius = '5px';
    scrollToTopButton.style.cursor = 'pointer';
    scrollToTopButton.style.display = 'none';

    document.body.appendChild(scrollToTopButton);

    scrollToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', () => {
        if (window.scrollY > 200) {
            scrollToTopButton.style.display = 'block';
        } else {
            scrollToTopButton.style.display = 'none';
        }
    });
});