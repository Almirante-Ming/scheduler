from sqlalchemy import Column, Integer, String, Text, Date, JSON, Enum
from sqlalchemy.orm import relationship
from lumus.models.base import BaseModel
from lumus.config.database import db
import enum


class RepeatType(enum.Enum):
    NONE = "none"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class BookingStatus(enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"


class Schedule(BaseModel):
    __tablename__ = 'schedules'
    
    date = Column(Date, nullable=False, index=True)
    times = Column(JSON, nullable=False)
    user_name = Column(String(100), nullable=False)
    course_code = Column(String(50), nullable=False, index=True)
    annotation = Column(Text)
    
    repeat_type = Column(Enum(RepeatType), default=RepeatType.NONE)
    lab_nickname = Column(String(10), nullable=False, index=True)
    
    status = Column(Enum(BookingStatus), default=BookingStatus.CONFIRMED)
    
    user_id = Column(String(50), index=True)
    
    def __repr__(self):
        return f"<Schedule(id={self.id}, date={self.date}, lab={self.lab_nickname})>"
    
    def to_dict(self):
        result = super().to_dict()
        
        if self.date:
            result['date'] = self.date.isoformat()
        
        if self.repeat_type:
            result['repeat_type'] = self.repeat_type.value
        if self.status:
            result['status'] = self.status.value
            
        if isinstance(self.times, str):
            import json
            result['times'] = json.loads(self.times)
        
        return result
    
    @classmethod
    def get_by_date(cls, date):
        return cls.query.filter_by(date=date).all()
    
    @classmethod
    def get_by_date_range(cls, start_date, end_date):
        return cls.query.filter(
            cls.date >= start_date,
            cls.date <= end_date
        ).all()
    
    @classmethod
    def get_by_lab(cls, lab_nickname, start_date=None, end_date=None):
        query = cls.query.filter_by(lab_nickname=lab_nickname)
        
        if start_date:
            query = query.filter(cls.date >= start_date)
        if end_date:
            query = query.filter(cls.date <= end_date)
            
        return query.all()
    
    @classmethod
    def get_by_user(cls, user_id):
        return cls.query.filter_by(user_id=user_id).all()
    
    @classmethod
    def check_conflict(cls, date, times, lab_nickname, exclude_id=None):
        query = cls.query.filter_by(
            date=date,
            lab_nickname=lab_nickname,
            status=BookingStatus.CONFIRMED
        )
        
        if exclude_id:
            query = query.filter(cls.id != exclude_id)
        
        existing_bookings = query.all()
        
        for booking in existing_bookings:
            if isinstance(booking.times, str):
                import json
                booking_times = json.loads(booking.times)
            else:
                booking_times = booking.times
            
            if set(times) & set(booking_times):
                return True, booking
        
        return False, None
