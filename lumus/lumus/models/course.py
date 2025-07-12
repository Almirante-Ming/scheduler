from sqlalchemy import Column, String, Integer, Text
from sqlalchemy.orm import relationship
from lumus.models.base import BaseModel
from lumus.config.database import db


class Course(BaseModel):
    __tablename__ = 'courses'
    
    name = Column(String(100), nullable=False)
    nickname = Column(String(20), nullable=False, unique=True, index=True)
    course_code = Column(String(50), nullable=False, index=True)
    period = Column(String(20), nullable=False)
    
    capacity = Column(Integer, default=30)
    
    description = Column(Text)
    
    students = relationship("Student", back_populates="course", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Course(id={self.id}, name={self.name}, nickname={self.nickname})>"
    
    def to_dict(self, include_students=False):
        result = super().to_dict()
        
        if include_students:
            result['students'] = [student.to_dict() for student in self.students]
        
        return result
    
    @classmethod
    def get_by_nickname(cls, nickname):
        return cls.query.filter_by(nickname=nickname).first()
    
    @classmethod
    def get_by_course_code(cls, course_code):
        return cls.query.filter_by(course_code=course_code).all()
    
    @classmethod
    def get_by_period(cls, period):
        return cls.query.filter_by(period=period).all()
    
    @classmethod
    def search(cls, query_string):
        return cls.query.filter(
            (cls.name.ilike(f'%{query_string}%')) |
            (cls.nickname.ilike(f'%{query_string}%')) |
            (cls.course_code.ilike(f'%{query_string}%'))
        ).all()
    
    def get_student_count(self):
        return len(self.students)
    
    def is_at_capacity(self):
        return len(self.students) >= self.capacity
    
    def get_available_slots(self):
        return max(0, self.capacity - len(self.students))
    
    def add_student(self, student):
        if self.is_at_capacity():
            raise ValueError(f"Course '{self.nickname}' is at maximum capacity")
        
        if student in self.students:
            raise ValueError(f"Student '{student.name}' is already enrolled in this course")
        
        self.students.append(student)
        db.session.commit()
        
        return student
    
    def remove_student(self, student):
        if student not in self.students:
            raise ValueError(f"Student '{student.name}' is not enrolled in this course")
        
        self.students.remove(student)
        db.session.commit()
        
        return student
    
    def get_students_by_name(self, name_query):
        return [student for student in self.students 
                if name_query.lower() in student.name.lower()]
    
    @classmethod
    def get_courses_with_availability(cls):
        return [course for course in cls.query.all() if not course.is_at_capacity()]
    
    @classmethod
    def bulk_create(cls, courses_data):
        courses = []
        for course_data in courses_data:
            course = cls(**course_data)
            courses.append(course)
        
        db.session.add_all(courses)
        db.session.commit()
        
        return courses
