# Lumus - Laboratory Scheduler API

A Flask-based REST API for managing laboratory schedules, courses , students, and users.

## Project Structure

```
lumus/
├── app.py                 # Main Flask application entry point
├── pyproject.toml         # Python project configuration
├── lumus/
│   ├── __init__.py
│   ├── config/
│   │   ├── __init__.py
│   │   ├── config.py      # Application configuration
│   │   └── database.py    # Database configuration
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py        # Base model with common functionality
│   │   ├── schedule.py    # Schedule model
│   │   ├── course.py       # course model
│   │   ├── student.py     # Student model
│   │   └── user.py     # user model
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py        # Authentication routes
│   │   └── user.py     # User management routes
│   └── utils/
│       ├── __init__.py
│       └── auth.py        # Authentication utilities
├── migrations/            # Database migrations
```

## Features

- **User Management**: Create, read, update, delete users with different roles (admin, user, student, professor)
- **Authentication**: JWT-based authentication with login/logout
- **Course Management**: Manage turmas (courses) with student enrollment
- **Student Management**: Handle student records and course assignments
- **Schedule Management**: Create and manage laboratory schedules
- **Database**: SQLite with SQLAlchemy ORM and Flask-Migrate for migrations

## Models

### Usuario (User)
- `id`: Primary key
- `name`: User's full name
- `email`: User's email (unique)
- `password_hash`: Hashed password
- `type`: User type (admin, user, student, professor)
- `phone`: Phone number
- `is_active`: Active status
- `last_login`: Last login timestamp
- `login_count`: Number of logins
- `profile_image`: Profile image URL
- `bio`: User biography

### Turma (Course/Class)
- `id`: Primary key
- `name`: Course name
- `nickname`: Short identifier
- `course`: Course code/identifier
- `period`: Academic period
- `description`: Course description
- `max_students`: Maximum enrollment
- `is_active`: Active status
- `professor_id`: Foreign key to Usuario
- `students`: Relationship to Student model

### Student
- `id`: Primary key
- `name`: Student's full name
- `email`: Student's email (unique)
- `phone`: Phone number
- `registration_number`: Student registration number
- `turma_id`: Foreign key to Turma
- `turma`: Relationship to Turma model

### Schedule
- `id`: Primary key
- `course`: Course identifier
- `lab_nickname`: Laboratory nickname
- `day_of_week`: Day of the week (0=Monday, 6=Sunday)
- `start_time`: Start time
- `end_time`: End time
- `repeat_type`: Repeat pattern (weekly, bi_weekly, monthly)
- `start_date`: Schedule start date
- `end_date`: Schedule end date
- `booking_status`: Booking status (available, booked, cancelled)
- `professor_id`: Foreign key to Usuario
- `notes`: Additional notes

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/refresh` - Refresh JWT token

### Users (Usuarios)
- `GET /api/usuarios` - List all users (with pagination and filtering)
- `POST /api/usuarios` - Create new user
- `GET /api/usuarios/{id}` - Get user by ID
- `PUT /api/usuarios/{id}` - Update user
- `DELETE /api/usuarios/{id}` - Delete user
- `POST /api/usuarios/{id}/activate` - Activate user
- `POST /api/usuarios/{id}/deactivate` - Deactivate user
- `POST /api/usuarios/{id}/promote` - Promote user to admin
- `POST /api/usuarios/{id}/demote` - Demote admin to user
- `GET /api/usuarios/search` - Search users by name or email
- `POST /api/usuarios/bulk` - Create multiple users