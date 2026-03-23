// ── i18n ────────────────────────────────────────────────────────────────────
// v1.4 - fix school holiday calendar coloring
const TRANSLATIONS = {
    en: {
        title: 'Vacation Planner',
        loading: 'Loading...',
        publicHolidays: 'Public Holidays',
        schoolHolidays: '🎒 School Holidays',
        bridgeSuggestions: '💡 Bridge Day Suggestions',
        vacationPlan: '🏖️ Optimal Vacation Plan (28 + 7 Days)',
        noteWeekends: '💡 Note: Weekends and public holidays are not counted as vacation days (except for the 14 consecutive main vacation)',
        schedule: '📅 Recommended Vacation Schedule',
        mainVacation: 'Main Vacation',
        winterWeek: 'Winter Week',
        bridge: 'Bridge',
        totalDays: 'total days',
        workDays: 'work days',
        calendarDays: 'calendar days',
        workDay: 'work day',
        dayBreak: '-day break',
        takeOff: 'Take',
        off: 'off',
        workDaysUsed: 'Work Days Used',
        totalDaysOff: 'Total Days Off',
        daysSaved: 'Days Saved',
        efficiency: 'Efficiency',
        months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
        days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
        schoolBreaks: {
            'Autumn Break': 'Autumn Break',
            'Christmas Break': 'Christmas Break',
            'Winter Break': 'Winter Break',
            'Spring Break': 'Spring Break',
            'Summer Break': 'Summer Break',
        }
    },
    ru: {
        title: 'Планировщик отпуска — Эстония',
        loading: 'Загрузка...',
        publicHolidays: 'Государственные праздники',
        schoolHolidays: '🎒 Школьные каникулы',
        bridgeSuggestions: '💡 Мостовые дни',
        vacationPlan: '🏖️ Оптимальный план отпуска (28 + 7 дней)',
        noteWeekends: '💡 Примечание: выходные и праздники не считаются отпускными днями (кроме 14 последовательных дней основного отпуска)',
        schedule: '📅 Рекомендуемый график отпуска',
        mainVacation: 'Основной отпуск',
        winterWeek: 'Зимняя неделя',
        bridge: 'Мост',
        totalDays: 'всего дней',
        workDays: 'рабочих дней',
        calendarDays: 'календарных дней',
        workDay: 'рабочий день',
        dayBreak: '-дневный перерыв',
        takeOff: 'Взять',
        off: 'выходной',
        workDaysUsed: 'Использовано рабочих дней',
        totalDaysOff: 'Всего выходных дней',
        daysSaved: 'Сэкономлено дней',
        efficiency: 'Эффективность',
        months: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
        days: ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],
        schoolBreaks: {
            'Autumn Break': 'Осенние каникулы',
            'Christmas Break': 'Рождественские каникулы',
            'Winter Break': 'Зимние каникулы',
            'Spring Break': 'Весенние каникулы',
            'Summer Break': 'Летние каникулы',
        }
    }
};

let currentLang = 'en';
let currentYear = new Date().getFullYear();

function t(key) {
    return TRANSLATIONS[currentLang][key] || TRANSLATIONS['en'][key] || key;
}

function setLang(lang) {
    currentLang = lang;
    document.getElementById('langEN').classList.toggle('active', lang === 'en');
    document.getElementById('langRU').classList.toggle('active', lang === 'ru');
    document.documentElement.lang = lang;
    // Update static i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    // Reload content in new language
    loadHolidays();
}

function setYear(which) {
    const now = new Date().getFullYear();
    currentYear = which === 'current' ? now : now + 1;
    document.getElementById('yearCurrent').classList.toggle('active', which === 'current');
    document.getElementById('yearNext').classList.toggle('active', which === 'next');
    loadHolidays();
}

// ── Shared calendar tooltip (created once) ────────────────────────────────
const calTooltip = document.createElement('div');
calTooltip.className = 'cal-tooltip';
document.body.appendChild(calTooltip);

function showCalTooltip(e, text) {
    calTooltip.textContent = text;
    calTooltip.classList.add('visible');
    moveCalTooltip(e);
}
function moveCalTooltip(e) {
    const x = e.clientX + 14;
    const y = e.clientY - 40;
    const maxX = window.innerWidth - calTooltip.offsetWidth - 8;
    calTooltip.style.left = Math.min(x, maxX) + 'px';
    calTooltip.style.top = Math.max(y, 8) + 'px';
}
function hideCalTooltip() { calTooltip.classList.remove('visible'); }

// ── DOM refs ─────────────────────────────────────────────────────────────────
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const results = document.getElementById('results');
const calendar = document.getElementById('calendar');
const bridgeDays = document.getElementById('bridgeDays');
const schoolHolidaysSection = document.getElementById('schoolHolidays');
const vacationPlannerSection = document.getElementById('vacationPlanner');

