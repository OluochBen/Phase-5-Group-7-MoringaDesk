from marshmallow import Schema, fields, validate


class SubscriptionCreateSchema(Schema):
    email = fields.Email(required=True)
    source = fields.Str(validate=validate.Length(max=100), allow_none=True)
