function checkAbsenceCriteria(absenceDates, visaStartDate, citizenshipApplicationDate) {
    // Parse dates if not already in Date format
    const absences = absenceDates.map(date => new Date(date));

    // ILR Calculation - 5 years from visa start date
    const ilrPeriodStart = new Date(visaStartDate);
    const ilrPeriodEnd = new Date(visaStartDate);
    ilrPeriodEnd.setFullYear(ilrPeriodEnd.getFullYear() + 5);

    // Filter absences within the ILR 5-year period
    const absencesInILRPeriod = absences.filter(date => date >= ilrPeriodStart && date <= ilrPeriodEnd);
    const totalAbsencesInILRPeriod = absencesInILRPeriod.length;

    // Check all rolling 12-month periods within ILR 5 years for 180-day rule (CORE LOGIC to find the maxium absences in any 12-month window)
    let maxAbsencesInAny12Months = 0;
    let maxWindowStart = null;
    let maxWindowEnd = null;
    for (let i = 0; i < absencesInILRPeriod.length; i++) {
        const start = absencesInILRPeriod[i];
        const end = new Date(start);
        end.setFullYear(end.getFullYear() + 1);

        const absencesIn12Months = absencesInILRPeriod.filter(
            date => date >= start && date < end
        ).length;

        if (absencesIn12Months > maxAbsencesInAny12Months) {
            maxAbsencesInAny12Months = absencesIn12Months;
            maxWindowStart = start;
            maxWindowEnd = end;
        }
        if (maxAbsencesInAny12Months > 180) break;
    }

    const criteriaMetILR = totalAbsencesInILRPeriod <= 450 && maxAbsencesInAny12Months <= 180;

    // Citizenship Calculation - 5 years back from citizenship application date
    const citizenshipPeriodEnd = new Date(citizenshipApplicationDate);
    const citizenshipPeriodStart = new Date(citizenshipApplicationDate);
    citizenshipPeriodStart.setFullYear(citizenshipPeriodStart.getFullYear() - 5);

    // Last 12 months before citizenship application
    const lastYearStart = new Date(citizenshipApplicationDate);
    lastYearStart.setFullYear(lastYearStart.getFullYear() - 1);

    // Filter absences within citizenship 5-year period
    const absencesInCitizenshipPeriod = absences.filter(date => date >= citizenshipPeriodStart && date <= citizenshipPeriodEnd);
    const totalAbsencesInCitizenshipPeriod = absencesInCitizenshipPeriod.length;

    // Filter absences within last 12 months before citizenship application
    const absencesInLastYear = absences.filter(date => date >= lastYearStart && date <= citizenshipPeriodEnd);
    const totalAbsencesInLastYear = absencesInLastYear.length;

    const criteriaMetCitizenship = totalAbsencesInCitizenshipPeriod <= 450 && totalAbsencesInLastYear <= 90;

    return {
        // ILR Results
        ilrPeriodStart: ilrPeriodStart.toISOString().split("T")[0],
        ilrPeriodEnd: ilrPeriodEnd.toISOString().split("T")[0],
        totalAbsencesInILRPeriod,
        maxAbsencesInAny12Months,
        maxWindowStart: maxWindowStart ? maxWindowStart.toISOString().split("T")[0] : null,
        maxWindowEnd: maxWindowEnd ? maxWindowEnd.toISOString().split("T")[0] : null,
        criteriaMetILR,

        // Citizenship Results
        citizenshipPeriodStart: citizenshipPeriodStart.toISOString().split("T")[0],
        citizenshipPeriodEnd: citizenshipPeriodEnd.toISOString().split("T")[0],
        totalAbsencesInCitizenshipPeriod,
        lastYearStart: lastYearStart.toISOString().split("T")[0],
        totalAbsencesInLastYear,
        criteriaMetCitizenship
    };
}



// Example Usage
//   const absenceDates = [
//     "2020-01-15", "2020-05-20", "2021-03-10", "2022-07-18", "2023-02-25",
//     "2023-06-15", "2024-01-10", "2024-11-20", "2022-12-01", "2023-08-05",
//   ];
  
//   const result = checkAbsenceCriteria(absenceDates);
  
//   console.log("Total absences in 5 years:", result.totalAbsencesInFiveYears);
//   console.log("Maximum absences in any 12-month period:", result.maxAbsencesInAny12Months);
//   console.log("Criteria met for ILR:", result.criteriaMet ? "Yes" : "No");