// ── Init year buttons ─────────────────────────────────────────────────────────
(function initYearButtons() {
    const now = new Date().getFullYear();
    document.getElementById('yearCurrent').textContent = now;
    document.getElementById('yearNext').textContent = now + 1;
})();

// Auto-load on page ready
window.addEventListener('DOMContentLoaded', loadHolidays);

// ── Main load ─────────────────────────────────────────────────────────────────
async function loadHolidays() {
    hideError();
    showLoading();
    results.innerHTML = '';
    bridgeDays.innerHTML = '';
    schoolHolidaysSection.innerHTML = '';
    vacationPlannerSection.innerHTML = '';
    calendar.innerHTML = '';

    try {
        const publicHolidays = getEstonianPublicHolidays(currentYear);
        const schoolHolidays = getEstonianSchoolHolidays(currentYear);

        hideLoading();
        displayHolidays(publicHolidays);
        displayCalendar(publicHolidays, schoolHolidays, currentYear);
        displayBridgeDays(publicHolidays, currentYear);
        displaySchoolHolidays(schoolHolidays);
        displayVacationPlanner(publicHolidays, schoolHolidays, currentYear);
    } catch (err) {
        hideLoading();
        showError('Failed to load holidays. Please try again.');
        console.error(err);
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function showLoading() { loading.classList.remove('hidden'); }
function hideLoading() { loading.classList.add('hidden'); }
function showError(msg) { error.textContent = msg; error.classList.remove('hidden'); }
function hideError() { error.classList.add('hidden'); }

function isWeekend(date) { const d = date.getDay(); return d === 0 || d === 6; }

function isHolidayDate(date, holidayDates) {
    return holidayDates.has(date.getTime());
}

function countWorkDays(start, end, holidayDates) {
    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
        if (!isWeekend(cur) && !holidayDates.has(cur.getTime())) count++;
        cur.setDate(cur.getDate() + 1);
    }
    return count;
}

function countHolidaysInPeriod(start, end, holidayDates) {
    let count = 0;
    const cur = new Date(start);
    while (cur <= end) { if (holidayDates.has(cur.getTime())) count++; cur.setDate(cur.getDate() + 1); }
    return count;
}

function countWeekendsInPeriod(start, end) {
    let count = 0;
    const cur = new Date(start);
    while (cur <= end) { if (isWeekend(cur)) count++; cur.setDate(cur.getDate() + 1); }
    return count;
}

function isInPeriod(date, period) { return date >= period.start && date <= period.end; }

function formatDate(date) {
    return date.toLocaleDateString(currentLang === 'ru' ? 'ru-RU' : 'en-GB', { month: 'short', day: 'numeric' });
}

function formatDateRange(start, end) {
    return `${formatDate(start)} – ${formatDate(end)}`;
}

function scrollToCalendarDate(startDate, endDate) {
    calendar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
        document.querySelectorAll('.day-cell.highlight').forEach(c => c.classList.remove('highlight'));
        const cur = new Date(startDate);
        while (cur <= endDate) {
            document.querySelectorAll('.day-cell').forEach(cell => {
                if (cell.classList.contains('empty')) return;
                const monthEl = cell.closest('.month');
                if (!monthEl) return;
                const monthIdx = t('months').indexOf(monthEl.querySelector('.month-header').textContent);
                if (monthIdx === cur.getMonth() && parseInt(cell.textContent) === cur.getDate()) {
                    cell.classList.add('highlight');
                }
            });
            cur.setDate(cur.getDate() + 1);
        }
    }, 500);
}

// ── Display: Public Holidays list ─────────────────────────────────────────────
function displayHolidays(holidays) {
    if (!holidays.length) { results.innerHTML = '<p>No holidays found.</p>'; return; }

    const headerContainer = document.createElement('div');
    headerContainer.className = 'list-header';

    const left = document.createElement('div');
    left.style.display = 'flex';
    left.style.alignItems = 'center';
    left.style.gap = '10px';

    const icon = document.createElement('span');
    icon.textContent = '▼';
    icon.className = 'list-dropdown-icon rotated';

    const h2 = document.createElement('h2');
    h2.textContent = `${t('publicHolidays')} ${currentYear} — ${holidays.length}`;
    h2.style.margin = '0';

    left.appendChild(icon);
    left.appendChild(h2);
    headerContainer.appendChild(left);
    results.appendChild(headerContainer);

    const listContainer = document.createElement('div');
    listContainer.className = 'holiday-list-container';
    listContainer.style.maxHeight = '0';
    listContainer.style.overflow = 'hidden';
    listContainer.style.transition = 'max-height 0.3s ease-out';

    let expanded = false;
    headerContainer.addEventListener('click', () => {
        expanded = !expanded;
        listContainer.style.maxHeight = expanded ? '10000px' : '0';
        icon.classList.toggle('rotated', !expanded);
    });

    holidays.forEach(holiday => {
        const card = document.createElement('div');
        card.className = 'holiday-card-compact';
        const date = new Date(holiday.date);
        card.innerHTML = `
            <div class="holiday-date-compact">${formatDate(date)}</div>
            <div class="holiday-name-compact">${currentLang === 'ru' ? (holiday.nameRu || holiday.name) : (holiday.localName || holiday.name)}</div>
        `;
        listContainer.appendChild(card);
    });

    results.appendChild(listContainer);
}

