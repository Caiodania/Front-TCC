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

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Filtrar rotas...';
    searchInput.style.marginBottom = '20px';
    searchInput.style.padding = '10px';
    searchInput.style.width = '100%';
    searchInput.style.borderRadius = '5px';
    searchInput.style.border = '1px solid #ccc';

    const horariosSection = document.querySelector('.horarios');
    horariosSection.insertBefore(searchInput, horariosSection.firstChild);

    searchInput.addEventListener('input', () => {
        const filter = searchInput.value.toLowerCase();
        const rows = horariosSection.querySelectorAll('tbody tr');

        rows.forEach(row => {
            const route = row.cells[0].textContent.toLowerCase();
            if (route.includes(filter)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    const highlightNextBus = () => {
        const now = new Date();
        const rows = document.querySelectorAll('.horarios tbody tr');

        rows.forEach(row => {
            const timeCell = row.cells[1];
            const busTime = new Date();
            const [hours, minutes] = timeCell.textContent.split(':').map(Number);
            busTime.setHours(hours, minutes, 0, 0);

            if (busTime > now) {
                row.style.backgroundColor = '#d4edda'; // Highlight next bus
                row.style.color = '#155724';
            } else {
                row.style.backgroundColor = '';
                row.style.color = '';
            }
        });
    };

    highlightNextBus();
    setInterval(highlightNextBus, 60000); // Update every minute

    const notifications = [
        'Nova rota adicionada: Bairro Novo - Centro.',
        'Manutenção programada na linha 3 no dia 30/04/2025.',
        'Atualização no horário da linha 5.'
    ];

    const notificationContainer = document.createElement('div');
    notificationContainer.classList.add('notification-container');
    document.body.appendChild(notificationContainer);

    let currentNotification = 0;

    const showNotification = () => {
        notificationContainer.textContent = notifications[currentNotification];
        notificationContainer.style.display = 'block';

        setTimeout(() => {
            notificationContainer.style.display = 'none';
            currentNotification = (currentNotification + 1) % notifications.length;
        }, 5000); // Show each notification for 5 seconds
    };

    setInterval(showNotification, 7000); // Cycle through notifications every 7 seconds
    showNotification();

    const addRouteForm = document.getElementById('add-route-form');
    const routesTableBody = document.querySelector('#routes-table tbody');
    const filterInput = document.getElementById('filtro-rotas');

    // Load saved routes from localStorage
    const savedRoutes = JSON.parse(localStorage.getItem('busRoutes')) || [];
    savedRoutes.forEach(route => addRouteToTable(route));

    // Add new route
    addRouteForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const routeName = document.getElementById('route-name').value.trim();
        const departureTime = document.getElementById('departure-time').value;
        const arrivalTime = document.getElementById('arrival-time').value;

        if (!routeName || !departureTime || !arrivalTime) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        const newRoute = { routeName, departureTime, arrivalTime };
        addRouteToTable(newRoute);

        // Save to localStorage
        savedRoutes.push(newRoute);
        localStorage.setItem('busRoutes', JSON.stringify(savedRoutes));

        addRouteForm.reset();
    });

    // Filter routes
    filterInput.addEventListener('input', () => {
        const filter = filterInput.value.toLowerCase();
        const rows = routesTableBody.querySelectorAll('tr');

        rows.forEach(row => {
            const routeName = row.cells[0].textContent.toLowerCase();
            if (routeName.includes(filter)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Sort routes by departure time
    const sortRoutes = () => {
        const rows = Array.from(routesTableBody.querySelectorAll('tr'));
        rows.sort((a, b) => {
            const timeA = a.cells[1].textContent;
            const timeB = b.cells[1].textContent;
            return timeA.localeCompare(timeB);
        });

        rows.forEach(row => routesTableBody.appendChild(row));
    };

    document.getElementById('sort-routes').addEventListener('click', sortRoutes);

    // Add route to table
    function addRouteToTable(route) {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td class="route-name" style="padding: 10px; border: 1px solid #ccc;">${route.routeName}</td>
            <td style="padding: 10px; border: 1px solid #ccc;">${route.departureTime}</td>
            <td style="padding: 10px; border: 1px solid #ccc;">${route.arrivalTime}</td>
            <td style="padding: 10px; border: 1px solid #ccc;">
                <button class="edit-route">Editar</button>
                <button class="delete-route">Excluir</button>
            </td>
        `;

        routesTableBody.appendChild(newRow);
    }

    const exportButton = document.createElement('button');
    exportButton.textContent = 'Exportar Rotas para CSV';
    exportButton.style.marginTop = '20px';
    exportButton.style.padding = '10px';
    exportButton.style.backgroundColor = '#0078d7';
    exportButton.style.color = 'white';
    exportButton.style.border = 'none';
    exportButton.style.borderRadius = '5px';
    exportButton.style.cursor = 'pointer';

    const clearButton = document.createElement('button');
    clearButton.textContent = 'Limpar Todas as Rotas';
    clearButton.style.marginTop = '20px';
    clearButton.style.marginLeft = '10px';
    clearButton.style.padding = '10px';
    clearButton.style.backgroundColor = '#d9534f';
    clearButton.style.color = 'white';
    clearButton.style.border = 'none';
    clearButton.style.borderRadius = '5px';
    clearButton.style.cursor = 'pointer';

    const routesSection = document.querySelector('.rotas');
    routesSection.appendChild(exportButton);
    routesSection.appendChild(clearButton);

    exportButton.addEventListener('click', () => {
        const rows = document.querySelectorAll('#routes-table tbody tr');
        let csvContent = 'data:text/csv;charset=utf-8,Rota,Horário de Partida,Horário de Chegada\n';

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const rowData = Array.from(cells).map(cell => cell.textContent).join(',');
            csvContent += rowData + '\n';
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'rotas_onibus.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    clearButton.addEventListener('click', () => {
        if (confirm('Tem certeza de que deseja limpar todas as rotas?')) {
            const routesTableBody = document.querySelector('#routes-table tbody');
            routesTableBody.innerHTML = '';
            localStorage.removeItem('busRoutes');
        }
    });

    routesTableBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-route')) {
            const row = event.target.closest('tr');
            row.remove();
            alert('Rota excluída com sucesso!');
        }

        if (event.target.classList.contains('edit-route')) {
            const row = event.target.closest('tr');
            const routeName = row.querySelector('.route-name');
            const newName = prompt('Editar nome da rota:', routeName.textContent);

            if (newName) {
                routeName.textContent = newName;
                alert('Rota editada com sucesso!');
            }
        }
    });

    routesTableBody.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON' && event.target.classList.contains('edit-route')) {
            const row = event.target.closest('tr');
            const routeNameCell = row.cells[0];
            const departureTimeCell = row.cells[1];
            const arrivalTimeCell = row.cells[2];

            const newRouteName = prompt('Editar nome da rota:', routeNameCell.textContent);
            const newDepartureTime = prompt('Editar horário de partida:', departureTimeCell.textContent);
            const newArrivalTime = prompt('Editar horário de chegada:', arrivalTimeCell.textContent);

            if (newRouteName && newDepartureTime && newArrivalTime) {
                routeNameCell.textContent = newRouteName;
                departureTimeCell.textContent = newDepartureTime;
                arrivalTimeCell.textContent = newArrivalTime;

                // Update localStorage
                const savedRoutes = JSON.parse(localStorage.getItem('busRoutes')) || [];
                const routeIndex = Array.from(routesTableBody.rows).indexOf(row);
                savedRoutes[routeIndex] = {
                    routeName: newRouteName,
                    departureTime: newDepartureTime,
                    arrivalTime: newArrivalTime
                };
                localStorage.setItem('busRoutes', JSON.stringify(savedRoutes));
            }
        }
    });
});