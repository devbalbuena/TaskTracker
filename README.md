# Advanced Todo List

## Overview
The Advanced Todo List is a full-stack web application built with Node.js, Express, and MySQL that allows multiple users to manage their personal tasks securely. It solves the problem of task management for individuals who need private, persistent, and organized to-do tracking with features like due dates, categories, sub-tasks, and a visual calendar — backed by a real database.

## Live Demo
Not yet deployed

## Screenshots
![Login Page](./screenshots/login.png)
![Main App](./screenshots/main.png)
![Dashboard](./screenshots/dashboard.png)

*(Add your screenshots to a /screenshots folder in the root)*

## Features

### 🔐 User Authentication
* User registration with username, email, and password.
* Secure login with bcrypt-hashed passwords.
* Session-based authentication (sessions persist for 7 days).
* Private task lists — each user only sees their own tasks.
* Logout functionality that destroys the session.

### ✅ Task Management
* Add new tasks with an optional due date and time.
* Create and manage sub-tasks (checklists) for each main task.
* Edit existing tasks' descriptions, categories, and due dates.
* Delete individual tasks.
* Toggle tasks between active and completed states.
* Bulk clear all completed tasks.

### 🗂️ Filtering and Views
* Organize tasks with customizable categories (General, Work, Personal, Urgent).
* Search bar to instantly filter tasks by text or category.
* Sorting options (Custom Order, Date Added, Due Date, Alphabetical).
* Filter tasks by status: All, Active, and Completed.
* Interactive Calendar view to browse tasks by date.
* Visual overdue indicators for tasks that are past their due dates.

### 💾 Data & Utility
* All tasks are persisted in a MySQL database — survive server restarts.
* Real-time statistics showing total, active, and completed task counts.
* Browser Push Notifications to alert you when a task becomes overdue.
* Email sharing feature to send a formatted list of active and completed tasks to a specified recipient.

### 🎨 User Interface
* Dark Mode / Theme Switcher to easily toggle between light and dark themes.
* Drag and Drop Reordering to manually arrange tasks exactly how you want them.
* Responsive design that works on desktop and mobile devices.
* Interactive modals for editing tasks and sending emails.
* Toast notifications for user actions (adding, deleting, error handling).

## Tech Stack

| Category       | Technology |
|----------------|------------|
| Frontend       | HTML5, JavaScript (ES6+) |
| Backend        | Node.js, Express.js |
| Database       | MySQL (via XAMPP) |
| Authentication | express-session, bcryptjs |
| Styling        | CSS3 (Vanilla), FontAwesome Icons |
| Runtime        | Node.js v20+ |
| Dev Tools      | nodemon |

## Project Structure

```text
Todolistsys/
├── server/                  # Backend Node.js/Express application
│   ├── index.js             # Express app entry point, middleware setup
│   ├── db.js                # MySQL connection pool
│   └── routes/
│       ├── auth.js          # POST /register, /login, /logout, GET /me
│       └── todos.js         # Full CRUD API for todos and reordering
├── public/                  # Frontend files served statically by Express
│   ├── index.html           # Login / Register page
│   ├── app.html             # Main Todo app (requires authentication)
│   ├── auth.js              # Login/register form logic
│   ├── script.js            # Main app logic (fetch-based, no localStorage)
│   └── styles.css           # All styles (app + auth page)
├── schema.sql               # MySQL database schema — run this first!
├── .env                     # Environment variables (DB creds, session secret)
├── package.json             # Node.js project manifest and scripts
└── README.md
```

## Database Schema

### `users`
| Column | Type | Description |
|---|---|---|
| `id` | INT (PK) | Auto-incremented user ID |
| `username` | VARCHAR(100) | Unique display name |
| `email` | VARCHAR(255) | Unique login email |
| `password_hash` | VARCHAR(255) | bcrypt hashed password |
| `created_at` | TIMESTAMP | Registration date |

### `todos`
| Column | Type | Description |
|---|---|---|
| `id` | INT (PK) | Auto-incremented task ID |
| `user_id` | INT (FK) | References `users.id` — task owner |
| `text` | TEXT | Task description |
| `category` | VARCHAR(50) | General / Work / Personal / Urgent |
| `completed` | TINYINT(1) | Completion status |
| `date_time` | DATETIME | Optional due date/time |
| `sort_order` | INT | Custom drag-and-drop position |
| `notified` | TINYINT(1) | Whether overdue notification was sent |
| `created_at` | TIMESTAMP | Creation date |

### `subtasks`
| Column | Type | Description |
|---|---|---|
| `id` | INT (PK) | Auto-incremented subtask ID |
| `todo_id` | INT (FK) | References `todos.id` |
| `text` | TEXT | Subtask description |
| `completed` | TINYINT(1) | Completion status |

## Local Setup Instructions

### Prerequisites
* [Node.js](https://nodejs.org) v20 or higher
* [XAMPP](https://www.apachefriends.org/) with **MySQL started** in the Control Panel
* A modern web browser (Chrome, Firefox, Edge, Safari)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/devbalbuena/TaskTracker.git
   cd TaskTracker
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   - Open XAMPP Control Panel and start **MySQL**
   - Open [phpMyAdmin](http://localhost/phpmyadmin)
   - Click **Import** and select the `schema.sql` file from the project root
   - Click **Go** to create the database and tables

4. **Configure environment variables**
   
   Edit the `.env` file in the project root:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=          # Leave blank if XAMPP default
   DB_NAME=todolistsys
   SESSION_SECRET=change_this_to_a_long_random_string
   PORT=3000
   ```

5. **Run the application**
   ```bash
   npm run dev       # Development mode (auto-restart on changes)
   # or
   npm start         # Production mode
   ```

6. **Open in your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) — you will see the Login/Register page.

### Environment Variables

Create or edit the `.env` file in the project root:

| Variable | Description |
|---|---|
| `DB_HOST` | MySQL host (usually `localhost`) |
| `DB_USER` | MySQL username (usually `root` for XAMPP) |
| `DB_PASSWORD` | MySQL password (usually empty for XAMPP) |
| `DB_NAME` | Name of the database (`todolistsys`) |
| `SESSION_SECRET` | A long, random secret key for encrypting sessions |
| `PORT` | Port the server listens on (default: `3000`) |

## Deployment

This is a Node.js + MySQL application. For deployment, you can use:

- **Backend**: [Railway](https://railway.app), [Render](https://render.com), or a VPS (DigitalOcean, AWS)
- **Database**: PlanetScale, Railway MySQL add-on, or any managed MySQL host
- **Steps**:
  1. Push code to GitHub
  2. Create a new web service pointing to your repo
  3. Set all environment variables from `.env` in the hosting dashboard
  4. The host will run `npm start` automatically

## Author
Dexter Balbuena
3rd Year IT Student — FSUU University
Open to freelance: Full-Stack · UI/UX · AI Projects

## License
MIT License