// ── Display: Calendar ─────────────────────────────────────────────────────────
function displayCalendar(holidays, schoolHolidays, year) {
    calendar.innerHTML = '';

    // Color legend
    const legend = document.createElement('div');
    legend.className = 'calendar-legend';
    const legendItems = [
        { cls: 'holiday',        label: currentLang === 'ru' ? '🔴 Государственный праздник — нерабочий день' : '🔴 Public holiday — day off work' },
        { cls: 'school-holiday', label: currentLang === 'ru' ? '🟡 Школьные каникулы'                         : '🟡 School holiday' },
    ];
    legendItems.forEach(({ cls, label }) => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `<span class="legend-dot ${cls}"></span><span class="legend-label">${label}</span>`;
        legend.appendChild(item);
    });
    calendar.appendChild(legend);

    const holidayMap = {};
    holidays.forEach(h => { holidayMap[h.date] = h; });
    const holidayDatesSet = new Set(holidays.map(h => h.date));

    const schoolRanges = (schoolHolidays || []).map(sh => ({
        start: parseLocalDate(sh.startDate),
        end: parseLocalDate(sh.endDate),
        name: sh.name.find(n => n.language === (currentLang === 'ru' ? 'RU' : 'EN'))?.text
            || sh.name[0]?.text || 'School Holiday'
    }));

    const months = t('months');
    const dayNames = t('days');

    const monthsGrid = document.createElement('div');
    monthsGrid.className = 'months-grid';
    calendar.appendChild(monthsGrid);

    for (let month = 0; month < 12; month++) {
        const monthDiv = document.createElement('div');
        monthDiv.className = 'month';

        const mh = document.createElement('div');
        mh.className = 'month-header';
        mh.textContent = months[month];
        monthDiv.appendChild(mh);

        const grid = document.createElement('div');
        grid.className = 'days-grid';

        dayNames.forEach(d => {
            const dh = document.createElement('div');
            dh.className = 'day-header';
            dh.textContent = d;
            grid.appendChild(dh);
        });

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

        for (let i = 0; i < startOffset; i++) {
            const e = document.createElement('div');
            e.className = 'day-cell empty';
            grid.appendChild(e);
        }

        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const curDate = new Date(year, month, day);
            const cell = document.createElement('div');
            cell.className = 'day-cell';
            if (isWeekend(curDate)) cell.classList.add('weekend');

            // Highlight today
            const today = new Date();
            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                cell.classList.add('today');
            }

            let tooltipText = null;

            const schoolRange = schoolRanges.find(r => curDate >= r.start && curDate <= r.end);
            if (schoolRange) {
                cell.classList.add('school-holiday');
                tooltipText = schoolRange.name;
            }

            if (holidayDatesSet.has(dateStr)) {
                const h = holidayMap[dateStr];
                cell.classList.remove('school-holiday');
                cell.classList.add('holiday');
                const shortenedTypes = ['Authorities','Optional','Observance','Bank','School'];
                const isShortened = h.types && h.types.some(tp => shortenedTypes.includes(tp));
                if (isShortened || (h.global === false && h.types && !h.types.includes('Public'))) {
                    cell.classList.add('shortened');
                }
                tooltipText = currentLang === 'ru' ? (h.nameRu || h.name) : (h.localName || h.name);
            }

            if (tooltipText) {
                cell.addEventListener('mouseenter', e => showCalTooltip(e, tooltipText));
                cell.addEventListener('mousemove', moveCalTooltip);
                cell.addEventListener('mouseleave', hideCalTooltip);
            }

            cell.textContent = day;
            grid.appendChild(cell);
        }

        monthDiv.appendChild(grid);
        monthsGrid.appendChild(monthDiv);
    }
}

// ── Collapsible section wrapper ───────────────────────────────────────────────
function makeCollapsible(containerEl, titleText, startCollapsed = false) {
    const wrapper = document.createElement('div');
    wrapper.className = 'collapsible-wrapper';

    const header = document.createElement('div');
    header.className = 'collapsible-header';

    const icon = document.createElement('span');
    icon.className = 'collapsible-icon';
    icon.textContent = '▶';

    const title = document.createElement('span');
    title.textContent = titleText;

    header.appendChild(icon);
    header.appendChild(title);

    const body = document.createElement('div');
    body.className = 'collapsible-body';
    body.appendChild(containerEl);

    if (!startCollapsed) {
        header.classList.add('is-open');
        body.classList.add('is-open');
    }

    header.addEventListener('click', () => {
        const opening = !body.classList.contains('is-open');
        body.classList.toggle('is-open', opening);
        header.classList.toggle('is-open', opening);
    });

    wrapper.appendChild(header);
    wrapper.appendChild(body);
    return wrapper;
}