function checkAbsenceCriteriaOnClick(){
    const absenceDates = [];
    const validationErrors = [];
    const absencePeriods = document.querySelectorAll('.absence-period');

    absencePeriods.forEach((period, index) => {
        const startDate = period.querySelector('.startDate').value;
        const endDate = period.querySelector('.endDate').value;

        if(startDate === '' || endDate === ''){
            // Skip empty entries
        } else {
            // Validate date range
            if (new Date(startDate) > new Date(endDate)) {
                validationErrors.push(`Entry ${index + 1}: Start date (${startDate}) is after end date (${endDate})`);
                return;
            }

            var days = enumerateDaysBetween(startDate, endDate);
            absenceDates.push(...days);
        }
    });

    // Check for validation errors
    if (validationErrors.length > 0) {
        const resultDiv = document.querySelector('.result');
        resultDiv.innerHTML = `
            <div style="color: red; background-color: #ffe6e6; padding: 15px; border-radius: 5px; border-left: 4px solid #ff0000;">
                <h4>❌ Validation Errors Found:</h4>
                <ul>
                    ${validationErrors.map(error => `<li>${error}</li>`).join('')}
                </ul>
                <p><strong>Please correct these errors and try again.</strong></p>
            </div>
        `;
        return;
    }

    console.log(absenceDates)

    const visaStartDate = document.querySelector('.visaStartDate').value;
    const citizenshipApplicationDate = document.querySelector('.citizenshipApplicationDate').value;
    const result = checkAbsenceCriteria(absenceDates, visaStartDate, citizenshipApplicationDate);

    const resultDiv = document.querySelector('.result');
    const maxWindowDisplay = result.maxWindowStart && result.maxWindowEnd
        ? `Worst 12-month window: ${result.maxWindowStart} to ${result.maxWindowEnd}<br>`
        : '';

    resultDiv.innerHTML = `
        <h4>📋 ILR (Indefinite Leave to Remain) Results</h4>
        <strong>Period:</strong> ${result.ilrPeriodStart} to ${result.ilrPeriodEnd}<br>
        <strong>Total absences in 5 years:</strong> ${result.totalAbsencesInILRPeriod} days<br>
        <strong>Maximum absences in any 12-month period:</strong> ${result.maxAbsencesInAny12Months} days<br>
        ${maxWindowDisplay}
        <strong>Criteria met for ILR:</strong> <span style="color: ${result.criteriaMetILR ? 'green' : 'red'}; font-weight: bold;">${result.criteriaMetILR ? "✅ Yes" : "❌ No"}</span><br>

        <h4>🇬🇧 UK Citizenship Results</h4>
        <strong>5-year period:</strong> ${result.citizenshipPeriodStart} to ${result.citizenshipPeriodEnd}<br>
        <strong>Total absences in citizenship 5-year period:</strong> ${result.totalAbsencesInCitizenshipPeriod} days<br>
        <strong>Last 12 months:</strong> ${result.lastYearStart} to ${result.citizenshipPeriodEnd}<br>
        <strong>Absences in last 12 months:</strong> ${result.totalAbsencesInLastYear} days<br>
        <strong>Criteria met for citizenship:</strong> <span style="color: ${result.criteriaMetCitizenship ? 'green' : 'red'}; font-weight: bold;">${result.criteriaMetCitizenship ? "✅ Yes" : "❌ No"}</span>
    `;
}

function enumerateDaysBetween(startDate, endDate) {
    const start = new Date(startDate); // Convert to Date object
    const end = new Date(endDate); // Convert to Date object

    const dates = [];
    let current = new Date(start);

    // UK Immigration Rule: Departure date counts, return date does NOT count
    while (current < end) {
        dates.push(new Date(current)); // Add the current date to the array
        current.setDate(current.getDate() + 1); // Increment the date by 1 day
    }

    return dates.map(date => date.toISOString().split("T")[0]);
}

function parsePastedData() {
    const pasteInput = document.querySelector('.paste-input');
    const data = pasteInput.value.trim();

    if (!data) {
        alert('Please paste some data first');
        return;
    }

    const lines = data.split('\n').filter(line => line.trim());
    const dateRanges = [];
    const invalidLines = [];

    lines.forEach((line, index) => {
        const parsed = parseDateRangeLine(line);
        if (parsed) {
            dateRanges.push(parsed);
        } else {
            invalidLines.push(`Line ${index + 1}: "${line}"`);
        }
    });

    if (dateRanges.length > 0) {
        populateAbsencePeriods(dateRanges);

        let message = `Successfully parsed ${dateRanges.length} date ranges`;
        if (invalidLines.length > 0) {
            message += `\n\nSkipped ${invalidLines.length} invalid lines:\n${invalidLines.join('\n')}`;
        }
        alert(message);
    } else {
        let message = 'No valid date ranges found. Please check the format.';
        if (invalidLines.length > 0) {
            message += `\n\nProblems found:\n${invalidLines.join('\n')}`;
        }
        alert(message);
    }
}

