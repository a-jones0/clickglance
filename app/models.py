from app import db

class Users(db.Model):
    userId = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)

    def __init__(self, username, email, password):
        self.username = username
        self.email = email
        self.password = password
    
    def __str__(self):
        return "username: "+ self.username + " email: " + self.email + " password: " + self.password

class Calendar_Groups(db.Model):
    __tablename__ = 'calendar_groups'
    calGroupId = db.Column(db.Integer, primary_key=True)
    userId = db.Column(db.Integer, db.ForeignKey('users.userId'), nullable=False)
    calGroupName = db.Column(db.String, nullable=False, unique=True)

    def __init__(self, userId, calGroupName):
        self.userId = userId
        self.calGroupName = calGroupName

class Calendars(db.Model):
    calId = db.Column(db.Integer, primary_key=True)
    calGroupId = db.Column(db.Integer, db.ForeignKey('calendar_groups.calGroupId'), nullable=False)
    userId = db.Column(db.Integer, db.ForeignKey('users.userId'), nullable=False)
    calName = db.Column(db.String, nullable=False, unique=True)
    calColor = db.Column(db.String, nullable=False)
    calVisible = db.Column(db.String, nullable=False)

    def __init__(self, calGroupId, userId, calName, calColor, calVisible):
        self.calGroupId = calGroupId
        self.userId = userId
        self.calName = calName
        self.calColor = calColor
        self.calVisible = calVisible
    
    def __str__(self):
        return "calId: "+str(self.calId)+" calGroupId: "+str(self.calGroupId)+" userId: "+str(self.userId)+" calName: "+self.calName+" calColor: "+self.calColor+" calVisible: "+self.calVisible

class Tasks(db.Model):
    taskId = db.Column(db.Integer, primary_key=True)
    userId = db.Column(db.Integer, db.ForeignKey('users.userId'), nullable=False)
    calId = db.Column(db.Integer, db.ForeignKey('calendars.calId'), nullable=False)
    taskTitle = db.Column(db.String, nullable=False)
    taskDueDate = db.Column(db.Date, nullable=False)
    taskNotes = db.Column(db.String)
    taskStatus = db.Column(db.String, nullable=False)

    def __init__(self, userId, calId, taskTitle, taskDueDate, taskNotes, taskStatus):
        self.userId = userId
        self.calId = calId
        self.taskTitle = taskTitle
        self.taskDueDate = taskDueDate
        self.taskNotes = taskNotes
        self.taskStatus = taskStatus

    def __str__(self):
        dictString = str([(key,value) if key!='_sa_instance_state' else ("itemType","task") for key,value in self.__dict__.items()])
        return dictString
        #return (f"NEW TASK \n User ID: {self.userId} \n calId: {self.calId} \n Title: {self.taskTitle} \n Due Date: {self.taskDueDate} \n Notes: {self.taskNotes} \n Status: {self.taskStatus} \n")

    def toDict(self):
        return {'itemType': 'task', 'taskId': self.taskId, 'userId': self.userId, 'calId': self.calId, 'taskTitle': self.taskTitle, 'taskDueDate': self.taskDueDate, 'taskNotes': self.taskNotes, 'taskStatus': self.taskStatus}

    def __getitem__(self, index):
        return [("itemType", "task"), ("userId", self.userId), ("calId",self.calId), ("taskTitle", self.taskTitle), ("taskDueDate", self.taskDueDate), ("taskNotes", self.taskNotes), ("taskStatus", self.taskStatus)][index]

class Assignments(db.Model):
    assignmentId = db.Column(db.Integer, primary_key=True)
    userId = db.Column(db.Integer, db.ForeignKey('users.userId'), nullable=False)
    calId = db.Column(db.Integer, db.ForeignKey('calendars.calId'), nullable=False)
    assignmentTitle = db.Column(db.String, nullable=False)
    assignmentDueDate = db.Column(db.Date, nullable=False)
    assignmentDueTime = db.Column(db.Time, nullable=False)
    assignmentNotes = db.Column(db.String)
    assignmentStatus = db.Column(db.String, nullable=False)

    def __init__(self, userId, calId, assignmentTitle, assignmentDueDate, assignmentDueTime, assignmentNotes, assignmentStatus):
        self.userId = userId
        self.calId = calId
        self.assignmentTitle = assignmentTitle
        self.assignmentDueDate = assignmentDueDate
        self.assignmentDueTime = assignmentDueTime
        self.assignmentNotes = assignmentNotes
        self.assignmentStatus = assignmentStatus
    
    def __str__(self):
        dictString = str([(key,value) if key!='_sa_instance_state' else ("itemType","assignment") for key,value in self.__dict__.items()])
        return dictString
        #return (f"NEW ASSIGNMENT \n User ID: {self.userId} \n calId: {self.calId} \n Title: {self.assignmentTitle} \n Due Date: {self.assignmentDueDate} \n Due Time: {self.assignmentDueTime} \n Notes: {self.assignmentNotes} \n Status: {self.assignmentStatus} \n")

    def __getitem__(self, index):
        return [("itemType", "assignment"), ("userId", self.userId), ("calId",self.calId), ("assignmentTitle", self.assignmentTitle), 
        ("assignmentDueDate", self.assignmentDueDate), ("assignmentDueTime", self.assignmentDueTime), ("assignmentNotes", self.assignmentNotes), ("assignmentStatus", self.assignmentStatus)][index]

class Events(db.Model):
    eventId = db.Column(db.Integer, primary_key=True)
    userId = db.Column(db.Integer, db.ForeignKey('users.userId'), nullable=False)
    calId = db.Column(db.Integer, db.ForeignKey('calendars.calId'), nullable=False)
    eventTitle = db.Column(db.String, nullable=False)
    eventStartDate = db.Column(db.Date, nullable=False)
    eventStartTime = db.Column(db.Time, nullable=False)
    eventEndDate = db.Column(db.Date, nullable=False)
    eventEndTime = db.Column(db.Time, nullable=False)
    eventNotes = db.Column(db.String)
    eventStatus = db.Column(db.String, nullable=False)

    def __init__(self, userId, calId, eventTitle, eventStartDate, eventStartTime, eventEndDate, eventEndTime, eventNotes, eventStatus):
        self.userId = userId
        self.calId = calId
        self.eventTitle = eventTitle
        self.eventStartDate = eventStartDate
        self.eventStartTime = eventStartTime
        self.eventEndDate = eventEndDate
        self.eventEndTime = eventEndTime
        self.eventNotes = eventNotes
        self.eventStatus = eventStatus

    def __str__(self):
        dictString = str([(key,value) if key!='_sa_instance_state' else ("itemType","event") for key,value in self.__dict__.items()])
        return dictString
        #return (f"NEW EVENT \n User ID: {self.userId} \n calId: {self.calId} \n Title: {self.eventTitle} \n Start Date: {self.eventStartDate} \n Start Time: {self.eventStartTime} \n End Date: {self.eventEndDate} \n End Time: {self.eventEndTime} \n Notes: {self.eventNotes} \n Status: {self.eventStatus} \n")

    def __getitem__(self, index):
        return [("itemType", "event"), ("userId", self.userId), ("calId",self.calId), ("eventTitle", self.eventTitle), 
        ("eventStartDate", self.eventStartDate), ("eventStartTime", self.eventStartTime),("eventEndDate", self.eventEndDate), ("eventEndTime", self.eventEndTime), 
        ("eventNotes", self.eventNotes), ("eventStatus", self.eventStatus)][index]