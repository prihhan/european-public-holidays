const europeanCountries = [
    { code: 'AT', name: 'Austria' },
    { code: 'BE', name: 'Belgium' },
    { code: 'BG', name: 'Bulgaria' },
    { code: 'HR', name: 'Croatia' },
    { code: 'CY', name: 'Cyprus' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'DK', name: 'Denmark' },
    { code: 'EE', name: 'Estonia' },
    { code: 'FI', name: 'Finland' },
    { code: 'FR', name: 'France' },
    { code: 'DE', name: 'Germany' },
    { code: 'GR', name: 'Greece' },
    { code: 'HU', name: 'Hungary' },
    { code: 'IE', name: 'Ireland' },
    { code: 'IT', name: 'Italy' },
    { code: 'LV', name: 'Latvia' },
    { code: 'LT', name: 'Lithuania' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'MT', name: 'Malta' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'PL', name: 'Poland' },
    { code: 'PT', name: 'Portugal' },
    { code: 'RO', name: 'Romania' },
    { code: 'SK', name: 'Slovakia' },
    { code: 'SI', name: 'Slovenia' },
    { code: 'ES', name: 'Spain' },
    { code: 'SE', name: 'Sweden' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'NO', name: 'Norway' },
    { code: 'CH', name: 'Switzerland' }
];

const yearInput = document.getElementById('yearInput');
const loadBtn = document.getElementById('loadBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const results = document.getElementById('results');
const calendar = document.getElementById('calendar');
const customSelect = document.getElementById('customSelect');
const selectTrigger = customSelect.querySelector('.select-trigger');
const countryOptions = document.getElementById('countryOptions');
const bridgeDays = document.getElementById('bridgeDays');
const schoolHolidaysSection = document.getElementById('schoolHolidays');
const vacationPlannerSection = document.getElementById('vacationPlanner');

let currentHolidays = [];
let currentCountryCode = '';
let currentYear = '';
let selectedCountry = null;
let searchTimeout = null;
let searchQuery = '';

// Populate custom dropdown
europeanCountries.forEach(country => {
    const option = document.createElement('div');
    option.className = 'option';
    option.setAttribute('data-value', country.code);
    
    const flag = document.createElement('img');
    flag.src = `https://flagcdn.com/w40/${country.code.toLowerCase()}.png`;
    flag.alt = `${country.name} flag`;
    
    const name = document.createElement('span');
    name.textContent = country.name;
    
    option.appendChild(flag);
    option.appendChild(name);
    
    option.addEventListener('click', () => {
        selectedCountry = country;
        currentCountryCode = country.code;
        
        // Update trigger display
        selectTrigger.innerHTML = `
            <span style="display: flex; align-items: center; gap: 10px;">
                <img src="https://flagcdn.com/w40/${country.code.toLowerCase()}.png" 
                     alt="${country.name} flag" 
                     style="width: 24px; height: 18px; border-radius: 2px;">
                ${country.name}
            </span>
            <div class="arrow">▼</div>
        `;
        
        // Update selected state
        document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        
        // Close dropdown
        customSelect.classList.remove('open');
    });
    
    countryOptions.appendChild(option);
});

// Toggle dropdown
selectTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    customSelect.classList.toggle('open');
});

// Close dropdown when clicking outside
document.addEventListener('click', () => {
    customSelect.classList.remove('open');
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    // Only handle keyboard when dropdown is open or focused
    if (!customSelect.classList.contains('open') && document.activeElement !== selectTrigger) {
        return;
    }

    const key = e.key.toLowerCase();
    
    // Open dropdown on Enter or Space when trigger is focused
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement === selectTrigger) {
        e.preventDefault();
        customSelect.classList.toggle('open');
        return;
    }

    // Close on Escape
    if (e.key === 'Escape') {
        customSelect.classList.remove('open');
        return;
    }

    // Type-ahead search
    if (key.length === 1 && key.match(/[a-z]/i)) {
        e.preventDefault();
        
        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // Add to search query
        searchQuery += key;
        
        // Find matching country
        const matchingCountry = europeanCountries.find(country => 
            country.name.toLowerCase().startsWith(searchQuery)
        );
        
        if (matchingCountry) {
            // Highlight the matching option
            const options = countryOptions.querySelectorAll('.option');
            options.forEach(opt => {
                if (opt.getAttribute('data-value') === matchingCountry.code) {
                    opt.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                    opt.style.background = '#e3f2fd';
                    setTimeout(() => {
                        opt.style.background = '';
                    }, 500);
                }
            });
        }
        
        // Reset search query after 1 second
        searchTimeout = setTimeout(() => {
            searchQuery = '';
        }, 1000);
    }

    // Arrow navigation
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        
        if (!customSelect.classList.contains('open')) {
            customSelect.classList.add('open');
            return;
        }

        const options = Array.from(countryOptions.querySelectorAll('.option'));
        const selectedOption = countryOptions.querySelector('.option.selected');
        let currentIndex = selectedOption ? options.indexOf(selectedOption) : -1;
        
        if (e.key === 'ArrowDown') {
            currentIndex = (currentIndex + 1) % options.length;
        } else {
            currentIndex = currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
        }
        
        options[currentIndex].click();
        options[currentIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
});

// Make trigger focusable
selectTrigger.setAttribute('tabindex', '0');

// Set current year as default
yearInput.value = new Date().getFullYear();

loadBtn.addEventListener('click', loadHolidays);

