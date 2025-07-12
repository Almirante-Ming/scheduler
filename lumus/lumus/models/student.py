from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from lumus.models.base import BaseModel
from lumus.config.database import db


class Student(BaseModel):
    __tablename__ = 'students'
    
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False, unique=True, index=True)
    
    course_id = Column(Integer, ForeignKey('courses.id'), nullable=False, index=True)
    course = relationship("Course", back_populates="students")
    
    phone = Column(String(20))
    registration_number = Column(String(20), unique=True, index=True)
    
    def __repr__(self):
        return f"<Student(id={self.id}, name={self.name}, email={self.email})>"
    
    def to_dict(self, include_course=False):
        result = super().to_dict()
        
        if include_course and self.course:
            result['course'] = {
                'id': self.course.id,
                'name': self.course.name,
                'nickname': self.course.nickname,
                'course_code': self.course.course_code,
                'period': self.course.period
            }
        
        return result
    
    @classmethod
    def get_by_email(cls, email):
        return cls.query.filter_by(email=email).first()
    
    @classmethod
    def get_by_course(cls, course_id):
        return cls.query.filter_by(course_id=course_id).all()
    
    @classmethod
    def get_by_course_code(cls, course_code):
        from lumus.models.course import Course
        return cls.query.join(Course).filter(Course.course_code == course_code).all()
    
    @classmethod
    def search(cls, query_string):
        return cls.query.filter(
            (cls.name.ilike(f'%{query_string}%')) |
            (cls.email.ilike(f'%{query_string}%'))
        ).all()
    
    @classmethod
    def get_by_registration_number(cls, registration_number):
        return cls.query.filter_by(registration_number=registration_number).first()
    
    def transfer_to_course(self, new_course):
        if new_course.is_at_capacity():
            raise ValueError(f"Target course '{new_course.nickname}' is at capacity")
        
        old_course_id = self.course_id
        self.course_id = new_course.id
        db.session.commit()
        
        return {
            'student': self,
            'previous_course_id': old_course_id,
            'new_course_id': new_course.id
        }
    
    def get_schedules(self):
        from lumus.models.schedule import Schedule
        return Schedule.query.filter_by(
            course_code=self.course.course_code
        ).all()
    
    @classmethod
    def bulk_create(cls, students_data):
        students = []
        for student_data in students_data:
            student = cls(**student_data)
            students.append(student)
        
        db.session.add_all(students)
        db.session.commit()
        
        return students