// ── Display: Bridge Days ──────────────────────────────────────────────────────
function displayBridgeDays(holidays, year) {
    bridgeDays.innerHTML = '';
    const suggestions = findBridgeDays(holidays, year);
    if (!suggestions.length) return;

    const container = document.createElement('div');
    container.className = 'bridge-container';

    suggestions.forEach(s => {
        const card = document.createElement('div');
        card.className = 'bridge-card';
        card.innerHTML = `
            <div class="bridge-icon">🌴</div>
            <div class="bridge-content">
                <div class="bridge-title">${s.message}</div>
                <div class="bridge-details">${s.details}</div>
            </div>`;
        container.appendChild(card);
    });

    bridgeDays.appendChild(makeCollapsible(container, t('bridgeSuggestions'), true));
}

function findBridgeDays(holidays, year) {
    const suggestions = [];
    const holidayDates = holidays.map(h => parseLocalDate(h.date));
    holidayDates.sort((a, b) => a - b);

    holidayDates.forEach(hd => {
        const dow = hd.getDay();
        if (dow === 2) { // Tuesday → take Monday
            const mon = new Date(hd); mon.setDate(mon.getDate() - 1);
            if (!isWeekend(mon) && !holidayDates.some(d => d.getTime() === mon.getTime())) {
                suggestions.push({
                    message: `${t('takeOff')} ${formatDate(mon)} ${t('off')} → 4-day break`,
                    details: formatDateRange(new Date(mon.getTime() - 86400000 * 2), hd)
                });
            }
        }
        if (dow === 4) { // Thursday → take Friday
            const fri = new Date(hd); fri.setDate(fri.getDate() + 1);
            if (!isWeekend(fri) && !holidayDates.some(d => d.getTime() === fri.getTime())) {
                suggestions.push({
                    message: `${t('takeOff')} ${formatDate(fri)} ${t('off')} → 4-day break`,
                    details: formatDateRange(hd, new Date(fri.getTime() + 86400000 * 2))
                });
            }
        }
    });

    return [...new Map(suggestions.map(s => [s.message, s])).values()].slice(0, 5);
}

// ── Display: School Holidays ──────────────────────────────────────────────────
function displaySchoolHolidays(schoolHolidays) {
    schoolHolidaysSection.innerHTML = '';
    if (!schoolHolidays?.length) return;

    const container = document.createElement('div');
    container.className = 'school-holidays-container';

    schoolHolidays.forEach(sh => {
        const start = parseLocalDate(sh.startDate);
        const end = parseLocalDate(sh.endDate);
        const duration = Math.ceil((end - start) / 86400000) + 1;
        const nameObj = sh.name.find(n => n.language === (currentLang === 'ru' ? 'RU' : 'EN')) || sh.name[0];
        const name = nameObj?.text || 'School Holiday';

        let emoji = '📚';
        const nl = name.toLowerCase();
        if (nl.includes('summer') || nl.includes('лет')) emoji = '☀️';
        else if (nl.includes('christmas') || nl.includes('winter') || nl.includes('рождест') || nl.includes('зим')) emoji = '🎄';
        else if (nl.includes('spring') || nl.includes('easter') || nl.includes('весен')) emoji = '🐰';
        else if (nl.includes('autumn') || nl.includes('осен')) emoji = '🍂';

        const card = document.createElement('div');
        card.className = 'school-holiday-card';
        card.innerHTML = `
            <div class="school-holiday-icon">${emoji}</div>
            <div class="school-holiday-content">
                <div class="school-holiday-title">${name}</div>
                <div class="school-holiday-details">${formatDateRange(start, end)} (${duration} ${t('totalDays')})</div>
            </div>`;
        container.appendChild(card);
    });

    schoolHolidaysSection.appendChild(makeCollapsible(container, t('schoolHolidays'), true));
}

