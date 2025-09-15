from marshmallow import Schema, fields, validate

class NotificationSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    type = fields.Str(validate=validate.OneOf(['new_answer', 'vote', 'follow_update']))
    reference_id = fields.Int()
    is_read = fields.Bool()
    created_at = fields.DateTime(dump_only=True)