function parseDateRangeLine(line) {
    const parts = line.trim().split(/\s+/);

    if (parts.length < 2) {
        return null;
    }

    const startDateStr = parts[0];
    const endDateStr = parts[1];

    try {
        const startDate = dayjs(startDateStr);
        const endDate = dayjs(endDateStr);

        if (startDate.isValid() && endDate.isValid()) {
            // Validate that start date is not after end date
            if (startDate.isAfter(endDate)) {
                console.warn('Invalid date range in line:', line, '- Start date is after end date');
                return null;
            }

            return {
                startDate: startDate.format('YYYY-MM-DD'),
                endDate: endDate.format('YYYY-MM-DD'),
                location: parts.slice(2).join(' ')
            };
        }
    } catch (e) {
        console.warn('Could not parse line:', line, e);
    }

    return null;
}

function populateAbsencePeriods(dateRanges) {
    ensureMinimumEntries(dateRanges.length);

    const absencePeriods = document.querySelectorAll('.absence-period');

    dateRanges.forEach((range, index) => {
        if (index < absencePeriods.length) {
            const period = absencePeriods[index];
            period.querySelector('.startDate').value = range.startDate;
            period.querySelector('.endDate').value = range.endDate;
        }
    });
}

function clearPastedData() {
    document.querySelector('.paste-input').value = '';
}

function clearAllFields() {
    // Clear all absence period inputs
    const absencePeriods = document.querySelectorAll('.absence-period');
    absencePeriods.forEach(period => {
        period.querySelector('.startDate').value = '';
        period.querySelector('.endDate').value = '';
    });

    // Clear paste input
    document.querySelector('.paste-input').value = '';

    // Clear results
    document.querySelector('.result').innerHTML = '';
}

// Clear all fields when page loads to ensure consistent behavior
window.addEventListener('load', function() {
    clearAllFields();

    // Make the reset button also clear absence period fields and results
    const resetButton = document.querySelector('input[type="reset"]');
    resetButton.addEventListener('click', function() {
        // Small delay to let the form reset first, then clear additional fields
        setTimeout(clearAllFields, 10);
    });

    // Auto-set citizenship application date to 6 years after visa start date
    const visaStartDateInput = document.querySelector('.visaStartDate');
    const citizenshipApplicationDateInput = document.querySelector('.citizenshipApplicationDate');

    function updateCitizenshipDate() {
        const visaStartDate = visaStartDateInput.value;
        if (visaStartDate) {
            const citizenshipDate = new Date(visaStartDate);
            citizenshipDate.setFullYear(citizenshipDate.getFullYear() + 6);
            citizenshipApplicationDateInput.value = citizenshipDate.toISOString().split('T')[0];
        }
    }

    // Set initial value on page load
    updateCitizenshipDate();

    // Update citizenship date whenever visa start date changes
    visaStartDateInput.addEventListener('change', updateCitizenshipDate);
});

function addAbsencePeriod() {
    const list = document.querySelector('.absence-period-list');
    const newEntry = document.createElement('li');
    newEntry.className = 'absence-period';
    newEntry.innerHTML = `
        Start Date: <input type="date" class="startDate">
        End Date: <input type="date" class="endDate">
        <button type="button" onclick="removeAbsencePeriod(this)" style="margin-left: 10px;">Remove</button>
    `;
    list.appendChild(newEntry);
}

function removeLastAbsencePeriod() {
    const periods = document.querySelectorAll('.absence-period');
    if (periods.length > 1) {
        periods[periods.length - 1].remove();
    }
}

function removeAbsencePeriod(button) {
    const periods = document.querySelectorAll('.absence-period');
    if (periods.length > 1) {
        button.parentElement.remove();
    }
}

function ensureMinimumEntries(requiredCount) {
    const currentCount = document.querySelectorAll('.absence-period').length;
    const needed = requiredCount - currentCount;

    for (let i = 0; i < needed; i++) {
        addAbsencePeriod();
    }
}