// ── Display: Vacation Planner ─────────────────────────────────────────────────
function displayVacationPlanner(publicHolidays, schoolHolidays, year) {
    vacationPlannerSection.innerHTML = '';
    const plan = calculateOptimalVacation(publicHolidays, schoolHolidays, year);
    if (!plan) return;

    const container = document.createElement('div');
    container.className = 'vacation-planner-container';

    const note = document.createElement('p');
    note.className = 'vacation-note';
    note.textContent = t('noteWeekends');
    container.appendChild(note);

    const table = document.createElement('div');
    table.className = 'vacation-plan-table';

    const tableHeader = document.createElement('div');
    tableHeader.className = 'vacation-plan-header';
    tableHeader.textContent = t('schedule');
    table.appendChild(tableHeader);

    // Main vacation row
    const mainRow = makeVacationRow(
        t('mainVacation'),
        formatDateRange(plan.mainVacation.start, plan.mainVacation.end),
        `${plan.mainVacation.totalDays} ${t('totalDays')}`,
        `${plan.mainWorkDays} ${t('workDays')}`,
        'type-main',
        plan.mainVacation.start, plan.mainVacation.end
    );
    table.appendChild(mainRow);

    // Winter week row
    const ws = plan.winterWeek.start.toLocaleDateString(currentLang === 'ru' ? 'ru-RU' : 'en-GB', { weekday: 'short' });
    const we = plan.winterWeek.end.toLocaleDateString(currentLang === 'ru' ? 'ru-RU' : 'en-GB', { weekday: 'short' });
    const winterRow = makeVacationRow(
        t('winterWeek'),
        `${formatDateRange(plan.winterWeek.start, plan.winterWeek.end)} (${ws}–${we})`,
        `${plan.winterWeek.totalDays} ${t('totalDays')}`,
        `${plan.winterWorkDays} ${t('workDays')}`,
        'type-winter',
        plan.winterWeek.start, plan.winterWeek.end
    );
    table.appendChild(winterRow);

    // Bridge rows
    plan.flexibleDays.forEach((period, i) => {
        const vacText = period.workDays === 1
            ? `${t('takeOff')} ${formatDate(period.start)} ${t('off')}`
            : `${t('takeOff')} ${formatDateRange(period.start, period.end)} ${t('off')}`;
        const bridgeRow = makeVacationRow(
            `${t('bridge')} ${i + 1}`,
            vacText,
            `${period.totalDays}${t('dayBreak')}`,
            `${period.workDays} ${period.workDays === 1 ? t('workDay') : t('workDays')}`,
            'type-flexible',
            period.breakStart || period.start,
            period.breakEnd || period.end
        );
        table.appendChild(bridgeRow);
    });

    container.appendChild(table);

    const daysSaved = 35 - plan.totalVacationDays;
    const summary = document.createElement('div');
    summary.className = 'vacation-summary';
    summary.innerHTML = `
        <div class="summary-item"><span class="summary-value">${plan.totalVacationDays}</span><span class="summary-label">${t('workDaysUsed')}</span></div>
        <div class="summary-item"><span class="summary-value">${plan.totalCalendarDays}</span><span class="summary-label">${t('totalDaysOff')}</span></div>
        <div class="summary-item"><span class="summary-value">${daysSaved}</span><span class="summary-label">${t('daysSaved')}</span></div>
        <div class="summary-item"><span class="summary-value">${plan.efficiency}%</span><span class="summary-label">${t('efficiency')}</span></div>
    `;
    container.appendChild(summary);
    vacationPlannerSection.appendChild(makeCollapsible(container, t('vacationPlan'), true));
}

function makeVacationRow(label, dates, days, workDays, typeClass, scrollStart, scrollEnd) {
    const row = document.createElement('div');
    row.className = 'vacation-plan-row';
    row.innerHTML = `
        <div class="vacation-plan-label">${label}</div>
        <div class="vacation-plan-dates">${dates}</div>
        <div class="vacation-plan-days">${days}</div>
        <div class="vacation-plan-type ${typeClass}">${workDays}</div>
    `;
    row.querySelector('.vacation-plan-dates').addEventListener('click', () => {
        scrollToCalendarDate(scrollStart, scrollEnd);
    });
    return row;
}

// ── Vacation calculation ──────────────────────────────────────────────────────
function calculateOptimalVacation(publicHolidays, schoolHolidays, year) {
    const holidayDates = new Set(publicHolidays.map(h => parseLocalDate(h.date).getTime()));
    const mainVacation = findBest14DayPeriod(year, holidayDates);
    const winterWeek = findBestWinterWeek(year, holidayDates);
    const flexibleDays = findOptimalBridgeDays(year, holidayDates, mainVacation, winterWeek);

    const mainWorkDays = countWorkDays(mainVacation.start, mainVacation.end, holidayDates);
    const winterWorkDays = countWorkDays(winterWeek.start, winterWeek.end, holidayDates);
    const flexibleWorkDays = flexibleDays.reduce((s, p) => s + p.workDays, 0);
    const totalWorkDaysUsed = mainWorkDays + winterWorkDays + flexibleWorkDays;
    const totalCalendarDays = mainVacation.totalDays + winterWeek.totalDays +
        flexibleDays.reduce((s, p) => s + p.totalDays, 0);
    const efficiency = Math.round((totalCalendarDays / totalWorkDaysUsed) * 100);

    return { mainVacation, winterWeek, flexibleDays, totalVacationDays: totalWorkDaysUsed,
        totalCalendarDays, efficiency, mainWorkDays, winterWorkDays, flexibleWorkDays };
}

