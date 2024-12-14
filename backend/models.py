from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Enum, Boolean, ForeignKey, Date, Float, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.pool import StaticPool
from werkzeug.security import generate_password_hash, check_password_hash
import enum

Base = declarative_base()

class Priority(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Category(enum.Enum):
    WORK = "work"
    PERSONAL = "personal"
    SHOPPING = "shopping"
    URGENT = "urgent"


class BucketListStatus(enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"

class BucketList(Base):
    __tablename__ = 'bucket_lists'
    
    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    description = Column(String(1000))
    deadline = Column(DateTime)
    status = Column(Enum(BucketListStatus), default=BucketListStatus.NOT_STARTED)
    category = Column(Enum(Category), default=Category.PERSONAL)
    priority = Column(Enum(Priority), default=Priority.MEDIUM)
    progress = Column(Float, default=0.0)  # 0 to 100
    image_url = Column(String)
    inspiration_images = Column(JSON)
    tags = Column(JSON)
    reward = Column(String(200))
    steps = Column(JSON)
    motivation = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class HabitCompletion(Base):
    __tablename__ = 'habit_completions'
    
    id = Column(Integer, primary_key=True)
    habit_id = Column(Integer, ForeignKey('habits.id'), nullable=False)
    completed_date = Column(Date, nullable=False)
    count = Column(Integer, default=1)  # For habits that can be completed multiple times per day
    notes = Column(String(200))  # Optional notes for the completion
    
    habit = relationship("Habit", back_populates="completions")

class Task(Base):
    __tablename__ = 'tasks'
    
    id = Column(Integer, primary_key=True)
    title = Column(String(100), nullable=False)
    description = Column(String(500))
    category = Column(Enum(Category), default=Category.PERSONAL)
    priority = Column(Enum(Priority), default=Priority.MEDIUM)
    deadline = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed = Column(Boolean, default=False)

class Habit(Base):
    __tablename__ = 'habits'
    
    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(String)
    frequency = Column(String)
    category = Column(String)
    streak = Column(Integer, default=0)
    start_date = Column(DateTime)
    last_completed = Column(DateTime)
    reminder = Column(Boolean, default=False)
    target_count = Column(Integer, default=1)
    
    completions = relationship("HabitCompletion", back_populates="habit", cascade="all, delete-orphan")

# Database setup
engine = create_engine(
    'sqlite:///todo.db',
    connect_args={
        'timeout': 30,
        'check_same_thread': False
    },
    poolclass=StaticPool
)

Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)