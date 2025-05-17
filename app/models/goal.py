# app/models/goal.py
from app import db
from datetime import datetime

class Goal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', name='fk_goal_user'), nullable=False)  # Fixed
    # Goal progress records
    progresses = db.relationship('Progress', backref='goal', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Goal {self.title}>'


class Progress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('goal.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', name='fk_progress_user'), nullable=False)  # Fixed
    date = db.Column(db.Date, default=datetime.utcnow().date)
    status = db.Column(db.String(10), default='incomplete')  # 'complete', 'partial', 'incomplete'
    notes = db.Column(db.Text, nullable=True)
    
    def __repr__(self):
        return f'<Progress {self.goal_id} on {self.date}: {self.status}>'