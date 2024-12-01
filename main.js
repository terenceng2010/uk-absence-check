function checkAbsenceCriteria(absenceDates, visaStartDate) {
    const fiveYearsAgo = new Date(visaStartDate);
    const fiveYearsLater = new Date(visaStartDate);
    fiveYearsLater.setFullYear(fiveYearsLater.getFullYear() + 5);
    const oneYearBefore = new Date(fiveYearsLater);
    oneYearBefore.setFullYear(oneYearBefore.getFullYear() - 1);

    // Parse dates if not already in Date format
    const absences = absenceDates.map(date => new Date(date));

    // Filter absences within the 5-year period
    const absencesInFiveYears = absences.filter(date => date >= fiveYearsAgo && date <= fiveYearsLater);

    // Total absences in the 5-year period
    const totalAbsencesInFiveYears = absencesInFiveYears.length;

    if (totalAbsencesInFiveYears > 450) {
        return {
        totalAbsencesInFiveYears,
        maxAbsencesInAny12Months: null,
        criteriaMet: false,
        };
    }

    // Check all rolling 12-month periods within 5 years
    let maxAbsencesInAny12Months = 0;

    for (let i = 0; i < absencesInFiveYears.length; i++) {
        const start = absencesInFiveYears[i];
        const end = new Date(start);
        end.setFullYear(end.getFullYear() + 1);

        // Count absences in the rolling 12-month period starting from 'start'
        const absencesIn12Months = absencesInFiveYears.filter(
        date => date >= start && date < end
        ).length;

        maxAbsencesInAny12Months = Math.max(maxAbsencesInAny12Months, absencesIn12Months);

        // If at any point this exceeds 180, no need to check further
        if (maxAbsencesInAny12Months > 180) break;
    }

    // Check criteria
    const criteriaMetILR = totalAbsencesInFiveYears <= 450 && maxAbsencesInAny12Months <= 180;

    // Filter absences within last 1-year period
    const absencesInLastOneYear = absences.filter(date => date >= oneYearBefore && date <= fiveYearsLater);

    // Total absences in the last 1-year period
    const totalAbsencesInLastOneYear = absencesInLastOneYear.length;   
    
    // Check criteria
    const criteriaMetCitizenship = totalAbsencesInFiveYears <= 450 && totalAbsencesInLastOneYear <= 90;    

    return {
        totalAbsencesInFiveYears,
        maxAbsencesInAny12Months,
        criteriaMetILR,
        totalAbsencesInLastOneYear,
        criteriaMetCitizenship,
        citizenshipPeriodStart: oneYearBefore.toISOString().split("T")[0],
        citizenshipPeriodEnd: fiveYearsLater.toISOString().split("T")[0]
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
    const absencePeriods = document.querySelectorAll('.absence-period');
    absencePeriods.forEach(period => {
        const startDate = period.querySelector('.startDate').value;
        const endDate = period.querySelector('.endDate').value;
        if(startDate === '' || endDate === ''){
            
        }else{
            var days = enumerateDaysBetween(startDate, endDate);
            absenceDates.push(...days);
        }
    });
    console.log(absenceDates)
    const result = checkAbsenceCriteria(absenceDates, document.querySelector('.visaStartDate').value);
    const resultDiv = document.querySelector('.result');
    resultDiv.innerHTML = `
        Total absences in 5 years: ${result.totalAbsencesInFiveYears} days<br>
        Maximum absences in any 12-month period: ${result.maxAbsencesInAny12Months} days<br>
        Criteria met for ILR: ${result.criteriaMetILR ? "Yes" : "No"}<br>
        Total absences in last 1 year (${result.citizenshipPeriodStart}~${result.citizenshipPeriodEnd}): ${result.totalAbsencesInLastOneYear} days<br>
        Criteria met for citizenship: ${result.criteriaMetCitizenship ? "Yes" : "No"}
    `;
}

function enumerateDaysBetween(startDate, endDate) {
    const start = new Date(startDate); // Convert to Date object
    const end = new Date(endDate); // Convert to Date object

    const dates = [];
    let current = new Date(start);

    while (current <= end) {
        dates.push(new Date(current)); // Add the current date to the array
        current.setDate(current.getDate() + 1); // Increment the date by 1 day
    }

    return dates.map(date => date.toISOString().split("T")[0]);
}