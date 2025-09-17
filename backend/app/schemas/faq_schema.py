from marshmallow import Schema, fields, validate

class FAQSchema(Schema):
    id = fields.Int(dump_only=True)
    question = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    answer = fields.Str(required=True, validate=validate.Length(min=1))
    created_by = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    creator = fields.Nested('UserSchema', dump_only=True)

class FAQCreateSchema(Schema):
    question = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    answer = fields.Str(required=True, validate=validate.Length(min=1))
