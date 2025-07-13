
from flask import Flask
from .auth import auth_bp
from .user import user_bp
from .course import course_bp
from .student import student_bp
from .schedule import schedule_bp
from .lab import lab_bp


def register_blueprints(app: Flask):
    """Register all blueprints with the Flask app"""
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(course_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(schedule_bp)
    app.register_blueprint(lab_bp)


__all__ = [
    'register_blueprints',
    'auth_bp',
    'user_bp',
    'course_bp',
    'student_bp',
    'schedule_bp',
    'lab_bp'
]
