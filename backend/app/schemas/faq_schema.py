from marshmallow import Schema, fields, validate

class FAQSchema(Schema):
    id = fields.Int(dump_only=True)
    question = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    answer = fields.Str(required=True, validate=validate.Length(min=1))
    category = fields.Str()
    tags = fields.List(fields.Str(), dump_only=True)
    view_count = fields.Int(dump_only=True)
    helpful_count = fields.Int(dump_only=True)
    created_by = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    creator = fields.Nested('UserSchema', dump_only=True)

class FAQCreateSchema(Schema):
    question = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    answer = fields.Str(required=True, validate=validate.Length(min=1))
    category = fields.Str(validate=validate.Length(min=1, max=100), missing="General")
    tags = fields.List(fields.Str(validate=validate.Length(min=1, max=50)), missing=list)
