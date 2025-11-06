# Poros data service


This repo contains the PostgreSQL schema, seed data, and demo queries for the Poros app.


# Data Service (FastAPI + SQL)

This repository contains the **Data Service** for our project.
It provides an API layer that interacts with a SQL database to store and retrieve project data.
The service is built with **FastAPI** and **SQLAlchemy**, using **SQLite** for local development.
Other team members can extend this service by adding new models, routes, or connecting it to a production database later.

---

## 🚀 Overview

The data service is responsible for:

* Managing data storage and retrieval through RESTful API endpoints.
* Handling database operations (create, read, update, delete).
* Providing a consistent backend that other parts of the project (like the UI) can use.

---

## 🧱 Tech Stack

| Component      | Description                                             |
| -------------- | ------------------------------------------------------- |
| **FastAPI**    | Framework for building the REST API                     |
| **SQLAlchemy** | ORM (Object Relational Mapper) for database interaction |
| **SQLite**     | Lightweight SQL database (easy to run locally)          |
| **Uvicorn**    | ASGI server for running the app                         |

---

## 🗂 Project Structure

```
data-service/
├── main.py           # FastAPI application and routes
├── database.py       # Database connection setup
├── models.py         # SQLAlchemy models (tables)
├── requirements.txt  # Python dependencies
└── README.md         # Project documentation
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/data-service.git
cd data-service
```

### 2. Create a virtual environment (recommended)

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the server

```bash
uvicorn main:app --reload
```

Your API will now be running at:

> [http://127.0.0.1:8000](http://127.0.0.1:8000)
> Docs available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🧩 Database

* The default database is **SQLite** (stored locally as `data.db`).
* Tables are automatically created the first time the service runs.
* You can later switch to **PostgreSQL** or another SQL database by updating `DATABASE_URL` in `database.py`.

### Current Tables

| Table              | Description                           |
| ------------------ | ------------------------------------- |
| `users`            | Stores user account data              |
| `resumes`          | Stores resume details linked to users |
| `target_companies` | Stores company info linked to users   |

---

## 🧠 API Endpoints (Current)

### Root

`GET /` → Health check — confirms the API is running.

### Users

* `POST /users/` → Add a new user
* `GET /users/` → Get all users

### Companies

* `POST /companies/` → Add a new company
* `GET /companies/` → Get all companies

---

## 🔧 Example Usage

**Add a user**

```bash
POST /users/
{
  "email": "alice@example.com",
  "firstName": "Alice",
  "lastName": "Smith"
}
```

**List all users**

```bash
GET /users/
```

---

## 🧑‍💻 Contributing

When adding new features:

1. Create a new branch for your changes.
2. Update or add routes in `main.py`.
3. Add any new tables to `models.py`.
4. Update this README if needed (especially the API section).
5. Submit a pull request for review.

---

## 🧩 Next Steps for the Team

* Add authentication (JWT or OAuth)
* Add more database tables (e.g., job postings, applications)
* Integrate with the front-end UI
* Add test coverage with `pytest`

---

## 👥 Maintainers

**Team Poros — Data Service Component**
For questions, contact: *[Your Name]* (initial developer)
