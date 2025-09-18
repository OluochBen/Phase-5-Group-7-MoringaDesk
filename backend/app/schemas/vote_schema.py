from marshmallow import Schema, fields, validate

class VoteSchema(Schema):
    id = fields.Int(dump_only=True)
    solution_id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    vote_type = fields.Str(validate=validate.OneOf(['up', 'down']))
    created_at = fields.DateTime(dump_only=True)

class VoteCreateSchema(Schema):
    vote_type = fields.Str(required=True, validate=validate.OneOf(['up', 'down']))
