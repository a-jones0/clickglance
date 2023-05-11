# ClickGlance: A Calendar/To-Do List Web Application

## 1. Overview

ClickGlance is a simple calendar planner with to-do list capabilities. Inspired by Outlook Calendar, users can create items (tasks, assignments, and events) that will appear on a month-view calendar grid. Clicking on these items will cycle them through a list of possible statuses: Incomplete (default), High Priority, Complete, and Cancelled. Users can create multiple calendars to group their items, and multiple calendar groups to group their calendars.

## 2. Motivation

While studying in school, Outlook Calendar was my planning app of choice for a few key reasons (not the least of which being that it was what I used to set up my school email). It has a simple aesthetic, is easy to use, and has a good number of customization options. The main feature I wished existed was the ability to "check off" completed tasks on my calendar. Outlook calendar has a tasks feature, but it is still a calendar application, and the items on the calendar are technically "events" and not "tasks". I ended up using a hacky method to simulate this to-do feature (i.e. adding completed tasks to a "Completed" calendar that was formatted to have a checkmark symbol), but I still dreamed of an app that had such a feature.

Fast forward to a few months after finishing college, and I wanted to learn some web development skills to buff up my resume. Creating projects in order to learn has always been the most effective for me, so after throwing together a simple personal website, I began to work on ClickGlance! Although being able to check off items directly on the calendar was the main feature I wanted to incorporate, there were also other important features I wanted: 

* Large calendar view: Outlook calendar has a lot of sidebars and panels surrounding the calendar that shrink it. They can be minimized, but I wanted my app to have a calendar that took up as much space on the screen as possible.
* Different item types: Instead of having to set start and end dates/times for everything, I wanted the ability to create tasks (due date), assignments (due date and time), and events (start and end dates/times).
* Clear item status: It was essential that I could determine what items for the month are in progress, important, complete, or cancelled with just a quick glance (wink wink), so I wanted to visually make it clear what status an item was at any given point.

## 3. Features

* Calendar View
  * A large, simple calendar grid with a month-view.
    * Today's date is indicated by a solid bar above it in the calendar grid. Clicking on a different day will automatically highlight it.
    * Quickly toggle both to adjacent months and back to the current day with the buttons in the navbar. Also easily jump to different months and years by clicking on the calendar's "title" (i.e. month/year) and using the date-jump dropdown menu. 

* Item Types
  * Add tasks (due date), assignments (due date and time), and events (start date/time and end date/time) to your calendar.
  * All items in each day are ordered by type and then time (i.e. all tasks, then all assignments sorted by time, then all events sorted by start time).

* Quickly Toggle Item Statuses
  * Clicking on an item will visibily change its status. In order, the statuses are Incomplete, High Priority, Complete, and Cancelled.

* Calendar and Calendar Group Creation
  * Create custom calendars with their own names and colors to group your items; create calendar groups to group your calendars.

* Color Themes
  * Choose from a selection of color themes to give your page a personal touch - light and dark mode included!

## 4. Technologies
* Python 3.11.2
* Flask 2.2.3
* Werkzeug 2.2.3
* HTML
* CSS
* JavaScript
* MySQL & MySQL Workbench

## 5. Status
Although this project is technically complete and I don't have any immediate plans to continue working on it, there are quite a few features I would love to implement:

* Item View Pane
  * A side panel that lists all items for a certain day or for the month. User can filter what kinds of items are shown (e.g. only tasks and events or only assignments)

* Item Search
  * A search bar/pane that returns items with matching titles - clicking on the resulting title would change the calendar view to the item's assigned day.

* Micro Tasks
  * Smaller subtasks for "task" and "assignment" items, likely in some kind of toggleable dropdown so as not to take up too much screen real estate. 

* Weekly View
  * I've never been a fan of week-view layouts (I like being able to see the entire month laid out on the screen), but I know it's a must-have for most planner app users.

* Notifications & Email Reminders
  * On-screen notifications and email summaries for upcoming calendar items. Congratulatory emails for completed items (e.g. "You've completed 7 tasks, 10 assignments, and 2 events so far this month. Congrats!"

## 6. Sources
Before starting this project, I had minimal coding experience with HTML, CSS, and JavaScript from creating my website, and absolutely no experience using Flask or MySQL. I was only able to learn the skills needed to complete this project by watching videos and following tutorials, guides, and advice provided by countless generous people online. Although this is not a complete list of every page I visited or video I watched, here are the main resources I learned from:

* StackOverflow
* freeCodeCamp.org on YouTube
  * [Full Stack Web Development for Beginners (Full Course on HTML, CSS, JavaScript, Node.js, MongoDB)](https://youtu.be/nu_pCVPKzTk)
  * [Web Development with Python Tutorial – Flask & Dynamic Database-Driven Web Apps](https://youtu.be/yBDHkveJUf4)
* ColorCode on YouTube
  * [20 Things JavaScript Developers Should Know, but Probably Don't Playlist](https://youtube.com/playlist?list=PL1PqvM2UQiMoGNTaxFMSK2cih633lpFKP)
* Tech With Tim on YouTube
