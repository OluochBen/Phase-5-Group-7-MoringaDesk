from marshmallow import Schema, fields, validate

class SolutionSchema(Schema):
    id = fields.Int(dump_only=True)
    question_id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    content = fields.Str(required=True, validate=validate.Length(min=1))
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    author = fields.Nested('UserSchema', dump_only=True)
    vote_count = fields.Int(dump_only=True)
    upvotes = fields.Int(dump_only=True)
    downvotes = fields.Int(dump_only=True)

class SolutionCreateSchema(Schema):
    content = fields.Str(required=True, validate=validate.Length(min=1))
