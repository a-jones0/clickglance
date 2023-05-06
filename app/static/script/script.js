// ClickGlance: A Calendar/To-Do List App
// Author: Aishah Jones
// Project started: 03/15/2023

function init(){
    const root = document.querySelector(':root');
    const weeksGrid = document.getElementById("weeks-grid");
    // Header (Date Jump) Dropdown Elements
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
    const displayedDate = new Date();
    // date to be displayed is set in html/jinja as "month-year" - month is 1-12, for javascript needs to be 0-11
    let formMonth, formYear;
    [formMonth, formYear] = document.getElementById("header-text").innerHTML.split("-");
    displayedDate.setMonth(parseInt(formMonth)-1);
    displayedDate.setFullYear(parseInt(formYear));
    let displayedMonth = displayedDate.getMonth();
    let displayedYear = displayedDate.getFullYear();
    let jumpDateDropdownYear = displayedDate.getFullYear();

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
                // DAY DIV
                dayDiv = document.createElement('div');
                dayDivId = 'week'+weekDivId+'day' + x;
                dayDiv.setAttribute('class', 'day grid-cell');
                dayDiv.setAttribute('id', dayDivId);
                // DAY HEADER, BODY, & FOOT DIVS
                dayHeaderDiv = document.createElement('div');
                dayHeaderDiv.setAttribute('class', 'day-header');
                dayBodyDiv = document.createElement('div');
                dayBodyDiv.setAttribute('class', 'day-body');
                dayFooterDiv = document.createElement('div');
                dayFooterDiv.setAttribute('class', 'day-footer');

                dayDiv.appendChild(dayHeaderDiv);
                dayDiv.appendChild(dayBodyDiv);
                dayDiv.appendChild(dayFooterDiv);
                
                // CALENDAR DAY CLICK EVENT LISTENER
                dayDiv.addEventListener('click', function(event){
                    // Ensures that date isn't highlighted if clicking out of the date-jump dropdown menu
                    if(document.getElementsByClassName("dropdown-contents-show").length == 0){
                        // if day has been double-clicked, add a task
                        if(this.classList.contains("highlighted-date") && 
                        !event.target.classList.contains("calendar-item") && 
                        !event.target.classList.contains("item-icon-container") && 
                        !event.target.classList.contains("item-icon") && 
                        !event.target.classList.contains("item-time-container") && 
                        !event.target.classList.contains("item-title-container")){
                            showCreateItemModal(this);
                            console.log("double clicked!");
                        }
                        else{
                            console.log("highlight!");
                            highlightDate(this);
                        }
                    }
                });
                weekDiv.appendChild(dayDiv);
            }
        }

        fillDates();
    }

    let highlightedDate; // used to ensure proper behavior when opening the createItem modal

    // This function will fill each "day" cell with the correct date number for a given month and year
    // It will also ensure that the correct Month and Year are displayed in the calendar header/jump-date dropdown
    function fillDates(year=displayedDate.getFullYear(), month=displayedDate.getMonth()){
        let firstDay = new Date(year, month, 1);    // first day of month being displayed
        let lastDay = new Date(year, month+1,0);    // since day=0, returns last day of current month
        let prevMonthLastDay = new Date(year, month,0);
        let next_month_index = month == 11 ? 0 : month+1;
        let next_month_year = month == 11 ? year+1 : year;
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
        
        let dateNum;   // the date number to be filled into the day being rendered

        for(let i=0; i<6; i++){ // iterate through each week
            weekDiv = weeks[i];
            days = weekDiv.getElementsByClassName("day"); 
            for(let x=0; x<7; x++){ // iterate through each day in each week
                dayDiv = days[x];
                if(i==0 && x<firstDay.getDay()){   // if filling the first week and there are days from previous month
                    dateNum = prevMonthLastDay.getDate()-(firstDay.getDay()-x-1);
                    dayDiv.querySelector('.day-header').innerHTML = dateNum;
                    renderCalendarItems(dayDiv, prevMonthLastDay.getFullYear(), prevMonthLastDay.getMonth(), dateNum);
                }
                else {
                    render_month = selected_month ? month : next_month_index;
                    // Show abbrev. month with date on the first day of each month (e.g. Jan 1)
                    if(date_count == 1) {
                        dayDiv.querySelector('.day-header').innerHTML = selected_month ? monthNames[month].slice(0,3) + " " + 1 : monthNames[next_month_index].slice(0,3) + " " + 1;
                    }
                    else {
                        dayDiv.querySelector('.day-header').innerHTML = date_count;
                    }
                    
                    if(date_count == displayedDate.getDate() && todaysDate){ // make note of which "date" div represents today's date
                        dayDiv.classList.add("todays-date");
                        dayDiv.classList.add("highlighted-date");
                        highlightedDate = dayDiv;
                    }

                    if(selected_month){
                        renderCalendarItems(dayDiv, next_month_year, month, date_count);
                    }
                    else{
                        renderCalendarItems(dayDiv, next_month_year, next_month_index, date_count);
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


    /* ------------------------------- USER CALENDARS - SIDEBAR LINK AND TASK RENDERING SETUP ------------------------------- */


    const calendarLinks = document.getElementsByClassName("calendar-link");
    // Create the userCalendars object, which tracks all calendars
    const userCalendars = {};   // key: value = calendarId: {color: color, visible: true/false}
    let contextMenuCalendarLink;
    let onIndexPage = true;
    let visSaveButton = false;

    for(const calendarLink of calendarLinks){
        onIndexPage = false;
        let calendarLinkVisible = calendarLink.querySelector(".calendar-visible");
        let calendarColor = calendarLink.querySelector(".calendar-color");

        userCalendars[calendarLink.querySelector(".calendar-id").innerHTML] = {'color': calendarColor.innerHTML, 'name': calendarLink.querySelector(".calendar-name").innerHTML, 'visible': calendarLinkVisible.innerHTML}; 

        // Add functionality to the calendar links - toggle items belonging to the calendar visible/hidden
        calendarLink.addEventListener("click", function(event){
            // do not toggle items if clicking on the "more options" button
            if(!event.target.classList.contains("more-options-icon")){
                let calendarLinkCheckbox = calendarLink.querySelector(".calendar-link-checkbox");
                // hide calendar items if they're already visible
                if(calendarLinkVisible.innerHTML == "true"){
                    calendarLinkCheckbox.checked = false;
                    calendarLinkCheckbox.style.background = "none";
                    calendarLinkVisible.innerHTML = "false";
                    userCalendars[calendarLink.querySelector(".calendar-id").innerHTML]["visible"] = "false";

                }
                else{
                    calendarLinkCheckbox.checked = true;
                    calendarLinkCheckbox.style.backgroundColor = calendarColor.innerHTML;
                    calendarLinkVisible.innerHTML = "true";
                    userCalendars[calendarLink.querySelector(".calendar-id").innerHTML]["visible"] = "true";
                }
                toggleItemView();
                // keep track of which calendars have had their visibility changed so they can be saved to the database
                // changedCalendar div id, name format: calId, value=new visibility status
                let changedCalendarId = calendarLink.querySelector(".calendar-id").innerHTML;
                visSaveButton = true;
                if(document.getElementById(changedCalendarId)){
                    document.getElementById(changedCalendarId).value = calendarLinkVisible.innerHTML;
                }
                else{
                    // input that sends status information to flask app
                    let changedCalendar = document.createElement('input');
                    changedCalendar.setAttribute('class', 'vis-changed-calendar');
                    changedCalendar.setAttribute('form', "save-calendar-visibility-form");
                    changedCalendar.name = changedCalendarId;
                    changedCalendar.id = changedCalendarId;
                    changedCalendar.value = calendarLinkVisible.innerHTML;
                    document.getElementById("visibility-updated-calendars").appendChild(changedCalendar);
                }
                document.getElementById("sidebar-save-vis-section").style.display = "flex";
            }
            // clicked on "more options" button
            else {
                let calendarContextMenu = document.getElementById("calendar-context-menu");
                //open the context menu
                calendarContextMenu.style.display = "flex";
                calendarContextMenu.style.left = event.pageX + "px";
                calendarContextMenu.style.top = event.clientY+ "px";
                // pass item info to the "edit" and "delete" functions
                contextMenuCalendarLink = calendarLink;
                // make sure calendar group link context menu is closed
                document.getElementById("calendar-group-context-menu").style.display = "none";
            }
        });

        // can't edit or delete the starter calendar
        if(calendarLink.querySelector(".calendar-name").innerHTML != "Calendar"){
            // show more options icon when hovering over the calendar link
            let moreOptionsIcon = calendarLink.querySelector(".more-options-icon");
            calendarLink.onmouseenter = function(){
                moreOptionsIcon.style.display = "block";
            };
            calendarLink.onmouseleave = function(){
                moreOptionsIcon.style.display = "none";
            };
            moreOptionsIcon.onclick = function(){
            }
        }

        
    }


    /* ------------------------------- CALENDAR/CALENDAR GROUP CONTEXT MENU/DELETE MODAL FUNCTIONALITY ------------------------------- */
    

    if(!onIndexPage){
        // Add functionality to the "edit" button in the calendar custom context menu (calendar link -> 'more options' btn)
        document.getElementById("cal-context-menu-edit-btn").addEventListener("click", function(){
            let calId = contextMenuCalendarLink.querySelector(".calendar-id").innerHTML;
            // use the 'Add Calendar' modal but pre-fill the inputs and change the header name
            let addCalendarModal = document.getElementById("add-calendar-modal");
            addCalendarModal.querySelector(".modal-header").innerHTML = "Edit Calendar";
            addCalendarModal.querySelector("#add-calendar-name-input").value = contextMenuCalendarLink.querySelector(".calendar-name").innerHTML;
            addCalendarModal.querySelector("#add-calendar-color-input").value = contextMenuCalendarLink.querySelector(".calendar-color").innerHTML;
            // match title input color to calendar color
            let calColor = document.getElementById("add-calendar-color-input").value;
            document.getElementById("add-calendar-name-input").style.borderColor = calColor;
            document.getElementById("add-calendar-name-input").style.color = calColor;
            addCalendarModal.classList.add("modal-show");
            document.getElementById("add-edit-cal-indicator").value = calId; // if value is "add", then adding calendar, otherwise editing calendar with calId 
        });

        // Add functionality to the "delete" button in the calendar custom context menu (calendar link -> 'more options' btn)
        document.getElementById("cal-context-menu-delete-btn").addEventListener("click", function(){
            let calId = contextMenuCalendarLink.querySelector(".calendar-id").innerHTML;
            document.getElementById("delete-calendar-modal").classList.add("modal-show");
            document.getElementById("delete-calendar-input").value = calId; // value of "delete calendar" input that gets sent to flask app 
        });

        // Add functionality to the "edit" button in the calendar group custom context menu (calendar group link -> 'more options' btn)
        document.getElementById("calgroup-context-menu-edit-btn").addEventListener("click", function(){
            let calGroupId = contextMenuCalendarGroupLink.querySelector(".calendar-group-id").innerHTML;
            // use the 'Add Calendar Group' modal but pre-fill the input and change the header name
            let addCalendarGroupModal = document.getElementById("add-calendar-group-modal");
            addCalendarGroupModal.querySelector(".modal-header").innerHTML = "Edit Calendar Group";
            addCalendarGroupModal.querySelector("#add-calendar-group-input").value = contextMenuCalendarGroupLink.querySelector(".calendar-group-name").innerHTML;
            addCalendarGroupModal.classList.add("modal-show");
            document.getElementById("add-edit-calgroup-indicator").value = calGroupId; // if value is "add", then adding calendar group, otherwise editing calendar with calId 
        });

        // Add functionality to the "delete" button in the calendar group custom context menu (calendar group link -> 'more options' btn)
        document.getElementById("calgroup-context-menu-delete-btn").addEventListener("click", function(){
            let calGroupId = contextMenuCalendarGroupLink.querySelector(".calendar-group-id").innerHTML;
            let deleteCalgroupForm = document.getElementById("delete-calgroup-form");  
            deleteCalgroupForm.querySelector("#delete-calgroup-input").value = calGroupId;
            deleteCalgroupForm.submit();
        });

        // Add functionality to the "Cancel" button in the "delete calendar" modal
        document.getElementById("cancel-delete-calendar-btn").addEventListener("click", function(){
            document.getElementById("delete-calendar-modal").classList.remove("modal-show");
        });
    }
    

    // if on index page, populate userCalendars with example calendar info
    if(onIndexPage){
        userCalendars["1"] = {"color": getComputedStyle(root).getPropertyValue('--create-item-modal-color'), "name": "Example Calendar", 'visible': "true"};
    }

    let contextMenuDateItem;    // the calendar item for whom the context menu options apply

    // This function will render all calendar items for the currently displayed month and year
    // Calendar item class format: "item-type item-due-date", item-due-date format: YYYY-MM-DD
    // Inputs: int: year, int: month (0-11), int: date (1-31)
    function renderCalendarItems(dayDivElem, year, month, date){
        let formattedMonth = (month+1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
        let formattedDate = date.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
        let classStr = year+"-"+formattedMonth+"-"+formattedDate;
        let dateItems = document.getElementsByClassName(classStr);  // list of items whose classlist contains the date specified by the input paremeters
        const statusUpdatedItems = document.getElementById("status-updated-items");
        
        for(const dateItem of dateItems){
            let dateItemType = dateItem.classList.contains("task") ? "task" : dateItem.classList.contains("assignment") ? "assignment" : "event";
            let calendarItem, itemIconContainer, itemIcon;
            let itemTitle = dateItem.querySelector(".item-title").innerHTML;
            
            // Calendar Item Div
            calendarItem = document.createElement('div');
            calendarItem.setAttribute('class', 'calendar-item');
            calendarItem.setAttribute('title', itemTitle +"\n"+dateItem.querySelector(".item-notes").innerHTML);

            // Calendar Item Info (hidden from screen)
            itemDate = document.createElement('div');
            itemDate.classList.add("item-due-date");
            itemDate.innerHTML = dateItem.querySelector(".item-due-date").innerHTML;
            itemDate.style.display = "none";
            itemCalendarId = document.createElement('div');
            itemCalendarId.classList.add("item-cal-id");
            itemCalendarId.innerHTML = dateItem.querySelector(".item-cal-id").innerHTML;
            itemCalendarId.style.display = "none";
            calendarItem.appendChild(itemDate);
            calendarItem.appendChild(itemCalendarId);

            // Item Icon Container and Symbol (All items)
            itemIconContainer = document.createElement('div');
            itemIconContainer.setAttribute('class', "item-icon-container");
            itemIcon = document.createElement('SPAN');
            itemIcon.classList.add("material-symbols-outlined", "item-icon");
            let itemStatus = updateItemStatus(dateItem, itemIcon);
            itemIconContainer.appendChild(itemIcon);
            

            // Item Time Container (Assignment and Event)
            itemTimeContainer = document.createElement('div');
            itemTimeContainer.setAttribute('class', 'item-time-container');

            if(dateItemType != "task"){
                let twentyfourDueTime = dateItem.querySelector('.item-due-time').innerHTML; // Assignment due date/event start time, HH:MM:SS, HH is 00-23
                let formattedDueTime = formatItemTime(twentyfourDueTime.split(":",2)[0], twentyfourDueTime.split(":",2)[1]); // returns time as str (e.g. 8AM, 8:30AM)
                // assignment: show dueTime
                if(dateItemType == "assignment"){
                    itemTimeContainer.innerHTML = formattedDueTime;
                }
                // event: show startTime-endTime
                else if(dateItemType == "event"){
                    let twentyfourEndTime = dateItem.querySelector('.item-end-time').innerHTML; // Assignment due date/event start time, HH:MM:SS, HH is 00-23
                    let formattedEndTime = formatItemTime(twentyfourEndTime.split(":",2)[0], twentyfourEndTime.split(":",2)[1]);
                    // if start and end times are both AM or PM, 
                    if(formattedDueTime.slice(-2) == formattedEndTime.slice(-2)){}
                    itemTimeContainer.innerHTML = formattedDueTime + "-" + formattedEndTime;
                }

            }
            // Item Title Container (All items)
            itemTitleContainer = document.createElement('div');
            itemTitleContainer.setAttribute('class', "item-title-container");
            itemTitleContainer.innerHTML =  itemTitle;
            
            // Append all sections to the calendarItem
            calendarItem.appendChild(itemIconContainer);
            calendarItem.appendChild(itemTimeContainer);
            calendarItem.appendChild(itemTitleContainer);

            itemStatusStyle(calendarItem, itemStatus);  // must be called after

            let itemId = dateItem.querySelector(".item-id").innerHTML;

            // Add onclick functionality to the item - clicking changes the item status (incomplete, high priority, complete, cancelled)
            calendarItem.addEventListener("click", function(){
                let updatedStatus = updateItemStatus(dateItem, itemIcon, next_status=true);
                itemStatusStyle(calendarItem, updatedStatus);

                // keep track of which items have been changed so they can be saved to the database
                // changedItem div id, name format: itemId-itemType, value=new status
                let changedItemId = itemId+"-"+dateItemType;
                if(document.getElementById(changedItemId)){
                    document.getElementById(changedItemId).value = updatedStatus;
                }
                else{
                    // input that sends status information to flask app
                    let changedItem = document.createElement('input');
                    changedItem.setAttribute('class', dateItemType);
                    changedItem.setAttribute('form', "header-buttons-form");
                    changedItem.name = changedItemId;
                    changedItem.id = changedItemId;
                    changedItem.value = updatedStatus;
                    statusUpdatedItems.appendChild(changedItem);
                }

                document.getElementById("changed-items-save-button").style.display = "inline";
            });

            // Add right-click functionality to the item - opens an option menu for editing or deleting item
            calendarItem.addEventListener("contextmenu", function(event){
                let itemContextMenu = document.getElementById("item-context-menu");
                event.preventDefault();
                // open the context menu
                itemContextMenu.style.display = "flex";
                itemContextMenu.style.left = event.pageX + "px";
                itemContextMenu.style.top = event.clientY + "px";
                // pass item info to the "edit", "duplicate", and "delete" functions
                contextMenuDateItem = dateItem;
            });

            // add calendar item to the day grid
            dayDivElem.querySelector('.day-body').appendChild(calendarItem);
        }
        
    }


    /* ------------------------------- CALENDAR ITEM CONTEXT MENU EVENT LISTENERS ------------------------------- */

    // called when editing or duplicating a calendar item - prefills the "Create Item" modal with the existing item's info and adjusts variables accordingly
    function fillCreateItemModal(edit=false){
        let itemId = contextMenuDateItem.querySelector(".item-id").innerHTML;
        let itemType = contextMenuDateItem.classList.contains("task") ? "task" : contextMenuDateItem.classList.contains("assignment") ? "assignment" : "event";
        let createItemForm = document.getElementById("create-item-form");
        // use the 'Create Item' modal but pre-fill the inputs and change the header name
        let createItemModal = document.getElementById("create-item-modal");

        // editing an item
        if(edit){
            createItemForm.querySelector("#add-edit-item-indicator").value = itemId; // value is "add" by default, calendar item ID if editing that item
            createItemModal.querySelector("#new-or-create").innerHTML = "Edit"; // show "Edit Item" instead of "Create Item" in the modal header
            createItemModal.querySelector("#item-type-select").disabled = true; // prevent changing one type of item to another
            createItemModal.querySelector("#edit-item-type").value = itemType;  // posts the item type to the flask app since select is disabled
        }
        else{
            createItemForm.querySelector("#add-edit-item-indicator").value = "add";
            createItemModal.querySelector("#new-or-create").innerHTML = "New"; // show "Edit Item" instead of "New Item" in the modal header
            createItemModal.querySelector("#item-type-select").disabled = false; // prevent changing one type of item to another
        }
        // otherwise duplicating an item (i.e. simply filling in the inputs, but same as creating an entirely new item otherwise)
        createItemModal.querySelector("#item-type-icon").innerHTML = itemType;
        createItemModal.querySelector("#item-type-select").value = itemType;
        
        let itemCalId = contextMenuDateItem.querySelector(".item-cal-id").innerHTML;
        // calendar-select value is formatted as "calendarColor-calendarName"
        createItemModal.querySelector("#calendar-select").value = userCalendars[itemCalId]["color"] + "-" + userCalendars[itemCalId]["name"];
        createItemModal.querySelector("#item-title-input").value = contextMenuDateItem.querySelector(".item-title").innerHTML;
        createItemModal.querySelector("#create-item-date-input1").value = contextMenuDateItem.querySelector(".item-due-date").innerHTML; // Due Date (all items)
        createItemModal.querySelector("#item-notes-input").value = contextMenuDateItem.querySelector(".item-notes").innerHTML; // Item notes

        // event or assignment
        if(itemType != "task"){
            let dueTime = contextMenuDateItem.querySelector(".item-due-time").innerHTML.split(":", 2);    // HH:MM:00, 24-hour
            formattedTimeObj = toTwelveHour(parseInt(dueTime[0]), two_digits=true);

            createItemModal.querySelector("#hour-picker-input1").value = formattedTimeObj["hour"];
            createItemModal.querySelector("#minute-picker-input1").value = dueTime[1];
            createItemModal.querySelector("#am-pm-select1").value = formattedTimeObj["timeIndicator"];

            // event
            if(itemType == "event"){
                let endDate = contextMenuDateItem.querySelector(".item-end-date").innerHTML
                let endTime = contextMenuDateItem.querySelector(".item-end-time").innerHTML.split(":",2); // HH:MM:00, 24-hour
                formattedEndTimeObj = toTwelveHour(parseInt(endTime[0]), two_digits=true);
                formattedEndTime = formattedEndTimeObj["hour"];

                createItemModal.querySelector("#create-item-date-input2").value = endDate;
                createItemModal.querySelector("#hour-picker-input2").value = formattedEndTimeObj["hour"];
                createItemModal.querySelector("#minute-picker-input2").value = endTime[1];
                createItemModal.querySelector("#am-pm-select2").value = formattedEndTimeObj["timeIndicator"];
            }
        }
        if (itemType == "task" || itemType == "assignment") {
            createItemModal.querySelector("#create-item-date-input2").value = contextMenuDateItem.querySelector(".item-due-date").innerHTML;
            createItemModal.querySelector("#hour-picker-input2").value = "09";
            createItemModal.querySelector("#minute-picker-input2").value = "00";
            createItemModal.querySelector("#am-pm-select2").value = "AM";
        }
        // set appropriate modal color
        changeItemModalHeader();
        // display appropriate date/time options
        changeItemModalOptions();
        // ensure dates are valid
        checkEventDates();
        // show the "edit item modal"
        modals["createItem"] = 1;
        createItemModal.classList.add("modal-show");
    }

    // Add functionality to the "edit item" button in the custom context menu
    document.getElementById("context-menu-edit-btn").addEventListener("click", function(){
        fillCreateItemModal(edit=true);
    });

    // Add functionality to the "duplicate item" button in the custom context menu
    document.getElementById("context-menu-duplicate-btn").addEventListener("click", function(){
        fillCreateItemModal(edit=false);
    });

    // Add functionality to the "delete item" button in the custom context menu
    document.getElementById("context-menu-delete-btn").addEventListener("click", function(){
        let itemId = contextMenuDateItem.querySelector(".item-id").innerHTML;
        let itemType = contextMenuDateItem.classList.contains("task") ? "task" : contextMenuDateItem.classList.contains("assignment") ? "assignment" : "event";
        document.getElementById("delete-item-modal").classList.add("modal-show");
        document.getElementById("delete-item-input").value = itemType+"-"+itemId;
    });

    // Add functionality to the "Cancel" button in the "delete item" modal
    document.getElementById("cancel-delete-btn").addEventListener("click", function(){
        document.getElementById("delete-item-modal").classList.remove("modal-show");
    });

    // updates google font word and color for the new status
    // returns new status
    function updateItemStatus(dateItem, itemIcon, next_status=false){
        let statuses = ['incomplete', 'high priority', 'complete', 'canceled'];
        let iconHtml = {0: {"font": "", "font_color": ""}, 1: {"font": "priority_high", "font_color":"red"}, 2: {"font":"done", "font_color": "green"}, 3: {"font": "close", "font_color": "rgb(100,100,100)"}};  // Google font symbols
        let itemStatus = dateItem.querySelector(".item-status").innerHTML; // incomplete, high priority, complete, canceled
        let status_index = statuses.indexOf(itemStatus);
        let next_status_index = status_index == 3 ? 0 : status_index+1;
        let final_index = next_status ? next_status_index : status_index;

        itemIcon.innerHTML = iconHtml[final_index]["font"];
        itemIcon.style.color = iconHtml[final_index]["font_color"];
        dateItem.querySelector(".item-status").innerHTML = statuses[final_index];

        return statuses[final_index]
    }

    // style items to be faded with strikethrough text if cancelled, normal styling otherwise
    function itemStatusStyle(calendarItem, itemStatus){
        calendarItem.style.color = "black";
        if(itemStatus == "canceled" || itemStatus == "complete"){
            calendarItem.style.opacity = 0.5;
            if(itemStatus == "canceled"){
                calendarItem.style.backgroundColor = "lightgray";
                calendarItem.style.color = "rgb(100,100,100)";
                calendarItem.querySelector(".item-title-container").style.textDecoration = "line-through";
                calendarItem.querySelector(".item-time-container").style.textDecoration = "line-through";
            }
            else{
                calendarItem.style.color = "darkgreen";
                calendarItem.style.backgroundColor = "lightgreen";
            }
        }
        else {
            let itemCalId = calendarItem.querySelector(".item-cal-id").innerHTML;
            console.log("item cal id: ", itemCalId);
            let itemColor = userCalendars[itemCalId]["color"]
            calendarItem.style.opacity = 1;
            calendarItem.style.backgroundColor = getComputedStyle(root).getPropertyValue('--'+itemColor); // the color's custom rgba value as defined in the CSS stylesheet
            calendarItem.querySelector(".item-title-container").style.textDecoration = "none";
            calendarItem.querySelector(".item-time-container").style.textDecoration = "none";

            if(itemStatus == "high priority"){
                calendarItem.style.color = "darkred";
                calendarItem.style.backgroundColor = "rgb(250, 140, 140)";
            }
        }

    }

    // Ensures that calendar item displays time with the minimum digits possible (e.g. 8PM, 8:30PM)
    // Inputs: str: twentyFourHour "00"-"23", str: minutes "00"-"59"
    // Returns: str: HH:MMAM/PM or H:MMAM/PM OR HHAM/PM OR HAM/PM
    function formatItemTime(twentyFourHour, minutes){
        twelveHourObj = toTwelveHour(parseInt(twentyFourHour), two_digits=false);
        formattedMinutes = minutes == "00" ? "" : ":"+minutes;
        return twelveHourObj['hour']+""+formattedMinutes+twelveHourObj['timeIndicator'];
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
        highlightedDate = dayDivElem;
    }


    /* ------------------------------- BUTTON FUNCTIONALITY EVENT LISTENERS ------------------------------- */


    let header_buttons = document.querySelectorAll(".header-buttons");

    // Add functionality to the "Today", prev-month, and next-month buttons in the header toolbar
    for(const header_button of header_buttons){
        header_button.addEventListener("click", function(){
            let newDisplayedMonth, newDisplayedYear;
            let headerButtonsDate = document.getElementById("header-buttons-date"); // the date being toggled to by clicking on the header button - format: YYYY-MM
            let headerButtonsForm = document.getElementById("header-buttons-form");
            
            if(header_button.id == "today-button" || header_button.id == "changed-items-save-button"){
                newDisplayedMonth = today.getMonth();
                newDisplayedYear = today.getFullYear();
            }
            else if(header_button.id == "prev-month-button"){
                newDisplayedMonth = displayedMonth == 0 ? 11 : displayedMonth - 1;
                newDisplayedYear = displayedMonth == 0 ? displayedYear-1 : displayedYear;
            }
            else if(header_button.id == "next-month-button"){
                newDisplayedMonth = displayedMonth == 11 ? 0 : displayedMonth + 1;
                newDisplayedYear = displayedMonth == 11 ? displayedYear+1 : displayedYear;
            }
            headerButtonsDate.value = newDisplayedYear + "-" + newDisplayedMonth;
            headerButtonsForm.submit();
        });
    }

    /*
    // Add functionality to the "Today" button in the header toolbar
    todayButton.addEventListener("click", function(){
        fillDates();
    });
    
    // Add functionality to the prev-month button in the header toolbar
    prevMonthButton.addEventListener("click", function(){
        let newDisplayedMonth = displayedMonth == 0 ? 11 : displayedMonth - 1;
        let newDisplayedYear = displayedMonth == 0 ? displayedYear-1 : displayedYear;
        fillDates(newDisplayedYear, newDisplayedMonth);
    });
    // Add functionality to the next-month button in the header toolbar
    nextMonthButton.addEventListener("click", function(){
        let newDisplayedMonth = displayedMonth == 11 ? 0 : displayedMonth + 1;
        let newDisplayedYear = displayedMonth == 11 ? displayedYear+1 : displayedYear;
        fillDates(newDisplayedYear, newDisplayedMonth);
    });
    */
    // Add functionality to the date-jump dropdown menu in the header
    headerDropdownLabel.addEventListener("click", function(){
        headerDropdownContents.classList.toggle("dropdown-contents-show");
        headerDropdownContents.style.opacity = 1;
    });
    // Add functionality to the date-jump month buttons in the header drowndown menu
    for(const jumpButton of dateJumpButtons) {
        jumpButton.addEventListener("click", function(){
            headerDropdownContents.classList.toggle("dropdown-contents-show");
            fillDates(jumpDateDropdownYear, dateJumpButtonIds[this.id]);
        });
    }
    // Add functionality to the "up arrow" nav button in the date-jump dropdown menu
    dropdownUpButton.addEventListener("click", function(){
        jumpDateDropdownYear +=1;
        headerDropdownNavbarYear.innerHTML = jumpDateDropdownYear;
    });
    // Add functionality to the "down arrow" nav button in the date-jump dropdown menu
    dropdownDownButton.addEventListener("click", function(){
        jumpDateDropdownYear -=1;
        headerDropdownNavbarYear.innerHTML = jumpDateDropdownYear;
    });

    function closeCreateItemModal(){
        createItemModal.classList.remove("modal-show")
        // reset the create item modal
        createItemModal.querySelector("#item-title-input").value = "";  // blank out modal header
        document.getElementById("add-edit-item-indicator").innerHTML = "add";
        document.getElementById("new-or-create").innerHTML = "New"; // show "New Task/Assignment/Event" in modal header
        itemTypeSelect.value = "task";  // reset select value
        document.getElementById("calendar-select").selectedIndex = 0;
        document.getElementById("item-type-select").disabled = false;
        document.getElementById("item-notes-input").value = ""; // blank out notes
        changeItemModalOptions();
        resetCreateItemModalTimes();
        modals["createItem"] = 0;
    }

    initCalendar();


    /* ------------------------------- SIDEBAR NAVIGATION AND BUTTON EVENT LISTENERS ------------------------------- */


    const pageSidebar = document.querySelector(".sidebar");
    const openSidebarBtn = document.getElementById("open-sidebar-btn");
    const signInLink = document.getElementById("sign-in-link");
    const signInUpModal = document.getElementById("sign-inup-modal");
    const signInUpBtn = document.getElementById("sign-inup-btn");   // "sign up" btn at bottom of sign-in modal & vice-versa
    const signInUpFormGroup = document.getElementById("sign-inup-form-group");
    let aboutBtn = document.getElementById("about-link");   // let, not const, because about btn is on index and mycalendar pages
    let aboutModal = document.getElementById("about-modal");
    const modals = {signInUp: 0, about: 0, createItem: 0}; // 0 if modal is closed, 1 if modal is open
    let signInShow = 0; // 1 if sign-in modal is showing, 0 if sign-up modal is showing
    const calendarGroupLinks = document.getElementsByClassName("calendar-group-link");
    

    // Add functionality to the open/close sidebar menu button
    openSidebarBtn.addEventListener("click", function(){
        pageSidebar.classList.toggle("sidebar-collapsed");
        // toggle if the sidebar save button for calendar visibility is shown or not
        if(pageSidebar.classList.contains("sidebar-collapsed") && visSaveButton){
            document.getElementById("sidebar-save-vis-section").style.display = "none";
        }
        else if(!pageSidebar.classList.contains("sidebar-collapsed") && visSaveButton){
            document.getElementById("sidebar-save-vis-section").style.display = "flex";
        }
    })
    // Add functionality to the "Sign In" sidebar link - could be null if already signed in, no sign-in button on mycalendar page
    if(signInLink != null){
        signInLink.addEventListener("click", function(){
            document.body.classList.add("modal-show");
            signInUpModal.classList.add("modal-show");
            modals["signInUp"] = 1;
            signInShow = 1;
        });
    }
    // Add functionality to the "Sign Up"/"Sign In" button in the footer of the "Sign In/Up" modal (i.e."Don't have an account?"/"Already have an account?")
    if(signInUpBtn != null){
        signInUpBtn.addEventListener("click", function(){
            if (signInShow == 1){   // sign-in modal is showing, button opens sign-up modal
                showSignUpModal();
            }
            else{   // sign-up modal is showing, button opens sign-in modal
                showSignInModal();
            }
        });
    }

    function createUsernameInput(){
        let usernameInput = document.createElement("input");
        usernameInput.classList.add("sign-inup-input");
        usernameInput.type = "text";
        usernameInput.name = "username";
        usernameInput.id = "sign-inup-username-input";
        usernameInput.placeholder = "Username";
        usernameInput.required = true;
        return usernameInput;
    }

    function showSignInModal(){
        // change header message
        document.getElementById("sign-inup-header-message").innerHTML = "Welcome back!";
        // remove "Username" input field
        signInUpFormGroup.removeChild(document.getElementById("sign-inup-username-input"));
        // change form submit button value
        document.getElementById("sign-inup-submit-btn").value = "Sign In";
        //change form action
        document.getElementById("sign-inup-form").action = "/signin";
        // change footer message
        document.getElementById("sign-inup-footer-message").innerHTML = "Don't have an account?"
        signInUpBtn.innerHTML = "Sign Up";
        signInShow = 1;
    }

    function showSignUpModal(){
        let usernameInput = createUsernameInput();
        // change header message
        document.getElementById("sign-inup-header-message").innerHTML = "Nice to meet you!";
        // add "Username" input field to form
        signInUpFormGroup.prepend(usernameInput)
        // change form submit button value
        document.getElementById("sign-inup-submit-btn").value = "Create Account";
        //change form action
        document.getElementById("sign-inup-form").action = "/register";
        // change footer message
        document.getElementById("sign-inup-footer-message").innerHTML = "Already have an account?"
        signInUpBtn.innerHTML = "Sign In";
        signInShow = 0;
    }

    // Add functionality to the "About" sidebar button
    aboutBtn.addEventListener("click", function(){
        document.body.classList.add("modal-show");
        aboutModal.classList.add("modal-show");
        document.getElementById("about-modal").scrollTop = 0;
        modals["about"] = 1;
    });

    // ACCOUNT SETTINGS, ADD CALENDAR, AND ADD CALENDAR GROUP BUTTON FUNCTIONALITY
    if(!onIndexPage){
        // Add functionality to the "Account Settings" button in the sidebar
        let accountSettingsButton = document.getElementById("account-link");
        accountSettingsButton.addEventListener("click", function(){
            document.getElementById("account-settings-modal").classList.add("modal-show");
        });

        // Add functionality to the "Add calendar" button in the sidebar
        let addCalendarButton = document.getElementById("add-calendar-link");
        addCalendarButton.addEventListener("click", function(){
            document.getElementById("add-calendar-modal").classList.add("modal-show");
            // match title input color to default calendar color
            let calColor = document.getElementById("add-calendar-color-input").value;
            document.getElementById("add-calendar-name-input").style.borderColor = calColor;
            document.getElementById("add-calendar-name-input").style.color = calColor;
        });
        
        //Add functionality to the "Add calendar group" button in the sidebar
        let addCalendarGroupButton = document.getElementById("add-calendar-group-link");
        addCalendarGroupButton.onclick = function(){
            document.getElementById("add-calendar-group-modal").classList.add("modal-show");
        }
        
    }    

    let contextMenuCalendarGroupLink; // the calendar group link for whom the context menu options apply

    // Add functionality to the calendar group dropdown buttons in the sidebar
    for(const calendarGroupLink of calendarGroupLinks) {
        calendarGroupLink.addEventListener("click", function(event){
            // do not toggle dropdown if clicking on the "more options" button
            if(!event.target.classList.contains("more-options-icon")){
                let dropdownIcon = calendarGroupLink.querySelector(".material-icons");
                let calendarGroup = calendarGroupLink.parentElement;
                let calendarGroupDropdownContainer = calendarGroup.querySelector(".calendar-group-dropdown-container");
                if (calendarGroupLink.classList.contains("active-calendar-group-dropdown")){
                    calendarGroupLink.classList.remove("active-calendar-group-dropdown");
                    calendarGroupDropdownContainer.style.display = "none";
                    dropdownIcon.innerHTML = "navigate_next";
                }
                else{
                    calendarGroupLink.classList.add("active-calendar-group-dropdown");
                    calendarGroupDropdownContainer.style.display = "inline";
                    dropdownIcon.innerHTML = "expand_more";
                }
            }
            // clicked on "more options" button
            else {
                let calendarGroupContextMenu = document.getElementById("calendar-group-context-menu");
                // open the context menu
                calendarGroupContextMenu.style.display = "flex";
                calendarGroupContextMenu.style.left = event.pageX + "px";
                calendarGroupContextMenu.style.top = event.clientY + "px";
                // pass item info to the "edit" and "delete" functions
                contextMenuCalendarGroupLink = calendarGroupLink;
                // make sure calendar link context menu is closed
                document.getElementById("calendar-context-menu").style.display = "none";
            }
        });

        // can't edit or delete the starter calendar group
        if(calendarGroupLink.querySelector(".calendar-group-name").innerHTML != "My Calendars" ){
            // show more options icon when hovering over the calendar group link
            let moreOptionsIcon = calendarGroupLink.querySelector(".more-options-icon");
            calendarGroupLink.onmouseenter = function(){
                moreOptionsIcon.style.display = "block";
            };
            calendarGroupLink.onmouseleave = function(){
                moreOptionsIcon.style.display = "none";
            };
        }
    }


    // Shows tasks from currently selected calendars, hides tasks from hidden calendars
    function toggleItemView(){
        for(const calendarItem of document.querySelectorAll(".calendar-item")){
            let itemCalId = calendarItem.querySelector(".item-cal-id").innerHTML;
            if(userCalendars[itemCalId]["visible"] == "false"){
                calendarItem.style.display = "none";
            }
            else{
                calendarItem.style.display = "flex";
            }
        }

    }

    // show tasks on visible calendars, hide tasks on hidden calendars
    toggleItemView();


    /* ------------------------------- ACCOUNT SETTINGS & DELETE ACCOUNT MODAL ------------------------------- */


    if(!onIndexPage){
        // Add functionality to the save button in the Account Settings modal
        let accountSettingsSaveBtn = document.getElementById("save-account-settings-btn");
        accountSettingsSaveBtn.onclick = function(){
            let new_password = document.getElementById("new-pw-input").value.trim(); // strip leading and trailing whitespace
            let confirm_password = document.getElementById("confirm-pw-input").value.trim();

            if (new_password != confirm_password) {
                document.getElementById("pw-error-message").style.display = "block";
            }
            else {
                document.getElementById("new-pw-input").value = new_password;
                document.getElementById("confirm-pw-input").value = confirm_password;
                document.getElementById("account-settings-form").submit();
            }
        };

        // Add functionality to the cancel button in the Account Settings modal
        let accountSettingsCancelBtn = document.getElementById("cancel-account-settings-btn");
        accountSettingsCancelBtn.onclick = function(){
            document.getElementById("account-settings-modal").classList.remove("modal-show");   // hide the Account Settings modal
            resetAccountSettingsModal();
        };

        // Add functionality to the "Delete Account" button in the Account Settings modal
        let accountSettingsDeleteButton = document.getElementById("open-delete-account-modal-btn");
        accountSettingsDeleteButton.onclick = function(){
            document.getElementById("account-settings-modal").classList.remove("modal-show");   // hide the Account Settings modal
            document.getElementById("delete-account-modal").classList.add("modal-show");    // show the "Delete Account" modal

            resetAccountSettingsModal();
        };

        // Add functionality to the cancel button in the Delete Account modal
        let cancelDeleteAccountBtn = document.getElementById("cancel-delete-account-btn");
        cancelDeleteAccountBtn.onclick = function(){
            document.getElementById("delete-account-modal").classList.remove("modal-show");   // hide the Delete Account modal
        };

        function resetAccountSettingsModal(){
            let accountSettingsModal = document.getElementById("account-settings-modal");
            // reset the modal inputs
            accountSettingsModal.querySelector("#edit-profile-username-input").value = document.getElementById("sign-in-label").innerHTML;
            accountSettingsModal.querySelector("#edit-profile-email-input").value = accountSettingsModal.querySelector("#user-email").innerHTML;
            accountSettingsModal.querySelector("#new-pw-input").value = "";
            accountSettingsModal.querySelector("#confirm-pw-input").value = "";
        }
        
    }

    /* ------------------------------- ADD CALENDAR MODAL ------------------------------- */


    // Add functionality to the color palette circles for calendar color selection
    let paletteCircles = document.querySelectorAll(".palette-circle");
    for (const paletteCircle of paletteCircles){
        let circleColor = paletteCircle.id.split("-",1)[0];
        // show color glow around circle when hovering over it
        paletteCircle.onmouseenter = function(){
            paletteCircle.style.boxShadow = "2px 2px 35px 1px " + circleColor;
        }
        // remove color glow from circle when mouse is not hovering over it
        paletteCircle.onmouseleave = function(){
            paletteCircle.style.boxShadow = "none";
        }
        // change calendar name input text color and border color to match clicked on circle - update the form color input value
        paletteCircle.onclick = function(){
            document.getElementById("add-calendar-name-input").style.borderColor = circleColor;
            document.getElementById("add-calendar-name-input").style.color = circleColor;
            document.getElementById("add-calendar-color-input").value = circleColor;
        }
    }

    // Add functionality to the cancel button in the Add Calendar modal
    let addCalendarCancelBtn = document.getElementById("cancel-calendar-add-btn");
    if(addCalendarCancelBtn != null){
        addCalendarCancelBtn.onclick = function(){
            let addCalendarModal = document.getElementById("add-calendar-modal");
            // hide the modal
            addCalendarModal.classList.remove("modal-show");
            // reset the modal inputs
            addCalendarModal.querySelector(".modal-header").innerHTML = "Create New Calendar";
            addCalendarModal.querySelector("#add-calendar-name-input").value = "";
            addCalendarModal.querySelector("#add-calendar-color-input").value = "blue";
            document.getElementById("add-edit-cal-indicator").value = "add"; // if value is "add", then adding calendar, otherwise editing calendar with calId 
        };
    }


    /* ------------------------------- ADD CALENDAR GROUP MODAL ------------------------------- */


    // Add functionality to the cancel button in the Add Calendar Group modal
    let addCalendarGroupCancelBtn = document.getElementById("cancel-calendar-group-add-btn");
    if(addCalendarGroupCancelBtn != null){
        addCalendarGroupCancelBtn.onclick = function(){
            // hide the modal
            document.getElementById("add-calendar-group-modal").classList.remove("modal-show");
            // reset the modal inputs
            let addCalendarGroupModal = document.getElementById("add-calendar-group-modal");
            addCalendarGroupModal.querySelector(".modal-header").innerHTML = "New Calendar Group";
            addCalendarGroupModal.querySelector("#add-calendar-group-input").value = "";
            document.getElementById("add-edit-calgroup-indicator").value = "add"; // if value is "add", then adding calendar group, otherwise editing calendar group with calGroupId 
        }
    }


    /* ------------------------------- CREATE CALENDAR ITEM MODAL AND BUTTON EVENT LISTENERS ------------------------------- */


    let createItemModal = document.getElementById("create-item-modal");
    let itemTypeSelect = document.getElementById("item-type-select");
    let calendarSelect = document.getElementById("calendar-select");
    let timePickers = document.getElementsByClassName("time-picker")
    let itemDateInputs = document.getElementsByClassName("item-date-input");
    

    // add functionality: changing date input in the 'Create Item' Modal will trigger the checkEventDates function
    for(const itemDateInput of itemDateInputs){
        itemDateInput.onchange = function(){
            checkEventDates();
        }
    }

    // Add functionality to hour/minute time pickers: dropdown changes text input, formatting text input, ensuring event start/end times are valid
    for(const timePicker of timePickers){
        // add functionality: hour and minute dropdown options change the corresponding input text box
        let timePickerSelects = timePicker.getElementsByClassName("time-picker-select");    // all hour, minute, and am/pm selects inside this timePicker div

        for(const timePickerSelect of timePickerSelects){
            if(!timePickerSelect.classList.contains('am-pm-picker-select')){    // if this select is an hour or minute select
                timePickerSelect.onchange = function(){
                    let timePickerInput = timePickerSelect.previousElementSibling;
                    clickedValue = parseInt(timePickerSelect.value);
                    timePickerInput.value = clickedValue.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
                    checkEventDates();
                }
            }
            else{
                timePickerSelect.onchange = function(){
                    checkEventDates();
                }
            }
        }

        // add functionality: user-typed inputs are properly handled and formatted to be two digits, or reset if a number wasn't entered
        let timePickerInputs = timePicker.getElementsByClassName("time-picker-input"); // all hour, minute text inputs inside this timePicker div
        for(const timePickerInput of timePickerInputs){
            let timePickerSelect = timePickerInput.nextElementSibling;
            timePickerInput.onchange = function(){
                // handle hour input if user entered an invalid value (i.e. not a number)
                if(isNaN(timePickerInput.value)){
                    let defaultValue;   // value that the input box should reset to if user-typed input is invalid
                    if(timePickerInput.classList.contains("hour-picker-text-input")){
                        defaultValue = (timePickerInput.id=="hour-picker-input1") ? "08" : "09";
                    }
                    else {
                        defaultValue = "00";
                    }
                    // reset to previously selected hour/minute - if no selection had been made, show defaultValue
                    timePickerInput.value = (timePickerSelect.value=="") ? defaultValue : parseInt(timePickerSelect.value).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
                }
                // format hour to have two digits if the user did enter a number
                else{
                    timePickerInput.value = parseInt(timePickerInput.value).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
                }
                timePickerSelect.value = "";    // reset selected option in the dropdown
                checkEventDates();
            }
        }
        
    }

    // Called when the 'Create Item' Modal closes - resets the dates and times to default values
    function resetCreateItemModalTimes(){
        document.getElementById("hour-picker-input1").value = "08";
        document.getElementById("hour-picker-input2").value = "09";
        document.getElementById("hour-picker-select1").value = "";
        document.getElementById("hour-picker-select2").value = "";
        document.getElementById("minute-picker-input1").value = "00";
        document.getElementById("minute-picker-input2").value = "00";
        document.getElementById("minute-picker-select1").value = "";
        document.getElementById("minute-picker-select2").value = "";
        document.getElementById("am-pm-select1").value = "AM";
        document.getElementById("am-pm-select2").value = "AM";
    }

    // Called when event start/end dates and times are changed in the 'Create Item' Modal - modifies value to ensure date vailidity, or leaves as is if dates are valid
    function checkEventDates(){
        let startDate = new Date(document.getElementById("create-item-date-input1").value.replace(/-/g, '\/'));
        let startMin = document.getElementById("minute-picker-input1").value;
        let startAMPM = document.getElementById("am-pm-select1").value;
        let startHour = toTwentyFourHour(document.getElementById("hour-picker-input1").value, startAMPM);
        let endDate = new Date(document.getElementById("create-item-date-input2").value.replace(/-/g, '\/'));
        let endMin = document.getElementById("minute-picker-input2").value;
        let endAMPM = document.getElementById("am-pm-select2").value;
        let endHour = toTwentyFourHour(document.getElementById("hour-picker-input2").value, endAMPM);

        startDate.setHours(startHour);
        startDate.setMinutes(startMin);
        endDate.setHours(endHour);
        endDate.setMinutes(endMin);
        // if event dates are invalid, set endDate to be 30 minutes after startDate 
        if(startDate >= endDate){
            endDate.setFullYear(startDate.getFullYear());
            endDate.setMonth(startDate.getMonth());
            endDate.setDate(startDate.getDate());
            endDate.setHours(startDate.getHours());
            endDate.setMinutes(startDate.getMinutes()+30);
            // update the event end date on the 'Create Item' Modal
            let twelveHour = toTwelveHour(endDate.getHours());
            let dateString = endDate.getFullYear() + "-" + 
                            (endDate.getMonth()+1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false}) + "-" + 
                            endDate.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
            document.getElementById("create-item-date-input2").value = dateString;
            document.getElementById("hour-picker-input2").value = twelveHour.hour;
            document.getElementById("minute-picker-input2").value = endDate.getMinutes().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
            document.getElementById("am-pm-select2").value = twelveHour.timeIndicator;
        }
    }
    // Converts 12-hour AM/PM time to 24-hour time
    // Inputs: string - hour (e.g. "02","10"), string - timeIndicator (i.e. "AM" or "PM")
    // Returns: string - hour (range "01"-"24")
    function toTwentyFourHour(hour, timeIndicator){
        if(hour=="12" && timeIndicator=="AM"){
            return "0";
        }
        else if(hour!="12" && timeIndicator=="PM"){
            return String(12+parseInt(hour));
        }
        else {
            return hour;
        }
    }
    // Converts 24-hour time to 12-hour AM/PM time
    // Input: integer - hour (0-23)
    // Returns: string - hour ("01"-12"), string - timeIndicator ("AM"/"PM")
    function toTwelveHour(hour, two_digits=true){
        let finalHour;
        if(hour<=12){
            if(hour==0){
                return {'hour':"12",'timeIndicator':"AM"};
            }
            if(hour==12){
                return {'hour':"12", 'timeIndicator':"PM"}
            }
            finalHour = two_digits ? hour.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false}) : ''+hour; 
            return {'hour':finalHour, 'timeIndicator':"AM"};
        }
        else{
            finalHour = two_digits ? (hour-12).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false}) : ''+ (hour-12);
            return {'hour':finalHour, 'timeIndicator': "PM"};
        }
    }

    // Called when the "Task/Event/Assignment" dropdown value is changed
    function changeItemModalOptions(){
        let itemType = itemTypeSelect.value;
        let itemTypeHeader = document.getElementById("item-type-header");
        let timePickerOne = timePickers[0];
        let dateFormGroupTwo = document.getElementById("item-date-form-group2");
        // change the item type icon
        document.getElementById("item-type-icon").innerHTML = itemType;
        // change what date and time options are shown
        if(itemType == "task") {
            itemTypeHeader.innerHTML = "Task";
            timePickerOne.style.display = "none";
            dateFormGroupTwo.style.display = "none";
        }
        else if (itemType == "assignment") {
            itemTypeHeader.innerHTML = "Assignment";
            timePickerOne.style.display = "flex";
            dateFormGroupTwo.style.display = "none";
        }
        else if (itemType == "event"){
            itemTypeHeader.innerHTML = "Event";
            timePickerOne.style.display = "flex";
            dateFormGroupTwo.style.display = "flex";
        }
    }
    // Called when the 'select calendar' dropdown value is changed - changes title bar text and modal colors
    function changeItemModalHeader(){
        let calendarColorCircle = document.getElementById("select-calendar-color-circle");
        // calendar value is in "color-CalendarName" format
        let [calendarColor, calendarName] = calendarSelect.value.split("-",2);
        if(calendarName){   // undefined on index.html
            document.getElementById("selected-calendar-header").innerHTML = calendarName;
            // change the circle indicating calendar color
            calendarColorCircle.style.backgroundColor = calendarColor;
            calendarColorCircle.style.borderColor = calendarColor;
            // change the modal color to match the calendar color
            let modalColor = getComputedStyle(root).getPropertyValue('--'+calendarColor); // the color's custom rgba value as defined in the CSS stylesheet
            root.style.setProperty('--create-item-modal-color', modalColor);
        }   
    }

    itemTypeSelect.onchange = changeItemModalOptions;
    calendarSelect.onchange = changeItemModalHeader;
    
    // Called when a day is double-clicked - opens the "Create Item" modal
    function showCreateItemModal(dayDivElem=null){
        let dateInputValue1, dateInputValue2;
        highlightedDate = dayDivElem;
        document.getElementById("add-edit-item-indicator").value = "add";
        // set date value for the create item modal to be the clicked-on/highlighted day
        let clickedDay = parseInt(dayDivElem.querySelector('.day-header').innerHTML.slice(-2));
        let dateInputDay = clickedDay.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
        let dateInputMonth, dateInputYear;
        
        // if clicked-on day is from the previous month, display the previous month in the date input
        if(clickedDay > 25 && dayDivElem.parentElement.id.slice(0,5) == "week1") {
            let prevMonth = (displayedMonth==0) ? 12 : displayedMonth;
            dateInputYear = (displayedMonth==0) ? displayedYear-1 : displayedYear;
            dateInputMonth = prevMonth.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
        }
        // if clicked-on day is from the next month, display the next month in the date input
        else if(clickedDay <= 14 && (dayDivElem.parentElement.id.slice(0,5) == "week5"||dayDivElem.parentElement.id.slice(0,5) == "week6")) {
            let nextMonth = (displayedMonth==11) ? 1 : displayedMonth + 2;
            dateInputYear = (displayedMonth==11) ? displayedYear+1 : displayedYear;
            dateInputMonth = (nextMonth).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
        }
        else {
            dateInputYear = displayedYear;
            dateInputMonth = (displayedMonth+1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
        }
        
        dateInputValue1 = dateInputYear + "-" + dateInputMonth + "-" + dateInputDay;
        
        document.getElementById("create-item-date-input1").value = dateInputValue1;
        document.getElementById("create-item-date-input2").value = dateInputValue1;

        changeItemModalHeader();    // ensure that calendar color is correct when modal is first opened

        modals["createItem"] = 1
        console.log(" WHAT IS HAPPENING");
        createItemModal.classList.add("modal-show");
    }


    /* ------------------------------- WINDOW ON CLICK FUNCTION ------------------------------- */


    // Clicking outside of certain menus will close them if they're already open
    window.onclick = function(event) {
        
        for(const contextMenu of document.querySelectorAll(".context-menu")){
            // ensures that more options "context menu" opens properly since it's not actually right-clicked
            if(!event.target.classList.contains("more-options-icon")){
                contextMenu.style.display = "none";
            }
        }
        document.getElementById("item-context-menu").style.display = "none";    
        // date-jump dropdown menu
        if (!document.getElementById("header-dropdown").contains(event.target) && 
            document.getElementsByClassName("dropdown-contents-show").length > 0){
            headerDropdownContents.classList.remove("dropdown-contents-show");
            jumpDateDropdownYear = displayedYear;
            headerDropdownNavbarYear.innerHTML = jumpDateDropdownYear; // reset the date-jump year to the displayed year after the dropdown is closed
        }
        // sign-in/sign-up modal
        else if (signInLink != null && modals["signInUp"]==1 && !document.getElementById("sign-inup-modal-content").contains(event.target) && !signInLink.contains(event.target)){
            document.body.classList.remove("modal-show");
            document.getElementById("sign-inup-modal").classList.remove("modal-show");
            showSignInModal();
            modals["signInUp"]=0;
        }
         // about modal
         else if (modals["about"]==1 && !document.getElementById("about-modal-content").contains(event.target) && !aboutBtn.contains(event.target)){
            document.body.classList.remove("modal-show");
            document.getElementById("about-modal").classList.remove("modal-show");
            modals["about"]=0;
        }
        else if (modals["createItem"]==1 && !document.getElementById("create-item-modal-content").contains(event.target) && !document.getElementById("item-context-menu").contains(event.target)){
            if(document.getElementById("add-edit-item-indicator").value == "add"){
                if(!highlightedDate.contains(event.target)){    // ensures that double-clicking on day allows modal to open
                    closeCreateItemModal();
                }
            }
            else{
                closeCreateItemModal();
            }
            
        }
    }

    
}

init();