async function loadHolidays() {
    const countryCode = currentCountryCode;
    const year = yearInput.value;

    if (!countryCode) {
        showError('Please select a country');
        return;
    }

    if (!year || year < 2020 || year > 2030) {
        showError('Please enter a valid year (2020-2030)');
        return;
    }

    hideError();
    showLoading();
    results.innerHTML = '';
    bridgeDays.innerHTML = '';
    schoolHolidaysSection.innerHTML = '';

    try {
        // Fetch public holidays
        const publicHolidaysResponse = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
        
        if (!publicHolidaysResponse.ok) {
            throw new Error('Failed to fetch public holidays');
        }

        const publicHolidays = await publicHolidaysResponse.json();
        
        // Fetch school holidays - use official Estonian data for EE, OpenHolidays API for others
        let schoolHolidays = [];
        try {
            if (countryCode === 'EE') {
                schoolHolidays = getEstonianSchoolHolidays(parseInt(year));
            } else {
                const schoolHolidaysResponse = await fetch(`https://openholidaysapi.org/SchoolHolidays?countryIsoCode=${countryCode}&languageIsoCode=EN&validFrom=${year}-01-01&validTo=${year}-12-31`);
                if (schoolHolidaysResponse.ok) {
                    schoolHolidays = await schoolHolidaysResponse.json();
                }
            }
        } catch (err) {
            console.log('School holidays not available for this country');
        }
        
        hideLoading();
        
        currentHolidays = publicHolidays;
        currentYear = year;
        
        displayHolidays(publicHolidays, countryCode);
        displayCalendar(publicHolidays, schoolHolidays, year);
        displayBridgeDays(publicHolidays, year);
        displaySchoolHolidays(schoolHolidays, year);
        displayVacationPlanner(publicHolidays, schoolHolidays, year);
    } catch (err) {
        hideLoading();
        showError('Failed to load holidays. Please try again.');
        console.error(err);
    }
}

function displayHolidays(holidays, countryCode) {
    if (holidays.length === 0) {
        results.innerHTML = '<p>No holidays found for this country and year.</p>';
        return;
    }

    const country = europeanCountries.find(c => c.code === countryCode) || { name: countryCode, flag: '' };
    
    const headerContainer = document.createElement('div');
    headerContainer.style.display = 'flex';
    headerContainer.style.justifyContent = 'space-between';
    headerContainer.style.alignItems = 'center';
    headerContainer.style.marginBottom = '20px';
    headerContainer.style.cursor = 'pointer';
    headerContainer.style.padding = '15px';
    headerContainer.style.background = '#f8f9fa';
    headerContainer.style.borderRadius = '8px';
    headerContainer.style.border = '2px solid #667eea';

    const headerLeft = document.createElement('div');
    headerLeft.style.display = 'flex';
    headerLeft.style.alignItems = 'center';
    headerLeft.style.gap = '10px';

    const dropdownIcon = document.createElement('span');
    dropdownIcon.textContent = '▼';
    dropdownIcon.style.color = '#667eea';
    dropdownIcon.style.fontSize = '14px';
    dropdownIcon.style.transition = 'transform 0.3s';
    dropdownIcon.className = 'list-dropdown-icon';

    const header = document.createElement('h2');
    header.textContent = `${country.name} - ${holidays.length} Public Holidays`;
    header.style.color = '#333';
    header.style.margin = '0';

    headerLeft.appendChild(dropdownIcon);
    headerLeft.appendChild(header);

    headerContainer.appendChild(headerLeft);
    results.appendChild(headerContainer);

    const listContainer = document.createElement('div');
    listContainer.className = 'holiday-list-container';
    listContainer.style.maxHeight = '0';
    listContainer.style.overflow = 'hidden';
    listContainer.style.transition = 'max-height 0.3s ease-out';

    let listExpanded = true;
    headerContainer.addEventListener('click', () => {
        listExpanded = !listExpanded;
        if (listExpanded) {
            listContainer.style.maxHeight = '10000px';
            dropdownIcon.style.transform = 'rotate(0deg)';
        } else {
            listContainer.style.maxHeight = '0';
            dropdownIcon.style.transform = 'rotate(-90deg)';
        }
    });

    holidays.forEach(holiday => {
        const card = document.createElement('div');
        card.className = 'holiday-card-compact';
        
        const date = new Date(holiday.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });

        card.innerHTML = `
            <div class="holiday-date-compact">${formattedDate}</div>
            <div class="holiday-name-compact">${holiday.name || holiday.localName}</div>
        `;
        
        listContainer.appendChild(card);
    });

    results.appendChild(listContainer);
    
    // Start collapsed by default for all countries
    listContainer.style.maxHeight = '0';
    dropdownIcon.style.transform = 'rotate(-90deg)';
    listExpanded = false;
}

function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showError(message) {
    error.textContent = message;
    error.classList.remove('hidden');
}

function hideError() {
    error.classList.add('hidden');
}

function displayBridgeDays(holidays, year) {
    bridgeDays.innerHTML = '';
    
    const suggestions = findBridgeDays(holidays, year);
    
    if (suggestions.length === 0) {
        return;
    }

    const container = document.createElement('div');
    container.className = 'bridge-container';
    
    const header = document.createElement('h3');
    header.textContent = '💡 Bridge Day Suggestions';
    header.style.margin = '0 0 15px 0';
    container.appendChild(header);

    suggestions.forEach(suggestion => {
        const card = document.createElement('div');
        card.className = 'bridge-card';
        
        card.innerHTML = `
            <div class="bridge-icon">🌴</div>
            <div class="bridge-content">
                <div class="bridge-title">${suggestion.message}</div>
                <div class="bridge-details">${suggestion.details}</div>
            </div>
        `;
        
        container.appendChild(card);
    });

    bridgeDays.appendChild(container);
}

