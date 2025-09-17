from marshmallow import Schema, fields, validate

class QuestionSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    title = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    description = fields.Str(required=True, validate=validate.Length(min=1))
    problem_type = fields.Str(required=True, validate=validate.OneOf(['language', 'stage', 'technical', 'logical']))
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    author = fields.Nested('UserSchema', dump_only=True)
    solutions_count = fields.Int(dump_only=True)
    tags = fields.List(fields.Nested('TagSchema'), dump_only=True)
    follows_count = fields.Int(dump_only=True)

class QuestionCreateSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    description = fields.Str(required=True, validate=validate.Length(min=1))
    problem_type = fields.Str(required=True, validate=validate.OneOf(['language', 'stage', 'technical', 'logical']))
    tag_ids = fields.List(fields.Int(), missing=[])
