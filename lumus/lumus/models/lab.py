from sqlalchemy import Column, Integer, String, Boolean, Text
from lumus.models.base import BaseModel


class Lab(BaseModel):
    """Lab model for laboratory management"""
    __tablename__ = 'labs'
    
    nickname = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    capacity = Column(Integer, nullable=False)
    location = Column(String(200))
    description = Column(Text)
    is_active = Column(Boolean, default=True, nullable=False)
    
    def __repr__(self):
        return f'<Lab {self.nickname}: {self.name}>'
    
    def to_dict(self):
        """Convert lab to dictionary"""
        created_at_str = None
        if hasattr(self, 'created_at') and self.created_at is not None:
            created_at_str = self.created_at.isoformat()
        
        updated_at_str = None
        if hasattr(self, 'updated_at') and self.updated_at is not None:
            updated_at_str = self.updated_at.isoformat()
        
        return {
            'id': self.id,
            'nickname': self.nickname,
            'name': self.name,
            'capacity': self.capacity,
            'location': self.location,
            'description': self.description,
            'is_active': self.is_active,
            'created_at': created_at_str,
            'updated_at': updated_at_str
        }
    
    @classmethod
    def get_by_nickname(cls, nickname):
        """Get lab by nickname"""
        return cls.query.filter_by(nickname=nickname).first()
    
    @classmethod
    def get_active_labs(cls):
        """Get all active labs"""
        return cls.query.filter_by(is_active=True).all()
    
    def get_active_bookings_count(self):
        """Get count of active bookings for this lab"""
        from lumus.models.schedule import Schedule
        return Schedule.query.filter_by(
            lab_nickname=self.nickname,
            status='CONFIRMED'
        ).count()
    
    def get_availability_for_date_range(self, start_date=None, end_date=None):
        """Get availability for a specific date range"""
        from lumus.models.schedule import Schedule
        
        query = Schedule.query.filter_by(
            lab_nickname=self.nickname,
            status='CONFIRMED'
        )
        
        if start_date:
            query = query.filter(Schedule.date >= start_date)
        if end_date:
            query = query.filter(Schedule.date <= end_date)
        
        return query.all()
