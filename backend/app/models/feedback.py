from datetime import datetime

from .. import db


class Feedback(db.Model):
    __tablename__ = "feedback"

    id = db.Column(db.Integer, primary_key=True)
    feedback_type = db.Column(db.String(20), nullable=False)  # "bug" | "feature"
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    priority = db.Column(db.String(20), nullable=False, default="normal")
    status = db.Column(db.String(20), nullable=False, default="open")  # open | reviewing | resolved | closed
    contact_name = db.Column(db.String(100))
    contact_email = db.Column(db.String(255))
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    reporter = db.relationship("User", backref=db.backref("feedback_entries", lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "feedback_type": self.feedback_type,
            "title": self.title,
            "description": self.description,
            "priority": self.priority,
            "status": self.status,
            "contact_name": self.contact_name,
            "contact_email": self.contact_email,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