function displaySchoolHolidays(schoolHolidays, year) {
    schoolHolidaysSection.innerHTML = '';
    
    if (!schoolHolidays || schoolHolidays.length === 0) {
        return;
    }

    const container = document.createElement('div');
    container.className = 'school-holidays-container';
    
    const header = document.createElement('h3');
    header.textContent = '🎒 School Holidays';
    header.style.margin = '0 0 15px 0';
    container.appendChild(header);

    schoolHolidays.forEach(holiday => {
        const card = document.createElement('div');
        card.className = 'school-holiday-card';
        
        const startDate = new Date(holiday.startDate);
        const endDate = new Date(holiday.endDate);
        
        const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        // Determine emoji based on holiday name
        let emoji = '📚';
        const name = holiday.name[0]?.text || 'School Holiday';
        if (name.toLowerCase().includes('summer')) emoji = '☀️';
        else if (name.toLowerCase().includes('winter') || name.toLowerCase().includes('christmas')) emoji = '🎄';
        else if (name.toLowerCase().includes('easter') || name.toLowerCase().includes('spring')) emoji = '🐰';
        else if (name.toLowerCase().includes('autumn') || name.toLowerCase().includes('fall')) emoji = '🍂';
        
        card.innerHTML = `
            <div class="school-holiday-icon">${emoji}</div>
            <div class="school-holiday-content">
                <div class="school-holiday-title">${name}</div>
                <div class="school-holiday-details">${startStr} - ${endStr} (${duration} days)</div>
            </div>
        `;
        
        container.appendChild(card);
    });

    schoolHolidaysSection.appendChild(container);
}

function findBridgeDays(holidays, year) {
    const suggestions = [];
    const holidayDates = holidays.map(h => new Date(h.date));
    
    // Sort holidays by date
    holidayDates.sort((a, b) => a - b);
    
    holidayDates.forEach(holidayDate => {
        const dayOfWeek = holidayDate.getDay();
        
        // Check if holiday is on Tuesday (take Monday off for 4-day weekend)
        if (dayOfWeek === 2) {
            const monday = new Date(holidayDate);
            monday.setDate(monday.getDate() - 1);
            
            if (!isHoliday(monday, holidayDates) && !isWeekend(monday)) {
                suggestions.push({
                    message: `Take ${formatDate(monday)} off and get a 4-day break`,
                    details: `${formatDateRange(new Date(monday.getTime() - 86400000 * 2), holidayDate)}`
                });
            }
        }
        
        // Check if holiday is on Thursday (take Friday off for 4-day weekend)
        if (dayOfWeek === 4) {
            const friday = new Date(holidayDate);
            friday.setDate(friday.getDate() + 1);
            
            if (!isHoliday(friday, holidayDates) && !isWeekend(friday)) {
                suggestions.push({
                    message: `Take ${formatDate(friday)} off and get a 4-day break`,
                    details: `${formatDateRange(holidayDate, new Date(friday.getTime() + 86400000 * 2))}`
                });
            }
        }
        
        // Check for holidays with 1 working day gap (take 1 day, get 4+ days)
        const nextDay = new Date(holidayDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const dayAfterNext = new Date(holidayDate);
        dayAfterNext.setDate(dayAfterNext.getDate() + 2);
        
        if (!isWeekend(nextDay) && !isHoliday(nextDay, holidayDates) && 
            (isHoliday(dayAfterNext, holidayDates) || isWeekend(dayAfterNext))) {
            
            let endDate = new Date(dayAfterNext);
            while (isHoliday(endDate, holidayDates) || isWeekend(endDate)) {
                endDate.setDate(endDate.getDate() + 1);
            }
            endDate.setDate(endDate.getDate() - 1);
            
            const totalDays = Math.round((endDate - holidayDate) / (1000 * 60 * 60 * 24)) + 1;
            if (totalDays >= 4) {
                suggestions.push({
                    message: `Take ${formatDate(nextDay)} off and get a ${totalDays}-day break`,
                    details: `${formatDateRange(holidayDate, endDate)}`
                });
            }
        }
    });
    
    // Remove duplicates and limit to top 5
    const unique = suggestions.filter((item, index, self) => 
        index === self.findIndex(t => t.message === item.message)
    );
    
    return unique.slice(0, 5);
}

function isHoliday(date, holidayDates) {
    return holidayDates.some(h => 
        h.getDate() === date.getDate() && 
        h.getMonth() === date.getMonth() && 
        h.getFullYear() === date.getFullYear()
    );
}

function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateRange(start, end) {
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${startStr} - ${endStr}`;
}

function displayCalendar(holidays, schoolHolidays, year) {
    calendar.innerHTML = '';

    const country = europeanCountries.find(c => c.code === currentCountryCode) || { name: currentCountryCode };

    const headerContainer = document.createElement('div');
    headerContainer.style.marginBottom = '20px';
    headerContainer.style.borderRadius = '12px';
    headerContainer.style.overflow = 'hidden';
    headerContainer.style.lineHeight = '0';

    const flagImg = document.createElement('img');
    flagImg.src = `https://flagcdn.com/w1280/${currentCountryCode.toLowerCase()}.png`;
    flagImg.style.width = '100%';
    flagImg.style.height = 'auto';
    flagImg.style.display = 'block';
    flagImg.alt = `${country.name} flag`;
    flagImg.title = `${country.name} - ${year}`;

    headerContainer.appendChild(flagImg);
    calendar.appendChild(headerContainer);

    const holidayDates = new Set(holidays.map(h => h.date));
    const holidayMap = {};
    holidays.forEach(h => {
        holidayMap[h.date] = h;
    });

    // Create school holiday date ranges
    const schoolHolidayRanges = [];
    if (schoolHolidays && schoolHolidays.length > 0) {
        schoolHolidays.forEach(sh => {
            const start = new Date(sh.startDate);
            const end = new Date(sh.endDate);
            schoolHolidayRanges.push({ start, end, name: sh.name[0]?.text || 'School Holiday' });
        });
    }

    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];

    for (let month = 0; month < 12; month++) {
        const monthDiv = document.createElement('div');
        monthDiv.className = 'month';

        const monthHeader = document.createElement('div');
        monthHeader.className = 'month-header';
        monthHeader.textContent = months[month];
        monthDiv.appendChild(monthHeader);

        const daysGrid = document.createElement('div');
        daysGrid.className = 'days-grid';

        // Day headers
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = day;
            daysGrid.appendChild(dayHeader);
        });

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

        // Empty cells before first day
        for (let i = 0; i < startDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'day-cell empty';
            daysGrid.appendChild(emptyCell);
        }

        // Days of month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const currentDate = new Date(year, month, day);
            const dayCell = document.createElement('div');
            dayCell.className = 'day-cell';

            // Check if it's a school holiday
            const isSchoolHoliday = schoolHolidayRanges.some(range =>
                currentDate >= range.start && currentDate <= range.end
            );

            if (isSchoolHoliday) {
                const schoolHoliday = schoolHolidayRanges.find(range =>
                    currentDate >= range.start && currentDate <= range.end
                );
                dayCell.classList.add('school-holiday');
                dayCell.title = schoolHoliday.name;
            }

            // Check if it's a public holiday (overrides school holiday styling)
            if (holidayDates.has(dateStr)) {
                const holiday = holidayMap[dateStr];
                dayCell.classList.remove('school-holiday');
                dayCell.classList.add('holiday');

                // Check if it's a shortened day
                const shortenedTypes = ['Authorities', 'Optional', 'Observance', 'Bank', 'School'];
                const isShortened = holiday.types && holiday.types.some(type => shortenedTypes.includes(type));
                const isNotGlobal = holiday.global === false;

                if (isShortened || (isNotGlobal && holiday.types && !holiday.types.includes('Public'))) {
                    dayCell.classList.add('shortened');
                }

                dayCell.title = `${holiday.name || holiday.localName}\nType: ${holiday.types?.join(', ') || 'N/A'}`;
            }

            dayCell.textContent = day;
            daysGrid.appendChild(dayCell);
        }

        monthDiv.appendChild(daysGrid);
        calendar.appendChild(monthDiv);
    }
}



