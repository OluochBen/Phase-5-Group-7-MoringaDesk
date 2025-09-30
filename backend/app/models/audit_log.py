from datetime import datetime
from .. import db

class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = db.Column(db.Integer, primary_key=True)

    action = db.Column(db.String(100), nullable=False)   # e.g., "Question Deleted"
    target = db.Column(db.String(255), nullable=False)   # e.g., "How to hack passwords?"
    reason = db.Column(db.String(255), nullable=True)    # optional

    admin_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    admin_name = db.Column(db.String(100), nullable=False)

    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "action": self.action,
            "target": self.target,
            "reason": self.reason,
            "admin_id": self.admin_id,
            "admin_name": self.admin_name,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }
