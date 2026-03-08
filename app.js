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

let currentHolidays = [];
let currentCountryCode = '';
let currentYear = '';
let selectedCountry = null;

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
        
        // Fetch school holidays from OpenHolidays API
        let schoolHolidays = [];
        try {
            const schoolHolidaysResponse = await fetch(`https://openholidaysapi.org/SchoolHolidays?countryIsoCode=${countryCode}&languageIsoCode=EN&validFrom=${year}-01-01&validTo=${year}-12-31`);
            if (schoolHolidaysResponse.ok) {
                schoolHolidays = await schoolHolidaysResponse.json();
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

