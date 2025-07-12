from sqlalchemy import Column, String, Integer, DateTime, Boolean, Enum
from sqlalchemy.sql import func
from werkzeug.security import generate_password_hash, check_password_hash
from enum import Enum as PyEnum
from lumus.models.base import BaseModel
from lumus.config.database import db


class UserType(PyEnum):
    ADMIN = "admin"
    USER = "user"
    STUDENT = "student"
    PROFESSOR = "professor"


class User(BaseModel):
    __tablename__ = 'users'
    
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    
    type = Column(Enum(UserType), nullable=False, default=UserType.USER)
    
    phone = Column(String(20))
    is_active = Column(Boolean, default=True, nullable=False)
    
    last_login = Column(DateTime(timezone=True))
    login_count = Column(Integer, default=0)
    
    profile_image = Column(String(255))
    bio = Column(String(500))
    
    def __repr__(self):
        return f"<User(id={self.id}, name={self.name}, email={self.email}, type={self.type})>"
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self, include_sensitive=False):
        result = super().to_dict()
        
        result['type'] = self.type.value
        
        if self.last_login:
            result['last_login'] = self.last_login.isoformat()
        
        if not include_sensitive:
            result.pop('password_hash', None)
        
        return result
    
    @classmethod
    def get_by_email(cls, email):
        return cls.query.filter_by(email=email).first()
    
    @classmethod
    def get_by_type(cls, user_type):
        return cls.query.filter_by(type=user_type).all()
    
    @classmethod
    def get_active_users(cls):
        return cls.query.filter_by(is_active=True).all()
    
    @classmethod
    def get_admins(cls):
        return cls.query.filter_by(type=UserType.ADMIN).all()
    
    @classmethod
    def search(cls, query_string):
        return cls.query.filter(
            (cls.name.ilike(f'%{query_string}%')) |
            (cls.email.ilike(f'%{query_string}%'))
        ).all()
    
    def is_admin(self):
        return self.type == UserType.ADMIN
    
    def is_professor(self):
        return self.type == UserType.PROFESSOR
    
    def is_student(self):
        return self.type == UserType.STUDENT
    
    def activate(self):
        self.is_active = True
        db.session.commit()
    
    def deactivate(self):
        self.is_active = False
        db.session.commit()
    
    def update_last_login(self):
        self.last_login = func.now()
        self.login_count += 1
        db.session.commit()
    
    def change_password(self, new_password):
        self.set_password(new_password)
        db.session.commit()
    
    def promote_to_admin(self):
        self.type = UserType.ADMIN
        db.session.commit()
    
    def demote_from_admin(self):
        self.type = UserType.USER
        db.session.commit()
    
    @classmethod
    def create_admin(cls, name, email, password):
        admin = cls(
            name=name,
            email=email,
            type=UserType.ADMIN,
            is_active=True
        )
        admin.set_password(password)
        db.session.add(admin)
        db.session.commit()
        return admin
    
    @classmethod
    def bulk_create(cls, usuarios_data):
        usuarios = []
        for usuario_data in usuarios_data:
            password = usuario_data.pop('password', None)
            
            usuario = cls(**usuario_data)
            if password:
                usuario.set_password(password)
            
            usuarios.append(usuario)
        
        db.session.add_all(usuarios)
        db.session.commit()
        
        return usuarios
    
    def get_permissions(self):
        permissions = {
            UserType.ADMIN: [
                'create_user', 'read_user', 'update_user', 'delete_user',
                'create_turma', 'read_turma', 'update_turma', 'delete_turma',
                'create_student', 'read_student', 'update_student', 'delete_student',
                'create_schedule', 'read_schedule', 'update_schedule', 'delete_schedule',
                'manage_bookings', 'manage_labs', 'system_settings'
            ],
            UserType.PROFESSOR: [
                'read_user', 'update_own_profile',
                'read_turma', 'update_turma',
                'read_student', 'update_student',
                'create_schedule', 'read_schedule', 'update_schedule',
                'manage_bookings', 'read_labs'
            ],
            UserType.USER: [
                'read_user', 'update_own_profile',
                'read_turma', 'read_student',
                'read_schedule', 'create_booking', 'read_booking',
                'read_labs'
            ],
            UserType.STUDENT: [
                'read_user', 'update_own_profile',
                'read_turma', 'read_student',
                'read_schedule', 'create_booking', 'read_booking',
                'read_labs'
            ]
        }
        
        return permissions.get(self.type, [])