function findBest14DayPeriod(year, holidayDates) {
    let best = null, maxScore = -1;
    const ranges = [
        { start: 5, end: 7, priority: 3 },
        { start: 4, end: 8, priority: 2 },
        { start: 3, end: 9, priority: 1 }
    ];
    for (const range of ranges) {
        for (let month = range.start; month <= range.end; month++) {
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            for (let day = 1; day <= daysInMonth - 13; day++) {
                const start = new Date(year, month, day);
                const end = new Date(start); end.setDate(end.getDate() + 13);
                const workDays = countWorkDays(start, end, holidayDates);
                const score = (countHolidaysInPeriod(start, end, holidayDates) * 3 +
                    countWeekendsInPeriod(start, end) * 2 - workDays) * range.priority;
                if (score > maxScore && workDays <= 14) {
                    maxScore = score;
                    best = { start: new Date(start), end: new Date(end), totalDays: 14, workDays };
                }
            }
        }
    }
    return best || { start: new Date(year, 6, 1), end: new Date(year, 6, 14), totalDays: 14, workDays: 10 };
}

function findBestWinterWeek(year, holidayDates) {
    let best = null, maxScore = -1;
    [[11, year], [0, year + 1], [1, year + 1]].forEach(([month, y]) => {
        const days = new Date(y, month + 1, 0).getDate();
        for (let day = 1; day <= days - 6; day++) {
            const d = new Date(y, month, day);
            const dow = d.getDay();
            const monday = new Date(d);
            monday.setDate(monday.getDate() + (dow === 0 ? -6 : 1 - dow));
            const sunday = new Date(monday); sunday.setDate(sunday.getDate() + 6);
            const workDays = countWorkDays(monday, sunday, holidayDates);
            const score = countHolidaysInPeriod(monday, sunday, holidayDates) * 5 - workDays;
            if (score > maxScore) {
                maxScore = score;
                best = { start: new Date(monday), end: new Date(sunday), totalDays: 7, workDays };
            }
        }
    });
    if (!best) {
        const xmas = new Date(year, 11, 25);
        const dow = xmas.getDay();
        const monday = new Date(xmas); monday.setDate(monday.getDate() + (dow === 0 ? -6 : 1 - dow));
        const sunday = new Date(monday); sunday.setDate(sunday.getDate() + 6);
        best = { start: monday, end: sunday, totalDays: 7, workDays: countWorkDays(monday, sunday, holidayDates) };
    }
    return best;
}

function findOptimalBridgeDays(year, holidayDates, mainVacation, winterWeek) {
    const remaining = 14;
    const holidays = Array.from(holidayDates).map(ts => new Date(ts)).sort((a, b) => a - b);
    const opps = [];

    holidays.forEach(holiday => {
        const dow = holiday.getDay();
        if (isInPeriod(holiday, mainVacation) || isInPeriod(holiday, winterWeek)) return;

        const addOpp = (vacStart, vacEnd, breakStart, breakEnd, totalDays, workDays) => {
            if (!isInPeriod(vacStart, mainVacation) && !isInPeriod(vacStart, winterWeek))
                opps.push({ start: vacStart, end: vacEnd, breakStart, breakEnd, totalDays, workDays, score: totalDays / workDays });
        };

        if (dow === 4) { // Thu holiday → take Fri
            const fri = new Date(holiday); fri.setDate(fri.getDate() + 1);
            const sun = new Date(fri); sun.setDate(sun.getDate() + 2);
            if (!isWeekend(fri) && !holidayDates.has(fri.getTime())) addOpp(fri, fri, holiday, sun, 4, 1);
        }
        if (dow === 2) { // Tue holiday → take Mon
            const mon = new Date(holiday); mon.setDate(mon.getDate() - 1);
            const sat = new Date(mon); sat.setDate(sat.getDate() - 1);
            if (!isWeekend(mon) && !holidayDates.has(mon.getTime())) addOpp(mon, mon, sat, holiday, 4, 1);
        }
        if (dow === 5) { // Fri holiday → take Thu
            const thu = new Date(holiday); thu.setDate(thu.getDate() - 1);
            const sun = new Date(holiday); sun.setDate(sun.getDate() + 2);
            if (!isWeekend(thu) && !holidayDates.has(thu.getTime())) addOpp(thu, thu, thu, sun, 4, 1);
        }
        if (dow === 1) { // Mon holiday → take Fri before
            const fri = new Date(holiday); fri.setDate(fri.getDate() - 3);
            if (!isWeekend(fri) && !holidayDates.has(fri.getTime())) addOpp(fri, fri, fri, holiday, 4, 1);
        }

        // Gap between two holidays within 4 days
        for (let i = 1; i <= 4; i++) {
            const future = new Date(holiday); future.setDate(future.getDate() + i);
            if (!holidayDates.has(future.getTime())) continue;
            const gap = [];
            for (let j = 1; j < i; j++) {
                const g = new Date(holiday); g.setDate(g.getDate() + j);
                if (!isWeekend(g) && !holidayDates.has(g.getTime())) gap.push(g);
            }
            if (gap.length > 0 && gap.length <= 3) {
                let bs = new Date(holiday), be = new Date(future);
                while (isWeekend(new Date(bs.getTime() - 86400000)) || holidayDates.has(new Date(bs.getTime() - 86400000).getTime()))
                    bs.setDate(bs.getDate() - 1);
                while (isWeekend(new Date(be.getTime() + 86400000)) || holidayDates.has(new Date(be.getTime() + 86400000).getTime()))
                    be.setDate(be.getDate() + 1);
                const totalDays = Math.round((be - bs) / 86400000) + 1;
                const allOk = gap.every(d => !isInPeriod(d, mainVacation) && !isInPeriod(d, winterWeek));
                if (allOk && totalDays >= 5)
                    opps.push({ start: gap[0], end: gap[gap.length - 1], breakStart: bs, breakEnd: be, totalDays, workDays: gap.length, score: totalDays / gap.length });
            }
        }
    });

    opps.sort((a, b) => b.score - a.score);

    const selected = [];
    let used = 0;
    for (const opp of opps) {
        const overlaps = selected.some(s =>
            isInPeriod(opp.start, s) || isInPeriod(opp.end, s) ||
            isInPeriod(s.start, opp) || isInPeriod(s.end, opp));
        if (!overlaps && used + opp.workDays <= remaining) {
            selected.push(opp);
            used += opp.workDays;
        }
        if (used >= remaining) break;
    }

    // Fill remaining days with good-weather blocks
    if (used < remaining) {
        for (const month of [3, 4, 8, 9]) {
            if (used >= remaining) break;
            const daysLeft = remaining - used;
            const start = new Date(year, month, 1);
            const end = new Date(start); end.setDate(end.getDate() + daysLeft - 1);
            const overlaps = selected.some(s => isInPeriod(start, s) || isInPeriod(end, s))
                || isInPeriod(start, mainVacation) || isInPeriod(start, winterWeek);
            if (!overlaps) {
                const wds = countWorkDays(start, end, holidayDates);
                if (wds > 0 && wds <= daysLeft) {
                    selected.push({ start, end, breakStart: start, breakEnd: end, totalDays: daysLeft, workDays: wds, score: daysLeft / wds });
                    used += wds;
                }
            }
        }
    }

    return selected;
}