function displayVacationPlanner(publicHolidays, schoolHolidays, year) {
    vacationPlannerSection.innerHTML = '';
    
    const plan = calculateOptimalVacation(publicHolidays, schoolHolidays, year);
    
    if (!plan) {
        return;
    }

    const container = document.createElement('div');
    container.className = 'vacation-planner-container';
    
    const header = document.createElement('h3');
    header.textContent = '🏖️ Optimal Vacation Plan (28 + 7 Days)';
    container.appendChild(header);
    
    const note = document.createElement('p');
    note.style.color = 'white';
    note.style.fontSize = '14px';
    note.style.marginBottom = '15px';
    note.style.fontStyle = 'italic';
    note.textContent = '💡 Note: Weekends and public holidays are not counted as vacation days (except for the 14 consecutive main vacation)';
    container.appendChild(note);

    const table = document.createElement('div');
    table.className = 'vacation-plan-table';
    
    const tableHeader = document.createElement('div');
    tableHeader.className = 'vacation-plan-header';
    tableHeader.innerHTML = '📅 Recommended Vacation Schedule';
    table.appendChild(tableHeader);

    const mainRow = document.createElement('div');
    mainRow.className = 'vacation-plan-row';
    mainRow.innerHTML = `
        <div class="vacation-plan-label">Main Vacation</div>
        <div class="vacation-plan-dates" data-start="${plan.mainVacation.start.toISOString()}" data-end="${plan.mainVacation.end.toISOString()}">${formatDateRange(plan.mainVacation.start, plan.mainVacation.end)}</div>
        <div class="vacation-plan-days">${plan.mainVacation.totalDays} total days</div>
        <div class="vacation-plan-type type-main">${plan.mainWorkDays} work days</div>
    `;
    
    // Add click handler
    const mainDates = mainRow.querySelector('.vacation-plan-dates');
    mainDates.addEventListener('click', () => {
        scrollToCalendarDate(plan.mainVacation.start, plan.mainVacation.end);
    });
    
    table.appendChild(mainRow);

    const winterRow = document.createElement('div');
    winterRow.className = 'vacation-plan-row';
    const winterStartDay = plan.winterWeek.start.toLocaleDateString('en-US', { weekday: 'short' });
    const winterEndDay = plan.winterWeek.end.toLocaleDateString('en-US', { weekday: 'short' });
    winterRow.innerHTML = `
        <div class="vacation-plan-label">Winter Week</div>
        <div class="vacation-plan-dates" data-start="${plan.winterWeek.start.toISOString()}" data-end="${plan.winterWeek.end.toISOString()}">${formatDateRange(plan.winterWeek.start, plan.winterWeek.end)} (${winterStartDay}-${winterEndDay})</div>
        <div class="vacation-plan-days">${plan.winterWeek.totalDays} total days</div>
        <div class="vacation-plan-type type-winter">${plan.winterWorkDays} work days</div>
    `;
    
    // Add click handler
    const winterDates = winterRow.querySelector('.vacation-plan-dates');
    winterDates.addEventListener('click', () => {
        scrollToCalendarDate(plan.winterWeek.start, plan.winterWeek.end);
    });
    
    table.appendChild(winterRow);

    plan.flexibleDays.forEach((period, index) => {
        const flexRow = document.createElement('div');
        flexRow.className = 'vacation-plan-row';
        const efficiency = Math.round((period.totalDays / period.workDays) * 10) / 10;
        
        // Show the vacation days being taken
        const vacationDaysText = period.workDays === 1 ? 
            `Take ${formatDate(period.start)} off` : 
            `Take ${formatDateRange(period.start, period.end)} off`;
        
        flexRow.innerHTML = `
            <div class="vacation-plan-label">Bridge ${index + 1}</div>
            <div class="vacation-plan-dates" data-start="${period.breakStart ? period.breakStart.toISOString() : period.start.toISOString()}" data-end="${period.breakEnd ? period.breakEnd.toISOString() : period.end.toISOString()}">${vacationDaysText}</div>
            <div class="vacation-plan-days">${period.totalDays}-day break</div>
            <div class="vacation-plan-type type-flexible">${period.workDays} work day${period.workDays > 1 ? 's' : ''}</div>
        `;
        
        // Add click handler - scroll to the full break period
        const flexDates = flexRow.querySelector('.vacation-plan-dates');
        flexDates.addEventListener('click', () => {
            const scrollStart = period.breakStart || period.start;
            const scrollEnd = period.breakEnd || period.end;
            scrollToCalendarDate(scrollStart, scrollEnd);
        });
        
        table.appendChild(flexRow);
    });

    container.appendChild(table);

    const summary = document.createElement('div');
    summary.className = 'vacation-summary';
    const daysSaved = 35 - plan.totalVacationDays;
    summary.innerHTML = `
        <div class="summary-item">
            <span class="summary-value">${plan.totalVacationDays}</span>
            <span class="summary-label">Work Days Used</span>
        </div>
        <div class="summary-item">
            <span class="summary-value">${plan.totalCalendarDays}</span>
            <span class="summary-label">Total Days Off</span>
        </div>
        <div class="summary-item">
            <span class="summary-value">${daysSaved}</span>
            <span class="summary-label">Days Saved</span>
        </div>
        <div class="summary-item">
            <span class="summary-value">${plan.efficiency}%</span>
            <span class="summary-label">Efficiency</span>
        </div>
    `;
    container.appendChild(summary);

    vacationPlannerSection.appendChild(container);
}

