# 🎓 AUS Tutoring Center Platform — Web Application

An end-to-end tutoring platform designed and developed as the final project for **COE 420: Software Engineering** at the **American University of Sharjah**. This system streamlines access to academic support by enabling students to book sessions, communicate with tutors, and manage tutoring activities — all through a responsive and intuitive web interface.

---

## 🧠 Project Summary

The AUS Tutoring Center Platform was built to address student difficulties in accessing tutoring services across departments. It allows students to browse and book tutoring sessions, apply to become tutors, and interact with tutors through a secure messaging and session management system. Tutors can mark attendance, create sessions, and view performance feedback, while admins review tutor applications.

The backend was developed with **Node.js** and **MongoDB**, and the frontend with **HTML**, **CSS**, and **Bootstrap**. The platform adheres to object-oriented design principles and is built for scalability and ease of use.

---
## 🗂 Folder Structure

```plaintext
📁 Tutoring-Center/
├── 📁 .vscode/           # Editor settings and launch configurations
├── 📁 node_modules/      # Installed dependencies (auto-generated)
├── 📁 public/            # Static assets (CSS, JS, images)
├── 📁 server/            # Backend server logic and API routes
├── 📁 tests/             # Unit and integration tests
├── 📁views/              # HTML templates (rendered by the server)
│
├── .env                  # Environment variables (e.g., DB URI, secrets)
├── .gitignore            # Git ignored files and folders
├── app.js                # Main application entry point
├── package.json          # Project metadata and dependencies
├── package-lock.json     # Exact dependency versions
├── server.js             # Server configuration and initialization
└── README.md             # This file
```
---

## 🖥️ Core Features

- **🧑‍🎓 Student Capabilities**
  - Browse available tutoring sessions with advanced filters
  - Book, view, or cancel sessions (with 24-hour restriction)
  - Apply to become a tutor (grade validation included)
  - View/edit profile and academic standing
  - Upload documents and rate sessions

- **👨‍🏫 Tutor Capabilities**
  - Create/manage tutoring sessions (group or individual)
  - Track and mark attendance
  - Communicate with students via secure messaging
  - View course-specific session feedback

- **🛠️ Admin Features**
  - Review tutor applications with validation
  - Approve/reject candidates with notifications

- **📬 Communication**
  - Messaging system with Google Drive link sharing
  - Email reminders and calendar invites for booked sessions

---

## 💾 Technical Overview

| Layer     | Technologies Used           |
|---------- |-----------------------------|
| Frontend  | HTML, CSS, Bootstrap        |
| Backend   | Node.js (Express.js)        |
| Database  | MongoDB                     |
| Design    | Object-Oriented Design, MVC |
| Testing   | Unit + Integration Testing  |

---

## 🎨 GUI Highlights

- **Homepage** — Simplified access to primary actions with notification panel  
- **Browse Sessions** — Clean card layout with real-time filtering  
- **Bookings Management** — Table layout with action buttons for join/cancel  
- **Tutor Application** — Streamlined form with dropdowns and validations  
- **Session Page** — Upload/view/delete docs, interact with tutor  
- **Admin Panel** — Full tutor application review and action options  

---

## 📋 Functional Requirements (Highlights)

| ID  | Requirement                      |
|-----|----------------------------------|
| R1  | Apply to be a Tutor              |
| R2  | Rate Tutoring Sessions           |
| R5  | Browse & Book Sessions           |
| R8  | Cancel Booking                   |
| R10 | Create & Remove Sessions         |
| R12 | In-app Messaging                 |
| R13 | Attendance Tracking              |
| R14 | Email + Calendar Reminders       |

---

## 🧪 Testing

- **✅ Unit Testing**  
  Verified logic for user authentication, booking workflows, and session control

- **✅ Integration Testing**  
  Tested end-to-end API endpoints:
  - `/login`
  - `/api/unbooked-sessions`
  - `/api/book-session`
  - `/api/cancel-booking`

- **🟢 All 8 test cases passed**  

---

## 👥 Team Contributions

**Mohammad Arfan Ameen**
**Ahmad Wahba**
**Sean Timothy Arquero**
**Muhammad Siddiqui**

---
