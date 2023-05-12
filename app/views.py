from app import cg_app, db
from app.email import send_password_reset_email, send_activate_account_email, send_delete_account_email
from datetime import datetime
from flask import render_template, redirect, url_for, request, session, flash
from flask_bcrypt import Bcrypt
from sqlalchemy import extract, exc
from app.models import Users, Calendar_Groups, Calendars, Tasks, Assignments, Events

# used to hash passwords
bcrypt = Bcrypt(cg_app)  

# ----------------------------------- VIEWS ----------------------------------- #

@cg_app.route("/", methods=['GET','POST'])
def index():
    if request.method == 'GET':
        if "email" in session:
            return redirect(url_for("myCalendar"))
        else:
            return loadCalendar(1, demo_calendar=True)
    # posted from date nav arrows
    else:
        displayed_year, displayed_month = request.form.get("displayed-date").split("-") #YYYY-MM or YYYY-M
        formattedMonth = int(displayed_month)+1
        return loadCalendar(1, month=str(formattedMonth), year=displayed_year, demo_calendar=True)

@cg_app.route("/mycalendar", methods=['GET','POST'])
def myCalendar():
    # date nav buttons, header buttons, and save buttons post to this page
    if request.method == 'POST':
        if "email" in session:
            found_user = Users.query.filter_by(email=session["email"]).first()
            # if saving calendar visibility changes
            if "changed-calendars-vis-save-button" in request.form.keys():
                saveCalendarChanges(request, calVisibility=True)
                current_month = datetime.now().month
                current_year = datetime.now().year
                return loadCalendar(found_user, current_month, current_year)
            # if saving calendar item status changes
            else:
                # note: displayed_month from form is from 0-11, MySQL query is 1-12
                displayed_year,displayed_month = request.form.get("displayed-date").split("-") #YYYY-MM or YYYY-M
                formattedMonth = int(displayed_month)+1
                saveCalendarChanges(request)
                return loadCalendar(found_user, str(formattedMonth), displayed_year)
        else:
            return redirect(url_for("index"))
    # GET method
    else:
        # if logged in, show user's calendar page
        if "email" in session:
            found_user = Users.query.filter_by(email=session["email"]).first()
            if found_user.isactivated == "true":
                current_month = datetime.now().month
                current_year = datetime.now().year
                return loadCalendar(found_user, current_month, current_year)
            else:
                return redirect(url_for("inactiveAccount"))
        else:
            flash("Please sign in or create an account to access My Calendar.", "error")
            return redirect(url_for("index"))

@cg_app.route("/inactiveaccount", methods=['GET', 'POST'])
def inactiveAccount():
    if "email" in session:
        found_user = Users.query.filter_by(email=session["email"]).first()
        if found_user.isactivated == "true":
            return redirect(url_for("myCalendar"))
        else:
            if request.method == 'GET':
                return render_template("inactiveaccount.html", email = found_user.email, username=found_user.username)
            # submitted "resend activation link" form
            else:
                send_activate_account_email(found_user)
                flash("Verification email successfully resent!", "info")
                return render_template("inactiveaccount.html", email = found_user.email, username=found_user.username)
    else:
        return redirect(url_for("index"))
    
@cg_app.route("/activateaccount/<token>", methods=['GET'])
def activateAccount(token):
    if "email" in session:
        found_user = Users.query.filter_by(email=session["email"]).first()
        if found_user.isactivated == "true":
            return redirect(url_for("myCalendar"))
        else:
            # if user has requested multiple activation links, ensures that only the most recent can be used
            if token==found_user.activate_token and Users.verify_token(token, token_type="activate_account"):
                found_user.isactivated = "true"
                db.session.commit()
                flash(f"Welcome to ClickGlance, {found_user.username}!", "info")
                return redirect(url_for("myCalendar"))
            else:
                flash("Invalid or expired activation link", "error")
                return redirect(url_for("inactiveAccount"))
    else:
        return redirect(url_for("index"))