// Official Estonian school holidays from Haridus- ja Teadusministeerium / Tallinna Haridusamet
// Source: https://www.tallinn.ee/haridus/koolivaheajad & https://www.hm.ee
// Returns array in same format as OpenHolidays API for compatibility
function getEstonianSchoolHolidays(year) {
    // Each school year spans two calendar years (e.g. 2025/2026)
    // We return holidays that fall within the requested calendar year
    const schedule = {
        // 2023/2024
        2023: [
            { name: 'Sügisvaheaeg', start: '2023-10-23', end: '2023-10-29' },
            { name: 'Jõuluvaheaeg', start: '2023-12-27', end: '2024-01-07' },
        ],
        2024: [
            { name: 'Jõuluvaheaeg', start: '2023-12-27', end: '2024-01-07' },   // continues from 2023
            { name: 'Talvine vaheaeg', start: '2024-02-19', end: '2024-02-25' },
            { name: 'Kevadvaheaeg', start: '2024-04-22', end: '2024-04-28' },
            { name: 'Suvevaheaeg', start: '2024-06-10', end: '2024-08-31' },
            { name: 'Sügisvaheaeg', start: '2024-10-21', end: '2024-10-27' },
            { name: 'Jõuluvaheaeg', start: '2024-12-23', end: '2025-01-05' },
        ],
        2025: [
            { name: 'Jõuluvaheaeg', start: '2024-12-23', end: '2025-01-05' },   // continues from 2024
            { name: 'Talvine vaheaeg', start: '2025-02-24', end: '2025-03-02' },
            { name: 'Kevadvaheaeg', start: '2025-04-14', end: '2025-04-20' },
            { name: 'Suvevaheaeg', start: '2025-06-10', end: '2025-08-31' },
            { name: 'Sügisvaheaeg', start: '2025-10-20', end: '2025-10-26' },
            { name: 'Jõuluvaheaeg', start: '2025-12-22', end: '2026-01-11' },
        ],
        2026: [
            { name: 'Jõuluvaheaeg', start: '2025-12-22', end: '2026-01-11' },   // continues from 2025
            { name: 'Talvine vaheaeg', start: '2026-02-23', end: '2026-03-01' },
            { name: 'Kevadvaheaeg', start: '2026-04-13', end: '2026-04-19' },
            { name: 'Suvevaheaeg', start: '2026-06-17', end: '2026-08-31' },
            { name: 'Sügisvaheaeg', start: '2026-10-26', end: '2026-11-01' },
            { name: 'Jõuluvaheaeg', start: '2026-12-21', end: '2027-01-03' },
        ],
        2027: [
            { name: 'Jõuluvaheaeg', start: '2026-12-21', end: '2027-01-03' },   // continues from 2026
            { name: 'Talvine vaheaeg', start: '2027-02-22', end: '2027-02-28' },
            { name: 'Kevadvaheaeg', start: '2027-04-12', end: '2027-04-18' },
            { name: 'Suvevaheaeg', start: '2027-06-09', end: '2027-08-31' },
        ],
    };

    const entries = schedule[year] || [];

    // Deduplicate (cross-year entries appear in both years)
    const seen = new Set();
    const unique = entries.filter(e => {
        const key = e.start + e.end;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    // Convert to OpenHolidays-compatible format
    return unique.map(e => ({
        name: [{ language: 'ET', text: e.name }, { language: 'EN', text: translateEstonianHoliday(e.name) }],
        startDate: e.start,
        endDate: e.end,
    }));
}

function translateEstonianHoliday(name) {
    const map = {
        'Sügisvaheaeg': 'Autumn Break',
        'Jõuluvaheaeg': 'Christmas Break',
        'Talvine vaheaeg': 'Winter Break',
        'Kevadvaheaeg': 'Spring Break',
        'Suvevaheaeg': 'Summer Break',
    };
    return map[name] || name;
}

function calculateOptimalVacation(publicHolidays, schoolHolidays, year) {
    const holidayDates = new Set(publicHolidays.map(h => new Date(h.date).getTime()));
    
    // Find optimal 14-day consecutive block (prefer summer)
    const mainVacation = findBest14DayPeriod(year, holidayDates, schoolHolidays);
    
    // Find optimal winter week (Monday-Sunday)
    const winterWeek = findBestWinterWeek(year, holidayDates);
    
    // Find optimal bridge days with remaining 14 days
    const flexibleDays = findOptimalBridgeDays(year, holidayDates, mainVacation, winterWeek);
    
    const regularVacationDays = 28; // Regular vacation days
    const winterVacationDays = 7;   // Additional winter vacation days
    
    // Calculate work days used (excluding weekends and public holidays)
    const mainWorkDays = countWorkDays(mainVacation.start, mainVacation.end, holidayDates);
    const winterWorkDays = countWorkDays(winterWeek.start, winterWeek.end, holidayDates);
    const flexibleWorkDays = flexibleDays.reduce((sum, period) => 
        sum + period.workDays, 0);
    
    const totalWorkDaysUsed = mainWorkDays + winterWorkDays + flexibleWorkDays;
    
    const totalCalendarDays = mainVacation.totalDays + winterWeek.totalDays + 
        flexibleDays.reduce((sum, p) => sum + p.totalDays, 0);
    const efficiency = Math.round((totalCalendarDays / totalWorkDaysUsed) * 100);
    
    return {
        mainVacation,
        winterWeek,
        flexibleDays,
        totalVacationDays: totalWorkDaysUsed,
        totalCalendarDays,
        publicHolidaysUsed: (mainWorkDays + winterWorkDays + flexibleWorkDays) - (regularVacationDays + winterVacationDays),
        efficiency,
        mainWorkDays,
        winterWorkDays,
        flexibleWorkDays
    };
}

function findBest14DayPeriod(year, holidayDates, schoolHolidays) {
    let bestPeriod = null;
    let maxScore = -1;
    
    // Prefer summer months (June, July, August)
    const monthRanges = [
        { start: 5, end: 7, priority: 3 },  // Jun-Aug (highest priority)
        { start: 4, end: 8, priority: 2 },  // May-Sep
        { start: 3, end: 9, priority: 1 }   // Apr-Oct
    ];
    
    for (const range of monthRanges) {
        for (let month = range.start; month <= range.end; month++) {
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            for (let day = 1; day <= daysInMonth - 13; day++) {
                const start = new Date(year, month, day);
                const end = new Date(start);
                end.setDate(end.getDate() + 13);
                
                // Count work days needed
                const workDays = countWorkDays(start, end, holidayDates);
                
                // Count public holidays in this period
                const holidaysInPeriod = countHolidaysInPeriod(start, end, holidayDates);
                
                // Count weekends
                const weekendsInPeriod = countWeekendsInPeriod(start, end);
                
                // Score: minimize work days, maximize holidays and weekends
                // Higher priority for summer months
                const score = (holidaysInPeriod * 3 + weekendsInPeriod * 2 - workDays) * range.priority;
                
                if (score > maxScore && workDays <= 14) {
                    maxScore = score;
                    bestPeriod = { 
                        start: new Date(start), 
                        end: new Date(end), 
                        totalDays: 14,
                        workDays,
                        holidaysInPeriod,
                        weekendsInPeriod
                    };
                }
            }
        }
    }
    
    return bestPeriod || { 
        start: new Date(year, 6, 1), 
        end: new Date(year, 6, 14), 
        totalDays: 14,
        workDays: 10,
        holidaysInPeriod: 0,
        weekendsInPeriod: 4
    };
}

function findBestWinterWeek(year, holidayDates) {
    let bestWeek = null;
    let maxScore = -1;
    
    // Check December, January, February
    const periods = [
        { month: 11, year: year },      // December
        { month: 0, year: year + 1 },   // January
        { month: 1, year: year + 1 }    // February
    ];
    
    periods.forEach(({ month, year: checkYear }) => {
        const daysInMonth = new Date(checkYear, month + 1, 0).getDate();
        
        for (let day = 1; day <= daysInMonth - 6; day++) {
            const date = new Date(checkYear, month, day);
            
            // Find Monday of this week
            const dayOfWeek = date.getDay();
            const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            const monday = new Date(date);
            monday.setDate(monday.getDate() + daysToMonday);
            
            // Week is Monday to Sunday (7 consecutive days)
            const sunday = new Date(monday);
            sunday.setDate(sunday.getDate() + 6);
            
            const workDays = countWorkDays(monday, sunday, holidayDates);
            const holidaysInWeek = countHolidaysInPeriod(monday, sunday, holidayDates);
            
            // Score: minimize work days, maximize holidays
            const score = holidaysInWeek * 5 - workDays;
            
            if (score > maxScore) {
                maxScore = score;
                bestWeek = { 
                    start: new Date(monday), 
                    end: new Date(sunday), 
                    totalDays: 7, 
                    workDays,
                    holidaysInWeek
                };
            }
        }
    });
    
    if (!bestWeek) {
        const christmas = new Date(year, 11, 25);
        const dayOfWeek = christmas.getDay();
        const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(christmas);
        monday.setDate(monday.getDate() + daysToMonday);
        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);
        
        bestWeek = {
            start: monday,
            end: sunday,
            totalDays: 7,
            workDays: countWorkDays(monday, sunday, holidayDates),
            holidaysInWeek: countHolidaysInPeriod(monday, sunday, holidayDates)
        };
    }
    
    return bestWeek;
}

function findOptimalBridgeDays(year, holidayDates, mainVacation, winterWeek) {
    const flexible = [];
    const remainingDays = 14; // 14 flexible days from the 28 regular vacation days
    
    const holidays = Array.from(holidayDates).map(ts => new Date(ts)).sort((a, b) => a - b);
    
    // Find all bridge opportunities
    const bridgeOpportunities = [];
    
    holidays.forEach(holiday => {
        const dayOfWeek = holiday.getDay();
        
        // Skip if holiday is in main vacation or winter week period
        if (isInPeriod(holiday, mainVacation) || isInPeriod(holiday, winterWeek)) {
            return;
        }
        
        // Thursday holiday - take Friday for 4-day weekend
        if (dayOfWeek === 4) {
            const friday = new Date(holiday);
            friday.setDate(friday.getDate() + 1);
            const sunday = new Date(friday);
            sunday.setDate(sunday.getDate() + 2);
            
            if (!isWeekend(friday) && !holidayDates.has(friday.getTime()) &&
                !isInPeriod(friday, mainVacation) && !isInPeriod(friday, winterWeek)) {
                bridgeOpportunities.push({
                    start: friday,
                    end: friday,
                    breakStart: holiday,
                    breakEnd: sunday,
                    totalDays: 4,
                    workDays: 1,
                    score: 4.0,
                    description: 'Thu holiday + Fri off = 4-day weekend'
                });
            }
        }
        
        // Tuesday holiday - take Monday for 4-day weekend
        if (dayOfWeek === 2) {
            const monday = new Date(holiday);
            monday.setDate(monday.getDate() - 1);
            const saturday = new Date(monday);
            saturday.setDate(saturday.getDate() - 1);
            
            if (!isWeekend(monday) && !holidayDates.has(monday.getTime()) &&
                !isInPeriod(monday, mainVacation) && !isInPeriod(monday, winterWeek)) {
                bridgeOpportunities.push({
                    start: monday,
                    end: monday,
                    breakStart: saturday,
                    breakEnd: holiday,
                    totalDays: 4,
                    workDays: 1,
                    score: 4.0,
                    description: 'Mon off + Tue holiday = 4-day weekend'
                });
            }
        }
        
        // Friday holiday - take Thursday for 4-day weekend
        if (dayOfWeek === 5) {
            const thursday = new Date(holiday);
            thursday.setDate(thursday.getDate() - 1);
            const sunday = new Date(holiday);
            sunday.setDate(sunday.getDate() + 2);
            
            if (!isWeekend(thursday) && !holidayDates.has(thursday.getTime()) &&
                !isInPeriod(thursday, mainVacation) && !isInPeriod(thursday, winterWeek)) {
                bridgeOpportunities.push({
                    start: thursday,
                    end: thursday,
                    breakStart: thursday,
                    breakEnd: sunday,
                    totalDays: 4,
                    workDays: 1,
                    score: 4.0,
                    description: 'Thu off + Fri holiday = 4-day weekend'
                });
            }
        }
        
        // Monday holiday - take Friday before for 4-day weekend
        if (dayOfWeek === 1) {
            const friday = new Date(holiday);
            friday.setDate(friday.getDate() - 3);
            const sunday = new Date(holiday);
            sunday.setDate(sunday.getDate() + 0);
            
            if (!isWeekend(friday) && !holidayDates.has(friday.getTime()) &&
                !isInPeriod(friday, mainVacation) && !isInPeriod(friday, winterWeek)) {
                bridgeOpportunities.push({
                    start: friday,
                    end: friday,
                    breakStart: friday,
                    breakEnd: holiday,
                    totalDays: 4,
                    workDays: 1,
                    score: 4.0,
                    description: 'Fri off + Mon holiday = 4-day weekend'
                });
            }
        }
        
        // Look for consecutive or near-consecutive holidays
        for (let i = 1; i <= 4; i++) {
            const futureDate = new Date(holiday);
            futureDate.setDate(futureDate.getDate() + i);
            
            if (holidayDates.has(futureDate.getTime())) {
                // Found another holiday within 4 days
                const gapDays = [];
                for (let j = 1; j < i; j++) {
                    const gapDay = new Date(holiday);
                    gapDay.setDate(gapDay.getDate() + j);
                    if (!isWeekend(gapDay) && !holidayDates.has(gapDay.getTime())) {
                        gapDays.push(gapDay);
                    }
                }
                
                if (gapDays.length > 0 && gapDays.length <= 3) {
                    // Calculate full break period
                    let breakStart = new Date(holiday);
                    let breakEnd = new Date(futureDate);
                    
                    // Extend to weekends
                    while (breakStart.getDay() !== 1 && breakStart.getDay() !== 0) {
                        const prev = new Date(breakStart);
                        prev.setDate(prev.getDate() - 1);
                        if (isWeekend(prev) || holidayDates.has(prev.getTime())) {
                            breakStart = prev;
                        } else {
                            break;
                        }
                    }
                    
                    while (breakEnd.getDay() !== 0 && breakEnd.getDay() !== 6) {
                        const next = new Date(breakEnd);
                        next.setDate(next.getDate() + 1);
                        if (isWeekend(next) || holidayDates.has(next.getTime())) {
                            breakEnd = next;
                        } else {
                            break;
                        }
                    }
                    
                    const totalDays = Math.round((breakEnd - breakStart) / (1000 * 60 * 60 * 24)) + 1;
                    const workDays = gapDays.length;
                    
                    if (totalDays >= 5 && workDays <= 3) {
                        const allInRange = gapDays.every(d => 
                            !isInPeriod(d, mainVacation) && !isInPeriod(d, winterWeek)
                        );
                        
                        if (allInRange) {
                            bridgeOpportunities.push({
                                start: gapDays[0],
                                end: gapDays[gapDays.length - 1],
                                breakStart,
                                breakEnd,
                                totalDays,
                                workDays,
                                score: totalDays / workDays,
                                description: `Bridge ${workDays} day${workDays > 1 ? 's' : ''} for ${totalDays}-day break`
                            });
                        }
                    }
                }
            }
        }
    });
    
    // Sort by efficiency (score) - best opportunities first
    bridgeOpportunities.sort((a, b) => b.score - a.score);
    
    // Remove overlapping opportunities and select best ones
    const selected = [];
    let daysUsed = 0;
    
    for (const opportunity of bridgeOpportunities) {
        // Check if this opportunity overlaps with already selected ones
        const overlaps = selected.some(s => {
            return isInPeriod(opportunity.start, s) || 
                   isInPeriod(opportunity.end, s) ||
                   isInPeriod(s.start, opportunity) ||
                   isInPeriod(s.end, opportunity);
        });
        
        if (!overlaps && daysUsed + opportunity.workDays <= remainingDays) {
            selected.push(opportunity);
            daysUsed += opportunity.workDays;
        }
        
        // Continue until we use all 14 remaining days
        if (daysUsed >= remainingDays) {
            break;
        }
    }
    
    // If we haven't used all 14 days, add longer vacation blocks
    if (daysUsed < remainingDays) {
        // Find periods with good weather (spring/fall) for additional vacation
        const additionalPeriods = [];
        
        // Check April, May, September, October for good vacation periods
        const goodMonths = [3, 4, 8, 9]; // Apr, May, Sep, Oct
        
        for (const month of goodMonths) {
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            for (let day = 1; day <= daysInMonth - 6; day++) {
                const start = new Date(year, month, day);
                const end = new Date(start);
                const daysToAdd = Math.min(7, remainingDays - daysUsed);
                end.setDate(end.getDate() + daysToAdd - 1);
                
                // Check if this period overlaps with main vacation, winter week, or selected bridges
                const overlapsMain = isInPeriod(start, mainVacation) || isInPeriod(end, mainVacation);
                const overlapsWinter = isInPeriod(start, winterWeek) || isInPeriod(end, winterWeek);
                const overlapsSelected = selected.some(s => 
                    isInPeriod(start, s) || isInPeriod(end, s) ||
                    isInPeriod(s.start, { start, end }) || isInPeriod(s.end, { start, end })
                );
                
                if (!overlapsMain && !overlapsWinter && !overlapsSelected) {
                    const workDays = countWorkDays(start, end, holidayDates);
                    const totalDays = daysToAdd;
                    
                    if (workDays > 0 && workDays <= remainingDays - daysUsed) {
                        additionalPeriods.push({
                            start,
                            end,
                            breakStart: start,
                            breakEnd: end,
                            totalDays,
                            workDays,
                            score: totalDays / workDays,
                            description: `${daysToAdd}-day vacation block`
                        });
                    }
                }
            }
        }
        
        // Sort by score and add best additional periods
        additionalPeriods.sort((a, b) => b.score - a.score);
        
        for (const period of additionalPeriods) {
            if (daysUsed + period.workDays <= remainingDays) {
                const overlaps = selected.some(s => {
                    return isInPeriod(period.start, s) || 
                           isInPeriod(period.end, s) ||
                           isInPeriod(s.start, period) ||
                           isInPeriod(s.end, period);
                });
                
                if (!overlaps) {
                    selected.push(period);
                    daysUsed += period.workDays;
                }
                
                if (daysUsed >= remainingDays) {
                    break;
                }
            }
        }
    }
    
    return selected;
}

function countHolidaysInPeriod(start, end, holidayDates) {
    let count = 0;
    const current = new Date(start);
    
    while (current <= end) {
        if (holidayDates.has(current.getTime())) {
            count++;
        }
        current.setDate(current.getDate() + 1);
    }
    
    return count;
}

function countWeekendsInPeriod(start, end) {
    let count = 0;
    const current = new Date(start);
    
    while (current <= end) {
        if (isWeekend(current)) {
            count++;
        }
        current.setDate(current.getDate() + 1);
    }
    
    return count;
}

function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
}

