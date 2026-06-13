# Advanced Todo List

## Overview
The Advanced Todo List is a feature-rich, client-side web application designed to help users efficiently manage their daily tasks. Built for individuals needing a simple yet powerful task management tool, it solves the problem of organizing tasks with due dates, categorized views, and a visual calendar without needing a complex backend.

## Live Demo
Not yet deployed

## Screenshots
![Main Page](./screenshots/main.png)
![Dashboard](./screenshots/dashboard.png)

*(Add your screenshots to a /screenshots folder in the root)*

## Features

### Task Management
* Add new tasks with an optional due date and time.
* Create and manage sub-tasks (checklists) for each main task.
* Edit existing tasks' descriptions, categories, and due dates.
* Delete individual tasks.
* Toggle tasks between active and completed states.
* Bulk clear all completed tasks.

### Filtering and Views
* Organize tasks with customizable categories (General, Work, Personal, Urgent).
* Search bar to instantly filter tasks by text.
* Sorting options (Custom Order, Date Added, Due Date, Alphabetical).
* Filter tasks by status: All, Active, and Completed.
* Interactive Calendar view to browse tasks by date.
* Visual overdue indicators for tasks that are past their due dates.

### Data & Utility
* Local Storage persistence to save tasks across browser sessions.
* Real-time statistics showing total, active, and completed task counts.
* Browser Push Notifications to alert you when a task becomes overdue.
* Email sharing feature to send a formatted list of active and completed tasks to a specified recipient.

### User Interface
* Dark Mode / Theme Switcher to easily toggle between light and dark themes.
* Drag and Drop Reordering to manually arrange tasks exactly how you want them.
* Responsive design that works on desktop and mobile devices.
* Interactive modals for editing tasks and sending emails.
* Toast notifications for user actions (adding, deleting, error handling).

## Tech Stack

| Category       | Technology |
|----------------|------------|
| Frontend       | HTML5, JavaScript (ES6+) |
| Styling        | CSS3 (Vanilla), FontAwesome Icons |
| Data Storage   | Local Storage (Browser API) |

## Project Structure

```text
/
├── index.html   # Main application structure, layout, and modals
├── script.js    # Core application logic, event handling, and state management
└── styles.css   # Custom styling, animations, and responsive design rules
```

## Local Setup Instructions

### Prerequisites
* A modern web browser (e.g., Chrome, Firefox, Safari, Edge).

### Installation Steps
1. Clone or download the source code to your local machine.
2. Open the project folder.
3. Since this is a vanilla frontend application, you can simply open the `index.html` file directly in your web browser. 
   *(Alternatively, you can serve it using a local development server like VS Code Live Server, XAMPP, or Python's HTTP server).*

## Deployment
As a static web application, it can be deployed for free on any static hosting platform. You can simply upload the `index.html`, `styles.css`, and `script.js` files to services like GitHub Pages, Vercel, or Netlify.

## Author
Dexter Balbuena
3rd Year IT Student — FSUU University
Open to freelance: Full-Stack · UI/UX · AI Projects

## License
MIT License
