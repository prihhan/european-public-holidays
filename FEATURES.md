# Vacation Planner - Features

## Overview
A comprehensive vacation planning application for viewing public holidays and school holidays across 30 European countries with intelligent vacation planning suggestions.

## Key Features

### 1. Public Holidays Display
- **30 European Countries** supported
- **Year Range**: 2020-2030
- **Color-Coded Calendar**:
  - 🔴 Red: Public holidays
  - 🟡 Yellow: Shortened/optional days
  - 🌸 Pink: School holidays
- **Collapsible List View** with compact holiday cards
- **Flag Integration** using FlagCDN for visual country identification

### 2. School Holidays Integration
- **Real-time Data** from OpenHolidays API
- **Automatic Fetching** for supported countries
- **Visual Indicators** in calendar (pink highlighting)
- **Detailed Information**: Holiday name, dates, and duration
- **Emoji Icons** for different holiday types (☀️ 🎄 🐰 🍂 📚)

### 3. Bridge Day Suggestions
- **Smart Analysis** of holiday patterns
- **4-Day Weekend Opportunities**: Identifies Tuesdays/Thursdays adjacent to holidays
- **Extended Break Planning**: Finds single days off that create 4+ day vacations
- **Top 5 Suggestions** displayed with clear date ranges
- **Visual Cards** with vacation emoji (🌴)

### 4. Interactive Calendar
- **12-Month View** with all holidays marked
- **Hover Tooltips** showing holiday details
- **Full-Width Flag Header** for each country
- **Responsive Grid Layout** for all screen sizes

### 5. User Experience
- **Custom Dropdown** with flag icons for country selection
- **No Installation Required** - runs directly in browser
- **Fast Loading** with efficient API calls
- **Clean Design** with gradient cards and smooth animations
- **Collapsible Sections** for better content organization

## Data Sources

### Public Holidays
- **API**: [Nager.Date API](https://date.nager.at/)
- **Coverage**: Worldwide public holidays
- **Data**: Holiday names, dates, types, and regional information

### School Holidays
- **API**: [OpenHolidays API](https://openholidaysapi.org/)
- **Coverage**: European school holiday schedules
- **Data**: Holiday periods, names, and dates
- **Fallback**: Graceful handling when data unavailable

### Country Flags
- **CDN**: [FlagCDN](https://flagcdn.com/)
- **Quality**: High-resolution flag images
- **Format**: PNG with multiple size options

## Technical Stack
- **Frontend**: Pure HTML, CSS, JavaScript (no frameworks)
- **APIs**: RESTful API integration
- **Styling**: Custom CSS with gradients and animations
- **Responsive**: Mobile-friendly design

## Supported Countries
Austria, Belgium, Bulgaria, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Ireland, Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Norway, Poland, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden, Switzerland, United Kingdom

## Future Enhancements
- Export calendar to ICS format
- Multi-country comparison view
- Custom holiday reminders
- Integration with Google Calendar
- Regional/state-specific holidays
- Historical holiday data