function countWorkDays(start, end, holidayDates) {
    let workDays = 0;
    const current = new Date(start);
    
    while (current <= end) {
        const dayOfWeek = current.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isHoliday = holidayDates.has(current.getTime());
        
        if (!isWeekend && !isHoliday) {
            workDays++;
        }
        
        current.setDate(current.getDate() + 1);
    }
    
    return workDays;
}

function isInPeriod(date, period) {
    return date >= period.start && date <= period.end;
}


function scrollToCalendarDate(startDate, endDate) {
    // Scroll to calendar section
    calendar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Wait for scroll to complete, then highlight dates
    setTimeout(() => {
        // Remove any existing highlights
        document.querySelectorAll('.day-cell.highlight').forEach(cell => {
            cell.classList.remove('highlight');
        });
        
        // Highlight the date range
        const current = new Date(startDate);
        const end = new Date(endDate);
        
        while (current <= end) {
            const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
            
            // Find the day cell with this date
            const dayCells = document.querySelectorAll('.day-cell');
            dayCells.forEach(cell => {
                const cellDate = cell.textContent.trim();
                const cellParent = cell.closest('.month');
                
                if (cellParent && cellDate && !cell.classList.contains('empty')) {
                    const monthHeader = cellParent.querySelector('.month-header');
                    if (monthHeader) {
                        const monthName = monthHeader.textContent;
                        const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June', 
                                          'July', 'August', 'September', 'October', 'November', 'December'].indexOf(monthName);
                        
                        if (monthIndex === current.getMonth() && parseInt(cellDate) === current.getDate()) {
                            cell.classList.add('highlight');
                        }
                    }
                }
            });
            
            current.setDate(current.getDate() + 1);
        }
    }, 500);
}
