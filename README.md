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
..* A large, simple calendar grid with a month-view.
..* ..* Today's date is indicated by a solid bar above it in the calendar grid. Clicking on a different day will automatically highlight it.
..* ..* Quickly toggle both to adjacent months and back to the current day with the buttons in the navbar. Also easily jump to different months and years by clicking on the calendar's month/year and using the date-jump dropdown menu. 
