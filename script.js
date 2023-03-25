// Foresight: A Calendar/To-Do List App

function init(){
    const calendarGrid = document.getElementById("calendar-grid");
    const weeksGrid = document.getElementById("weeks-grid");
    const todayButton = document.getElementById("today-button");
    const prevMonthButton = document.getElementById("prev-month-button");
    const nextMonthButton = document.getElementById("next-month-button");
    const header_text = document.getElementById("header-text");
    const headerDropdownLabel = document.getElementById("header-dropdown-label");
    const headerDropdownContents = document.getElementById("header-dropdown-contents");
    const headerDropdownNavbarYear = document.getElementById("header-dropdown-navbar-year");
    const dropdownUpButton = document.getElementById("dropdown-up-button");
    const dropdownDownButton = document.getElementById("dropdown-down-button");
    const dateJumpButtons = document.getElementsByClassName("date-jump-button");
    const today = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September","October", "November", "December"];
    const dateJumpButtonIds = {"jan-button": 0, "feb-button": 1, "mar-button": 2, "apr-button": 3, 
                               "may-button": 4, "jun-button: ": 5, "jul-button": 6, "aug-button": 7, 
                               "sep-button": 8, "oct-button":9, "nov-button":10, "dec-button":11};
    let displayedMonth = today.getMonth();
    let displayedYear = today.getFullYear();
    let jumpDateDropdownYear = today.getFullYear();

    /*
        This function sets up the initial calendar grid HTML and fills in the dates for the current month/year.

        Notes:
            "week" div Ids range from "week1" to "week6"
            "day" div IDs range from "weekXday1" to "weekXday7" for each week "X" where X(1,6]
    */
    function initCalendar(){

        let weekDiv;
        let weekDivId;
        let dayDiv;
        let dayDivId;

        // create six "week" divs and append to "calendarGrid" div
        for(let i=0; i<6; i++){
            weekDiv = document.createElement('div');
            weekDivId = i+1; 
            weekDiv.setAttribute('class', 'week');
            weekDiv.setAttribute('id','week'+ weekDivId);
            weeksGrid.appendChild(weekDiv);
            // create 7 "day" divs and append them to the newly created "week" div
            for(let x=1; x<8; x++){
                dayDiv = document.createElement('div');
                // the last day in the week should have a right border i.e. different class
                if(x==7){
                    dayDiv.setAttribute('class', 'day day-right-border grid-cell'); // DELETE THIS
                }
                else {
                    dayDiv.setAttribute('class', 'day grid-cell');
                }
                dayDivId = 'week'+weekDivId+'day' + x;
                dayDiv.setAttribute('id', dayDivId);
                dayDiv.addEventListener('click', function(){
                    // Ensures that date isn't highlighted if clicking out of the date-jump dropdown menu
                    if(document.getElementsByClassName("dropdown-contents-show").length == 0){
                        highlightDate(this);
                    }
                });
                weekDiv.appendChild(dayDiv);
            }
        }

        fillDates();
    }

    // This function will fill each "day" cell with the correct date number for a given month and year
    // It will also ensure that the correct Month and Year are displayed in the calendar header/jump-date dropdown
    function fillDates(year=today.getFullYear(), month=today.getMonth()){
        let firstDay = new Date(year, month, 1);    // first day of month being displayed
        let lastDay = new Date(year, month+1,0);    // since day=0, returns last day of current month
        let prevMonthLastDay = new Date(year, month,0);
        let weekDiv;    // the week being iterated through
        let dayDiv;     // the day of the week being filled
        let weeks = document.getElementsByClassName("week"); // array where each item is a week div
        let days;   // array where each element is a day div in week i
        let date_count = 1;

        // display the month and year in the calendar heading
        header_text.innerHTML = ""+monthNames[month] + " " + year;
        // set the displayed year in the date-jump dropdown (hidden until clicked on); update global variable
        headerDropdownNavbarYear.innerHTML = year;
        jumpDateDropdownYear = year;

        // update the global variables
        displayedMonth = month;
        displayedYear = year;

        let todaysDate = true;  // true if today's date will be displayed on calendar
        let selected_month = true;  // true if filling date cells from the selected month (i.e. not the prev or next)


        if(month != today.getMonth() || year != today.getFullYear()){
            todaysDate = false;
            let todaysDateDiv = document.getElementsByClassName("todays-date");
            if (todaysDateDiv.length > 0){
                todaysDateDiv[0].classList.remove("todays-date");
            }
        }

        clearHighlights();
        
        for(let i=0; i<6; i++){ // iterate through each week
            weekDiv = weeks[i];
            days = weekDiv.getElementsByClassName("day"); 
            for(let x=0; x<7; x++){ // iterate through each day in each week
                dayDiv = days[x];
                if(i==0 && x<firstDay.getDay()){   // if filling the first week and there are days from previous month
                    dayDiv.innerHTML = prevMonthLastDay.getDate()-(firstDay.getDay()-x-1);
                }
                else {
                    if(date_count == 1) {
                        let month_index = month == 11 ? 0 : month+1;
                        dayDiv.innerHTML = selected_month ? monthNames[month].slice(0,3) + " " + 1 : monthNames[month_index].slice(0,3) + " " + 1;
                    }
                    else {
                        dayDiv.innerHTML = date_count;
                    }
                    
                    if(date_count == today.getDate() && todaysDate){ // make note of which "date" div represents today's date
                        dayDiv.classList.add("todays-date");
                        dayDiv.classList.add("highlighted-date");
                    }

                    date_count++;

                    if(date_count>lastDay.getDate()){   // reset date_count to zero for filling next month's dates
                        date_count = 1;
                        todaysDate = false;
                        selected_month = false;
                    }
                }
            }
        }
    }

    // This function unhighlights any highlighted days
    function clearHighlights(){
        let oldHighlightedDate = document.getElementsByClassName("highlighted-date");
        if(oldHighlightedDate.length > 0){
            oldHighlightedDate[0].classList.remove("highlighted-date");
        }
    }

    // This function is called whenever a day cell is clicked on.
    // It highlights the clicked-on day cell.
    function highlightDate(dayDivElem){
        clearHighlights();
        dayDivElem.classList.add("highlighted-date");
    }

    /* BUTTON FUNCTIONALITY EVENT LISTENERS */

    // Add functionality for the "Today" button in the header toolbar
    todayButton.addEventListener("click", function(){
        fillDates();
    });
    // Add functionality for the prev-month button in the header toolbar
    prevMonthButton.addEventListener("click", function(){
        let newDisplayedMonth = displayedMonth == 0 ? 11 : displayedMonth - 1;
        let newDisplayedYear = displayedMonth == 0 ? displayedYear-1 : displayedYear;
        fillDates(newDisplayedYear, newDisplayedMonth);
    });
    // Add functionality for the next-month button in the header toolbar
    nextMonthButton.addEventListener("click", function(){
        let newDisplayedMonth = displayedMonth == 11 ? 0 : displayedMonth + 1;
        let newDisplayedYear = displayedMonth == 11 ? displayedYear+1 : displayedYear;
        fillDates(newDisplayedYear, newDisplayedMonth);
    });
    // Add functionality for the date-jump dropdown menu in the header
    headerDropdownLabel.addEventListener("click", function(){
        headerDropdownContents.classList.toggle("dropdown-contents-show");
        headerDropdownContents.style.opacity = 1;
    });
    // Add functionality for the date-jump month buttons in the header drowndown menu
    for(const jumpButton of dateJumpButtons) {
        jumpButton.addEventListener("click", function(){
            headerDropdownContents.classList.toggle("dropdown-contents-show");
            fillDates(jumpDateDropdownYear, dateJumpButtonIds[this.id]);
        });
    }
    // Add functionality for the "up arrow" nav button in the date-jump dropdown menu
    dropdownUpButton.addEventListener("click", function(){
        jumpDateDropdownYear +=1;
        headerDropdownNavbarYear.innerHTML = jumpDateDropdownYear;
    });
    // Add functionality for the "down arrow" nav button in the date-jump dropdown menu
    dropdownDownButton.addEventListener("click", function(){
        jumpDateDropdownYear -=1;
        headerDropdownNavbarYear.innerHTML = jumpDateDropdownYear;
    });
    // Clicking outside of the date-jump dropdown menu will close it if it's open.
    window.onclick = function(event) {
        if (!document.getElementById("header-dropdown").contains(event.target) && 
            document.getElementsByClassName("dropdown-contents-show").length > 0){
            headerDropdownContents.classList.remove("dropdown-contents-show");
            jumpDateDropdownYear = displayedYear;
            headerDropdownNavbarYear.innerHTML = jumpDateDropdownYear; // reset the date-jump year to the displayed year after the dropdown is closed
        }
    }

    initCalendar();
}

init();