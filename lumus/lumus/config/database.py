from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import MetaData


class Base(DeclarativeBase):
    metadata = MetaData(
        naming_convention={
            "ix": "ix_%(column_0_label)s",
            "uq": "uq_%(table_name)s_%(column_0_name)s",
            "ck": "ck_%(table_name)s_%(constraint_name)s",
            "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
            "pk": "pk_%(table_name)s"
        }
    )


db = SQLAlchemy(model_class=Base)


def init_db(app):
    db.init_app(app)
    
    with app.app_context():
        from lumus.models import (
            schedule, course, student, user
        )
        
        db.create_all()
        
        print("✅ Database tables created successfully")


def reset_db(app):
    with app.app_context():
        db.drop_all()
        db.create_all()
        print("🔄 Database reset completed")
