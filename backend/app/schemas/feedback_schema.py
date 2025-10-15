from marshmallow import Schema, fields, validate

FEEDBACK_TYPES = ("bug", "feature")
FEEDBACK_STATUSES = ("open", "reviewing", "resolved", "closed")
FEEDBACK_PRIORITIES = ("low", "normal", "high")


class FeedbackSchema(Schema):
    id = fields.Int(dump_only=True)
    feedback_type = fields.Str(required=True, validate=validate.OneOf(FEEDBACK_TYPES))
    title = fields.Str(required=True)
    description = fields.Str(required=True)
    priority = fields.Str(validate=validate.OneOf(FEEDBACK_PRIORITIES))
    status = fields.Str(validate=validate.OneOf(FEEDBACK_STATUSES))
    contact_name = fields.Str()
    contact_email = fields.Email(allow_none=True)
    user_id = fields.Int(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class FeedbackCreateSchema(Schema):
    feedback_type = fields.Str(required=True, validate=validate.OneOf(FEEDBACK_TYPES))
    title = fields.Str(required=True, validate=validate.Length(min=3, max=200))
    description = fields.Str(required=True, validate=validate.Length(min=10))
    priority = fields.Str(missing="normal", validate=validate.OneOf(FEEDBACK_PRIORITIES))
    contact_name = fields.Str(validate=validate.Length(max=100), allow_none=True)
    contact_email = fields.Email(allow_none=True)


class FeedbackUpdateSchema(Schema):
    status = fields.Str(validate=validate.OneOf(FEEDBACK_STATUSES))
    priority = fields.Str(validate=validate.OneOf(FEEDBACK_PRIORITIES))