// ── Estonian public holidays (official, from riigipühad.ee) ──────────────────
// Fixed holidays + Easter-based holidays calculated per year
// Names: ET (Estonian), EN (English), RU (Russian)
// Types: Riigipüha = public holiday, Rahvuspüha = national holiday

function easterDate(year) {
    // Anonymous Gregorian algorithm
    const a = year % 19, b = Math.floor(year / 100), c = year % 100;
    const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month, day);
}

function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function parseLocalDate(str) {
    // Parse YYYY-MM-DD as local time (not UTC) to avoid timezone shift
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function toDateStr(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getEstonianPublicHolidays(year) {
    const easter = easterDate(year);
    const goodFriday = addDays(easter, -2);
    const whitSunday = addDays(easter, 49);

    const holidays = [
        { date: `${year}-01-01`, et: 'Uusaasta',                                          en: "New Year's Day",          ru: 'Новый год',                    type: 'Riigipüha' },
        { date: `${year}-02-24`, et: 'Iseseisvuspäev, Eesti Vabariigi aastapäev',         en: 'Independence Day',        ru: 'День независимости',           type: 'Rahvuspüha' },
        { date: toDateStr(goodFriday),  et: 'Suur reede',                                 en: 'Good Friday',             ru: 'Страстная пятница',            type: 'Riigipüha' },
        { date: toDateStr(easter),      et: 'Ülestõusmispühade 1. püha',                  en: 'Easter Sunday',           ru: 'Пасха',                        type: 'Riigipüha' },
        { date: `${year}-05-01`, et: 'Kevadpüha',                                         en: 'Spring Day',              ru: 'День весны',                   type: 'Riigipüha' },
        { date: toDateStr(whitSunday),  et: 'Nelipühade 1. püha',                         en: 'Whit Sunday',             ru: 'День Святой Троицы',           type: 'Riigipüha' },
        { date: `${year}-06-23`, et: 'Võidupüha',                                         en: 'Victory Day',             ru: 'День победы',                  type: 'Rahvuspüha' },
        { date: `${year}-06-24`, et: 'Jaanipäev',                                         en: 'Midsummer Day',           ru: 'Иванов день',                  type: 'Riigipüha' },
        { date: `${year}-08-20`, et: 'Taasiseseisvumispäev',                              en: 'Day of Restoration of Independence', ru: 'День восстановления независимости', type: 'Riigipüha' },
        { date: `${year}-12-24`, et: 'Jõululaupäev',                                      en: 'Christmas Eve',           ru: 'Рождественский сочельник',     type: 'Riigipüha' },
        { date: `${year}-12-25`, et: 'Esimene jõulupüha',                                 en: 'Christmas Day',           ru: 'Рождество',                    type: 'Riigipüha' },
        { date: `${year}-12-26`, et: 'Teine jõulupüha',                                   en: 'Boxing Day',              ru: 'Второй день Рождества',        type: 'Riigipüha' },
    ];

    // Sort by date
    holidays.sort((a, b) => a.date.localeCompare(b.date));

    // Return in a shape compatible with the rest of the app
    return holidays.map(h => ({
        date: h.date,
        localName: h.et,
        name: h.en,
        nameRu: h.ru,
        types: [h.type],
        global: true,
    }));
}

// ── Estonian school holidays (official, from Haridus- ja Teadusministeerium) ─
function getEstonianSchoolHolidays(year) {
    const schedule = {
        2024: [
            { et: 'Jõuluvaheaeg',    en: 'Christmas Break', ru: 'Рождественские каникулы', start: '2023-12-27', end: '2024-01-07' },
            { et: 'Talvine vaheaeg', en: 'Winter Break',    ru: 'Зимние каникулы',          start: '2024-02-19', end: '2024-02-25' },
            { et: 'Kevadvaheaeg',    en: 'Spring Break',    ru: 'Весенние каникулы',         start: '2024-04-22', end: '2024-04-28' },
            { et: 'Suvevaheaeg',     en: 'Summer Break',    ru: 'Летние каникулы',           start: '2024-06-10', end: '2024-08-31' },
            { et: 'Sügisvaheaeg',    en: 'Autumn Break',    ru: 'Осенние каникулы',          start: '2024-10-21', end: '2024-10-27' },
            { et: 'Jõuluvaheaeg',    en: 'Christmas Break', ru: 'Рождественские каникулы',   start: '2024-12-23', end: '2025-01-05' },
        ],
        2025: [
            { et: 'Jõuluvaheaeg',    en: 'Christmas Break', ru: 'Рождественские каникулы',   start: '2024-12-23', end: '2025-01-05' },
            { et: 'Talvine vaheaeg', en: 'Winter Break',    ru: 'Зимние каникулы',            start: '2025-02-24', end: '2025-03-02' },
            { et: 'Kevadvaheaeg',    en: 'Spring Break',    ru: 'Весенние каникулы',          start: '2025-04-14', end: '2025-04-20' },
            { et: 'Suvevaheaeg',     en: 'Summer Break',    ru: 'Летние каникулы',            start: '2025-06-10', end: '2025-08-31' },
            { et: 'Sügisvaheaeg',    en: 'Autumn Break',    ru: 'Осенние каникулы',           start: '2025-10-20', end: '2025-10-26' },
            { et: 'Jõuluvaheaeg',    en: 'Christmas Break', ru: 'Рождественские каникулы',    start: '2025-12-22', end: '2026-01-11' },
        ],
        2026: [
            { et: 'Jõuluvaheaeg',    en: 'Christmas Break', ru: 'Рождественские каникулы',   start: '2025-12-22', end: '2026-01-11' },
            { et: 'Talvine vaheaeg', en: 'Winter Break',    ru: 'Зимние каникулы',            start: '2026-02-23', end: '2026-03-01' },
            { et: 'Kevadvaheaeg',    en: 'Spring Break',    ru: 'Весенние каникулы',          start: '2026-04-13', end: '2026-04-19' },
            { et: 'Suvevaheaeg',     en: 'Summer Break',    ru: 'Летние каникулы',            start: '2026-06-17', end: '2026-08-31' },
            { et: 'Sügisvaheaeg',    en: 'Autumn Break',    ru: 'Осенние каникулы',           start: '2026-10-26', end: '2026-11-01' },
            { et: 'Jõuluvaheaeg',    en: 'Christmas Break', ru: 'Рождественские каникулы',    start: '2026-12-21', end: '2027-01-03' },
        ],
        2027: [
            { et: 'Jõuluvaheaeg',    en: 'Christmas Break', ru: 'Рождественские каникулы',   start: '2026-12-21', end: '2027-01-03' },
            { et: 'Talvine vaheaeg', en: 'Winter Break',    ru: 'Зимние каникулы',            start: '2027-02-22', end: '2027-02-28' },
            { et: 'Kevadvaheaeg',    en: 'Spring Break',    ru: 'Весенние каникулы',          start: '2027-04-12', end: '2027-04-18' },
            { et: 'Suvevaheaeg',     en: 'Summer Break',    ru: 'Летние каникулы',            start: '2027-06-09', end: '2027-08-31' },
        ],
    };

    const seen = new Set();
    return (schedule[year] || [])
        .filter(e => { const k = e.start + e.end; if (seen.has(k)) return false; seen.add(k); return true; })
        .map(e => ({
            startDate: e.start,
            endDate: e.end,
            name: [
                { language: 'ET', text: e.et },
                { language: 'EN', text: e.en },
                { language: 'RU', text: e.ru },
            ]
        }));
}
