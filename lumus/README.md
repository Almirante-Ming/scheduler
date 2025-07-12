# Lumus - Laboratory Scheduler API

A Flask-based REST API for managing laboratory schedules, courses (turmas), students, and users.

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
│   │   ├── course.py       # Turma (class/course) model
│   │   ├── student.py     # Student model
│   │   └── user.py     # User model
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

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lumus
   ```

2. **Create virtual environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -e .
   ```

4. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```
   FLASK_ENV=development
   SECRET_KEY=your-secret-key-here
   JWT_SECRET_KEY=your-jwt-secret-key-here
   DATABASE_URL=sqlite:///lumus.db
   ```

5. **Initialize database**
   ```bash
   flask --app app.py db init
   flask --app app.py db migrate -m "Initial migration"
   flask --app app.py db upgrade
   ```

6. **Run the application**
   ```bash
   flask --app app.py run --debug
   ```

## Development

### Database Operations
```bash
# Create migration
flask --app app.py db migrate -m "Description"

# Apply migration
flask --app app.py db upgrade

# Downgrade migration
flask --app app.py db downgrade
```

### Creating an Admin User
```python
from app import create_app
from lumus.models.usuario import Usuario

app = create_app()
with app.app_context():
    admin = Usuario.create_admin(
        name="Admin User",
        email="admin@example.com",
        password="admin123"
    )
    print(f"Admin user created: {admin.email}")
```

## Configuration

The application uses a configuration class system:

- `Config`: Base configuration
- `DevelopmentConfig`: Development-specific settings
- `ProductionConfig`: Production-specific settings
- `TestingConfig`: Testing-specific settings

Configuration is loaded from environment variables and defaults.

## Security

- JWT tokens for authentication
- Password hashing with werkzeug
- CORS support for cross-origin requests
- Role-based access control
- Input validation and sanitization

## API Documentation

For complete API documentation with all endpoints, request/response examples, and TypeScript interfaces, see the frontend documentation at `../umbra/src/data/api-documentation.md`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions and support, please contact the development team.
