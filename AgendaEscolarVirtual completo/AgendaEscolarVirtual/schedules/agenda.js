const now = new Date();
let currentDate = new Date(now.getFullYear(), now.getMonth(), 1);
let selectedDate = null;
const calendarGrid = document.getElementById('calendarGrid');
const currentYearMonth = document.getElementById('currentYearMonth');
const dayModal = document.getElementById('dayModal');
const modalDate = document.getElementById('modalDate');
const eventsList = document.getElementById('eventsList');
const eventInput = document.getElementById('eventInput');
const STORAGE_KEY = 'aev-calendar-events';

function getStoredEvents() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
}

function saveStoredEvents(events) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getDayName(index) {
    const names = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return names[index];
}

function getMonthName(index) {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return months[index];
}

function renderCalendar() {
    calendarGrid.innerHTML = '';
    currentYearMonth.textContent = `${getMonthName(currentDate.getMonth())} ${currentDate.getFullYear()}`;

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startingWeekday = firstDayOfMonth.getDay();
    const monthLength = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    // Cabeçalhos de dias
    calendarGrid.appendChild(createHeaderCell(''));
    for (let i = 0; i < 7; i++) {
        calendarGrid.appendChild(createHeaderCell(getDayName(i)));
    }

    const totalCells = 5 * 8; // 5 semanas x 8 colunas (mesclando coluna do mês + 7 dias)
    let dayCounter = 1;
    for (let week = 0; week < 5; week++) {
        const monthLabel = createMonthLabelCell(currentDate);
        calendarGrid.appendChild(monthLabel);

        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const cellIndex = week * 7 + dayIndex;
            const cell = document.createElement('div');
            cell.className = 'calendar-cell';

            const dayNumber = cellIndex - startingWeekday + 1;
            if (dayNumber <= 0 || dayNumber > monthLength) {
                cell.classList.add('empty');
                cell.innerHTML = '<span class="day-number"></span>';
            } else {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
                const key = formatDateKey(date);
                cell.dataset.date = key;

                const dayLabel = document.createElement('span');
                dayLabel.className = 'day-number';
                dayLabel.textContent = dayNumber;
                cell.appendChild(dayLabel);

                if (isToday(date)) {
                    cell.classList.add('today');
                }
                if (dayIndex === 0 || dayIndex === 6) {
                    cell.classList.add('weekend');
                }
                if (hasEvents(key)) {
                    cell.classList.add('has-event');
                }
                cell.addEventListener('click', () => openDayModal(date));
            }
            calendarGrid.appendChild(cell);
        }
    }
}

function createHeaderCell(text) {
    const header = document.createElement('div');
    header.className = 'day-header';
    header.textContent = text;
    return header;
}

function createMonthLabelCell(date) {
    const monthCell = document.createElement('div');
    monthCell.className = 'month-label';
    monthCell.innerHTML = `<div><span class="month-text">${getMonthName(date.getMonth())}</span><div class="month-arrow">${date.getFullYear()}</div></div>`;
    return monthCell;
}

function isToday(date) {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
}

function hasEvents(dateKey) {
    const events = getStoredEvents();
    return Array.isArray(events[dateKey]) && events[dateKey].length > 0;
}

function changeMonth(offset) {
    currentDate.setMonth(currentDate.getMonth() + offset);
    renderCalendar();
}

function openDayModal(date) {
    selectedDate = date;
    const dateLabel = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getFullYear()}`;
    modalDate.textContent = `Detalhes de ${dateLabel}`;
    renderEventsList();
    dayModal.style.display = 'block';
}

function closeDayModal() {
    dayModal.style.display = 'none';
    eventInput.value = '';
}

function renderEventsList() {
    const events = getStoredEvents();
    const key = formatDateKey(selectedDate);
    const dayEvents = events[key] || [];
    eventsList.innerHTML = '';

    if (!dayEvents.length) {
        const empty = document.createElement('p');
        empty.className = 'no-events';
        empty.textContent = 'Nenhum evento para este dia.';
        eventsList.appendChild(empty);
        return;
    }

    dayEvents.forEach((event, index) => {
        const item = document.createElement('div');
        item.className = 'event-item';
        item.innerHTML = `
            <span>${event}</span>
            <span class="delete-event" onclick="deleteEvent(${index})">×</span>
        `;
        eventsList.appendChild(item);
    });
}

function addEvent() {
    const description = eventInput.value.trim();
    if (!description) return;

    const events = getStoredEvents();
    const key = formatDateKey(selectedDate);
    if (!events[key]) events[key] = [];
    events[key].push(description);
    saveStoredEvents(events);
    eventInput.value = '';
    renderEventsList();
    renderCalendar();
}

function deleteEvent(index) {
    const events = getStoredEvents();
    const key = formatDateKey(selectedDate);
    if (!events[key]) return;
    events[key].splice(index, 1);
    if (!events[key].length) delete events[key];
    saveStoredEvents(events);
    renderEventsList();
    renderCalendar();
}

function filterStudents() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const items = document.querySelectorAll('.student-item');
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(search) ? 'flex' : 'none';
    });
}

function scrollStudents(direction) {
    const list = document.getElementById('studentsList');
    const scrollAmount = 120;
    list.scrollBy({ top: direction * scrollAmount, behavior: 'smooth' });
}

function switchTab(tab) {
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => btn.classList.toggle('active', btn.textContent.toLowerCase().includes(tab)));
    if (tab === 'calendario') {
        renderCalendar();
    }
}

window.addEventListener('click', (event) => {
    if (event.target === dayModal) {
        closeDayModal();
    }
});

renderCalendar();