@cg_app.route("/register", methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        # Sign-Up form fields
        username = request.form.get("username")
        email = request.form.get("email")
        password = request.form.get("password")

        # returns user with 'email' or None if doesn't exist in database
        found_user = Users.query.filter_by(email=email).first()

        if found_user:
            flash("An account already exists with that email address.", "error")
            return redirect(url_for("index"))
        else:
            # Create new user
            hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8') # decode so the hashed pw is a string, not bytes
            new_user = Users(username, email, hashed_pw, "false", "Light", "14px")
            db.session.add(new_user)
            db.session.commit()

            new_user = Users.query.filter_by(email=email).first()

            # Create new default calendar group for user
            new_calendar_group = Calendar_Groups(new_user.userId, "My Calendars")
            db.session.add(new_calendar_group)
            db.session.commit()

            new_calendar_group = Calendar_Groups.query.filter_by(userId=new_user.userId).filter_by(calGroupName="My Calendars").first()

            # Create new default calendar for user
            new_calendar = Calendars(new_calendar_group.calGroupId, new_user.userId, "Calendar", "blue", "true")
            db.session.add(new_calendar)
            db.session.commit()
            
            # add user to current session
            session["email"] = email
            # send "verify account" email
            send_activate_account_email(new_user)
            return redirect(url_for("inactiveAccount"))
    # GET method
    else:
        # if already logged in, take to user's calendar - else, to home page
        if "email" in session:
            return redirect(url_for("myCalendar"))
        else:
            return redirect(url_for("index"))

@cg_app.route("/signin", methods=['GET','POST'])
def signIn():
    
    if request.method == 'POST':
        # Sign-In form fields
        email = request.form.get("email")
        form_password = request.form.get("password")
        # returns user with 'email' or None if doesn't exist in database
        found_user = Users.query.filter_by(email=email).first()

        if found_user and bcrypt.check_password_hash(found_user.password, form_password):
            session["email"] = email
            if found_user.isactivated:
                flash(f"Welcome back, {found_user.username}!", "info")
                return redirect(url_for("myCalendar"))
            else:
                return redirect(url_for("inactiveAccount"))
        else:
            flash("Sign-in failed: Invalid email or password", "error")
            return redirect(url_for("index"))
    # GET method
    else:
        # if logged in, show user's calendar page
        if "email" in session:
            found_user = Users.query.filter_by(email=session["email"]).first()
            return redirect(url_for("myCalendar"))
        else:
            return redirect(url_for("index"))

@cg_app.route("/forgotpassword", methods=['GET', 'POST'])
def forgotPassword():
    if "email" in session:
        return redirect(url_for("index"))
    else:
        # clicked "Forgot password?" link in sign-in modal
        if request.method == 'GET':
            return render_template("forgotpassword.html", landing="true")
        # submitted "Send Reset Link" form from Forgot Password landing page
        else:
            recovery_email = request.form.get("forgot-pw-email-input")
            recovered_user = Users.query.filter_by(email=recovery_email).first()
            user_exists = None

            # if a user exists with that email
            if recovered_user:
                user_exists = "true"
                send_password_reset_email(recovered_user)
            # if no user exists with that email
            else:
                user_exists = "false"
            return render_template("forgotpassword.html", landing="false", user_exists=user_exists, email=recovery_email)

@cg_app.route("/resetpassword/<token>", methods=['GET', 'POST'])
def resetPassword(token):
    if "email" in session:
        return redirect(url_for("index"))
    else:
        # clicked link in email, show "reset password" form
        if request.method == 'GET':
            user = Users.verify_token(token)
            if user:
                return render_template("resetpassword.html", token=token, user_id = user.userId)
            # invalid token
            else:
                flash("Invalid link", "error")
                return redirect(url_for("index"))
        # submitted "reset password" form
        else:
            user = Users.query.filter_by(userId=request.form.get("userId")).first()
            new_password = request.form.get("confirmpw-input")
            user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
            db.session.commit()

            session["email"] = user.email
            flash("Password successfully updated!", "info")
            return redirect(url_for("myCalendar"))

@cg_app.route("/createitem", methods=['GET', 'POST'])
def createItem():
    if request.method == 'POST':
        add_edit = request.form.get("add-edit-item-indicator"); # "add" or item id
        # new calendar item form information
        
        item_title = request.form.get("item-title")
        item_date = request.form.get("item-date1") #"YYYY-MM-DD"
        item_notes = request.form.get("item-notes")
        selected_calendar = request.form.get("selected-calendar")

        user_id = Users.query.filter_by(email=session["email"]).first().userId if "email" in session else 1
        calId = Calendars.query.filter_by(userId=user_id, calName=selected_calendar.split("-",2)[1]).first().calId if "email" in session else 1

        # assignment
        due_datetime24_str = twelveToTwentyFour(request.form.get("hour-picker1"), request.form.get("minute-picker1"), request.form.get("am-pm-picker1"))
        # event
        end_date = request.form.get("item-date2")
        end_datetime24_str = twelveToTwentyFour(request.form.get("hour-picker2"), request.form.get("minute-picker2"), request.form.get("am-pm-picker2"))
        # add a new item to the calendar
        if add_edit == "add":
            item_type = request.form.get("item-type")
            # new item to add to calendar
            new_item = None

            if item_type=="task":
                new_item = Tasks(user_id, calId, item_title, item_date, item_notes, "incomplete")
            elif item_type=="assignment" or item_type=="event":
                # Use python datetime to convert from AM/PM received from form data to 24-hour for MySQL
                if item_type=="assignment":
                    new_item = Assignments(user_id, calId, item_title, item_date, due_datetime24_str, item_notes, "incomplete")
                #event
                else:
                    new_item = Events(user_id, calId, item_title, item_date, due_datetime24_str, end_date, end_datetime24_str, item_notes, "incomplete")

            if "email" in session:
                db.session.add(new_item)
                db.session.commit()
                flash("Item created!", "info")
                return redirect(url_for("myCalendar"))
            else:
                if "items" in session:
                    newItemDict = dict(new_item)
                    newItemDict[item_type+"Id"] = session["demoItemId"]
                    session["items"] = session["items"] + [newItemDict]
                    session["demoItemId"] = session["demoItemId"] + 1
                else:
                    newItemDict = dict(new_item)
                    newItemDict[item_type+"Id"] = 1
                    session["items"] = [newItemDict] 
                    session["demoItemId"] = 2
                    session["displayedFlashId"] = 1 # if of item to flash message for
                return redirect(url_for("index"))
        # edit an existing item
        else:
            item_type = request.form.get("edit-item-type")
            # editing an item in the database
            if "email" in session:
                if item_type=="task":
                    edit_task = Tasks.query.filter_by(taskId=add_edit).first()
                    edit_task.calId = calId
                    edit_task.taskTitle = item_title
                    edit_task.taskDueDate = item_date
                    edit_task.taskNotes = item_notes
                    db.session.commit()
                elif item_type=="assignment":
                    edit_assignment = Assignments.query.filter_by(assignmentId=add_edit).first()
                    edit_assignment.calId = calId
                    edit_assignment.assignmentTitle = item_title
                    edit_assignment.assignmentDueDate = item_date
                    edit_assignment.assignmentDueTime = due_datetime24_str
                    edit_assignment.assignmentNotes = item_notes
                    db.session.commit()
                elif item_type == "event":
                    edit_event = Events.query.filter_by(eventId=add_edit).first()
                    edit_event.calId = calId
                    edit_event.eventTitle = item_title
                    edit_event.eventStartDate = item_date
                    edit_event.eventStartTime = due_datetime24_str
                    edit_event.eventEndDate = end_date
                    edit_event.eventEndTime = end_datetime24_str
                    edit_event.eventNotes = item_notes
                    db.session.commit()
                
                flash("Item successfully modified!", "info")
                return redirect(url_for("myCalendar"))
            # editing a demo item (not logged in)
            else:
                id_key = item_type+"Id"
                edited_item = [item for item in session["items"] if (item["itemType"]==item_type  and item[id_key]==int(add_edit))]

                if item_type=="task":
                    edited_item[0]["taskTitle"] = item_title
                    edited_item[0]["taskDueDate"] = item_date
                    edited_item[0]["taskNotes"] = item_notes
                elif item_type=="assignment":
                    edited_item[0]["assignmentTitle"] = item_title
                    edited_item[0]["assignmentDueDate"] = item_date
                    edited_item[0]["assignmentDueTime"] = due_datetime24_str
                    edited_item[0]["assignmentNotes"] = item_notes
                elif item_type == "event":
                    edited_item[0]["eventTitle"] = item_title
                    edited_item[0]["eventStartDate"] = item_date
                    edited_item[0]["eventStartTime"] = due_datetime24_str
                    edited_item[0]["eventEndDate"] = end_date
                    edited_item[0]["eventEndTime"] = end_datetime24_str
                    edited_item[0]["eventNotes"] = item_notes
                 
                flash("Demo task successfully edited!", "message")
                return redirect(url_for("index"))

        
    # GET method for /createItem
    else:
        return redirect(url_for("index"))

@cg_app.route("/deleteitem", methods=['GET','POST'])
def deleteItem():
    if request.method == 'POST':
        itemType,itemId = request.form.get("delete-item-input").split("-")  # format from form: "itemType-itemId"
        deleteItem = None
        if "email" in session:
            if itemType == "task":
                deleteItem = Tasks.query.filter_by(taskId=itemId).first()
            elif itemType == "assignment":
                deleteItem = Assignments.query.filter_by(assignmentId=itemId).first()
            elif itemType == "event":
                deleteItem = Events.query.filter_by(eventId=itemId).first()
            db.session.delete(deleteItem)
            db.session.commit()
            return redirect(url_for("myCalendar"))
        else:
            itemDictKey = itemType+"Id"
            newItemsList = []
            for idx,item in enumerate(session["items"]):
                if item["itemType"]==itemType and item[itemDictKey] == int(itemId):
                    session["items"].pop(idx)
                    break
            newItemsList = session["items"].copy()
            session.pop("items", None)
            session["items"] = newItemsList
            return redirect(url_for("index"))
    else:
        return redirect(url_for("index"))

@cg_app.route("/addcalendar", methods=['GET', 'POST'])
def addCalendar():
    if request.method == 'POST':
        user = Users.query.filter_by(email=session["email"]).first()
        calendar_group = request.form.get("calendar-group-select")
        calendar_name = request.form.get("calendar-name")
        calendar_color = request.form.get("calendar-color")
        add_edit = request.form.get("add-or-edit")
        # adding a calendar
        if(add_edit == "add"):
            new_calendar = Calendars(calendar_group, user.userId, calendar_name, calendar_color, "true")
            try:
                db.session.add(new_calendar)
                db.session.commit()
                flash("Calendar successfully added!", "info")
                return redirect(url_for("myCalendar"))
            except exc.IntegrityError:
                flash("Calendar creation failed: Cannot have duplicate calendar names", "error")
                return redirect(url_for("myCalendar"))
        # editing a calendar
        else:
            edit_calendar = Calendars.query.filter_by(calId=add_edit).first()
            try:
                edit_calendar.calGroupId = calendar_group
                edit_calendar.calName = calendar_name
                edit_calendar.calColor = calendar_color
                db.session.commit()
                flash("Calendar successfully modified!", "info")
                return redirect(url_for("myCalendar"))
            except exc.IntegrityError:
                flash("Edit calendar failed: Cannot have duplicate calendar names", "error")
                return redirect(url_for("myCalendar"))
    else:
        return redirect(url_for("index"))

@cg_app.route("/deletecalendar", methods=['GET', 'POST'])
def deleteCalendar():
    if request.method == 'POST':
        calendarId = request.form.get("delete-calendar-input")
        deleteCalendar = Calendars.query.filter_by(calId=calendarId).first()
        deleteTasks = Tasks.query.filter_by(calId=calendarId).all()
        deleteAssignments = Assignments.query.filter_by(calId=calendarId).all()
        deleteEvents = Events.query.filter_by(calId=calendarId).all()
        
        for item in deleteTasks+deleteAssignments+deleteEvents:
            db.session.delete(item)
            db.session.commit()

        db.session.delete(deleteCalendar)
        db.session.commit()
        flash("Calendar successfully deleted.", "info")
        return redirect(url_for("myCalendar"))
    else:
        return redirect(url_for("index"))

@cg_app.route("/addcalendargroup", methods=['GET', 'POST'])
def addCalendarGroup():
    if request.method == 'POST':
        user = Users.query.filter_by(email=session["email"]).first()
        calgroup_name = request.form.get("add-calendar-group-input")
        add_edit = request.form.get("add-or-edit-group")
        # adding a calendar group
        if(add_edit == "add"):
            new_calendar_group = Calendar_Groups(user.userId, calgroup_name)
            try:
                db.session.add(new_calendar_group)
                db.session.commit()
                flash("Calendar Group successfully added!", "info")
                return redirect(url_for("myCalendar"))
            except exc.IntegrityError:
                flash("Calendar Group creation failed: Cannot have duplicate calendar group names", "error")
                return redirect(url_for("myCalendar"))
        # editing a calendar group
        else:
            edit_calgroup = Calendar_Groups.query.filter_by(calGroupId=add_edit).first()
            try:
                edit_calgroup.calGroupName = calgroup_name
                db.session.commit()
                flash("Calendar group successfully modified!", "info")
                return redirect(url_for("myCalendar"))
            except exc.IntegrityError:
                flash("Edit calendar group failed: Cannot have duplicate calendar group names", "error")
                return redirect(url_for("myCalendar"))
        
    else:
        return redirect(url_for("index"))

@cg_app.route("/deletecalendargroup", methods=['GET', 'POST'])
def deleteCalendarGroup():
    if request.method == 'POST':
        calgroup_id = request.form.get("delete-calgroup-input")
        delete_calgroup = Calendar_Groups.query.filter_by(calGroupId=calgroup_id).first()
        calgroup_cals = Calendars.query.filter_by(calGroupId=calgroup_id).first()
        # can't delete calendar group if it contains calendars
        if calgroup_cals:
            flash("Calendar group deletion failed: cannot delete groups containing calendars", "error")
            return(redirect(url_for("myCalendar")))
        # delete the empty calendar group
        else:
            db.session.delete(delete_calgroup)
            db.session.commit()
            flash("Calendar group successfully deleted.", "info")
            return(redirect(url_for("myCalendar")))
    else:
        return(redirect(url_for("index")))

@cg_app.route("/accountsettings", methods=['GET', 'POST'])
def accountSettings():
    if request.method == 'POST':
        new_username = request.form.get("edit-profile-username-input")
        new_email = request.form.get("edit-profile-email-input")
        new_password = request.form.get("confirm-pw-input")
        user = Users.query.filter_by(email=session["email"]).first()

        if(user.username != new_username):
            user.username = new_username
            db.session.commit()
        if(user.email != new_email):
            user.email = new_email
            session["email"] = new_email
            db.session.commit()
        if(new_password != "" and not bcrypt.check_password_hash(user.password, new_password)):
            user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
            db.session.commit()
        flash("Account successfully updated!", "info")
        return redirect(url_for("myCalendar"))
    else:
        return redirect(url_for("index"))

@cg_app.route("/settings", methods=['GET', 'POST'])
def settings():
    if request.method == 'POST':
        found_user = Users.query.filter_by(email=session["email"]).first()
        new_color_theme = request.form.get("color-theme-select")
        new_font_size = request.form.get("item-fontsize-select")

        found_user.color_theme = new_color_theme
        found_user.font_size = new_font_size
        db.session.commit()
        flash("Settings successfully updated!", "info")
        return redirect(url_for("myCalendar"))
    else:
        return redirect(url_for("index"))

@cg_app.route("/deleteaccount", methods=['GET', 'POST'])
def deleteAccount():
    if request.method == 'POST':
        user = Users.query.filter_by(email=session["email"]).first()
        # send account deleted notification email
        send_delete_account_email(user.email, user.username)

        userId = user.userId
        userTasks = Tasks.query.filter_by(userId=userId).all()
        userAssignments = Assignments.query.filter_by(userId=userId).all()
        userEvents = Events.query.filter_by(userId=userId).all()
        userCalendars = Calendars.query.filter_by(userId=userId).all()
        userCalGroups = Calendar_Groups.query.filter_by(userId=userId).all()

        for userData in userTasks+userAssignments+userEvents+userCalendars+userCalGroups:
            db.session.delete(userData)
            db.session.commit()

        
        db.session.delete(user)
        db.session.commit()
        session.clear()
        flash("Account successfully deleted.", "info")
        return redirect(url_for("index"))

    else:
        return redirect(url_for("index"))

@cg_app.route("/signout")
def signout():
    session.clear()
    flash("You have been successfully logged out.", "info")
    return redirect(url_for("index"))


# ----------------------------------- HELPER FUNCTIONS ----------------------------------- #


# commits item status changes to the database
# form input names for changed items: itemId-itemType, form input values: item status
def saveCalendarChanges(request, calVisibility=False):
    for key in request.form.keys():
        if(calVisibility):
            if(key!= "changed-calendars-vis-save-button"):
                changedCalendar = Calendars.query.filter_by(calId=key).first()
                changedCalendar.calVisible = request.form.get(key)
        else:
            if key != "displayed-date":
                itemId, itemType = key.split("-")
                itemId = int(itemId)
                itemStatus = request.form.get(key)

                if itemType == "task":
                    modifiedTask = Tasks.query.get(itemId)
                    modifiedTask.taskStatus = itemStatus
                elif itemType == "assignment":
                    modifiedAssignment = Assignments.query.get(itemId)
                    modifiedAssignment.assignmentStatus = itemStatus
                elif itemType == "event":
                    modifiedEvent = Events.query.get(itemId)
                    modifiedEvent.eventStatus = itemStatus
        db.session.commit()


# performs necessary queries and then renders either the index or myCalendar page depending on if a user is signed in
# Inputs: User object, str: month (1-12), str: year
def loadCalendar(user, month=datetime.now().month, year=datetime.now().year, demo_calendar=False):
    month = int(month)
    year = int(year)

    if demo_calendar:
        if "items" in session:
            # flash message only after a task is created, not every time the page is loaded
            if "displayedFlashId" in session:
                if session["displayedFlashId"] != session["demoItemId"]:
                    session["displayedFlashId"] = session["displayedFlashId"] + 1
                    flash("Items created are for demonstration only and will not be saved. Please sign up to save calendar items.", "message")
            return render_template("index.html",  tasks=[task for task in session["items"] if task["itemType"]=="task"], 
                                              assignments=[a for a in session["items"] if a["itemType"]=="assignment"], 
                                              events=[event for event in session["items"] if event["itemType"]=="event"], month=month, year=year)
        else:
            # automatically open About modal when the page is first opened
            if "visited" in session:
                return render_template("index.html",  tasks=[], assignments=[], events=[], month=month, year=year, visited="true")
            else:
                session["visited"] = "true"
                return render_template("index.html",  tasks=[], assignments=[], events=[], month=month, year=year, visited="false")
    else:
        user_calendar_groups = Calendar_Groups.query.filter_by(userId=user.userId).order_by(Calendar_Groups.calGroupId).all()
        user_calendars = Calendars.query.filter_by(userId=user.userId).order_by(Calendars.calGroupId).all()

        # previous month items
        prev_month = 12 if month == 1 else month-1
        prev_year = year-1 if month == 1 else year
        prev_tasks = Tasks.query.filter_by(userId=user.userId).filter(extract("year",Tasks.taskDueDate)==prev_year).filter(extract("month",Tasks.taskDueDate)==prev_month).all()
        prev_assignments = Assignments.query.filter_by(userId=user.userId).filter(extract("year",Assignments.assignmentDueDate)==prev_year).filter(extract("month",Assignments.assignmentDueDate)==prev_month).order_by(Assignments.assignmentDueTime).all()
        prev_events = Events.query.filter_by(userId=user.userId).filter(extract("year",Events.eventStartDate)==prev_year).filter(extract("month",Events.eventStartDate)==prev_month).order_by(Events.eventStartTime).all()
        # displayed month items
        tasks = Tasks.query.filter_by(userId=user.userId).filter(extract("year",Tasks.taskDueDate)==year).filter(extract("month",Tasks.taskDueDate)==month).all()
        assignments = Assignments.query.filter_by(userId=user.userId).filter(extract("year",Assignments.assignmentDueDate)==year).filter(extract("month",Assignments.assignmentDueDate)==month).order_by(Assignments.assignmentDueTime).all()
        events = Events.query.filter_by(userId=user.userId).filter(extract("year",Events.eventStartDate)==year).filter(extract("month",Events.eventStartDate)==month).order_by(Events.eventStartTime).all()
        # next month items
        next_month = 1 if month == 12 else month+1
        next_year = year+1 if month == 12 else year
        next_tasks = Tasks.query.filter_by(userId=user.userId).filter(extract("year",Tasks.taskDueDate)==next_year).filter(extract("month",Tasks.taskDueDate)==next_month).all()
        next_assignments = Assignments.query.filter_by(userId=user.userId).filter(extract("year",Assignments.assignmentDueDate)==next_year).filter(extract("month",Assignments.assignmentDueDate)==next_month).order_by(Assignments.assignmentDueTime).all()
        next_events = Events.query.filter_by(userId=user.userId).filter(extract("year",Events.eventStartDate)==next_year).filter(extract("month",Events.eventStartDate)==next_month).order_by(Events.eventStartTime).all()

        # color theme names
        color_themes = ["Light", "Dark", "Navy Luxe", "Click Classic"]
        return render_template("mycalendar.html", username=user.username, email=user.email, user_color_theme=user.color_theme, user_font_size=user.font_size, calendar_groups=user_calendar_groups, calendars=user_calendars, 
        tasks=prev_tasks+tasks+next_tasks, assignments=prev_assignments+assignments+next_assignments, events=prev_events+events+next_events, month=month, year=year, color_themes=color_themes)

"""
MySQL time format: HH:MM:SS, "Create Item" form time format: 12-hour AM/PM
This function uses python datetime to convert from form data AM/PM time to 24-hour time for MySQL database
Returns the converted 24-hour time as a string to enter into database
Inputs:
    twelveHour (str): hour from 01-12, format: HH
    minutes (str): minute from 00-60, format: MM
    timeIndicator (str): "AM" or "PM"
Outputs:
    twentyFourHour (str): the converted 24-hour time, format: HH:MM:00
"""
def twelveToTwentyFour(twelveHour, minutes, timeIndicator):
    due_datetime12_str = ':'.join([twelveHour, minutes]) + timeIndicator #HH:MMAM/PM
    due_datetime24_obj = datetime.strptime(due_datetime12_str, "%I:%M%p")  #24 hours
    return due_datetime24_obj.strftime("%H:%M:00")
