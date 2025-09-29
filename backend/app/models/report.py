from datetime import datetime
from .. import db

class Report(db.Model):
    __tablename__ = "reports"

    id = db.Column(db.Integer, primary_key=True)
    # who filed the report
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # what is being reported
    target_type = db.Column(db.String(50), nullable=False)  # "question" | "solution"
    target_id = db.Column(db.Integer, nullable=False)

    reason = db.Column(db.String(255), nullable=False)

    # "pending" | "resolved" | "dismissed"
    status = db.Column(db.String(20), default="pending", nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "target_type": self.target_type,
            "target_id": self.target_id,
            "reason": self.reason,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
