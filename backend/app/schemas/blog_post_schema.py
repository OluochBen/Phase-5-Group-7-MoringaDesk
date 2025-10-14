from marshmallow import Schema, fields, validate


ALLOWED_STATUSES = ("draft", "published")


class BlogPostSchema(Schema):
    id = fields.Int(dump_only=True)
    slug = fields.Str(required=True)
    title = fields.Str(required=True)
    excerpt = fields.Str()
    content = fields.Str()
    cover_image = fields.Str()
    status = fields.Str(validate=validate.OneOf(ALLOWED_STATUSES))
    published_at = fields.DateTime(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    author = fields.Nested("UserSchema", dump_only=True)


class BlogPostCreateSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=3, max=200))
    slug = fields.Str(validate=validate.Length(min=3, max=160))
    excerpt = fields.Str(validate=validate.Length(max=400))
    content = fields.Str(required=True, validate=validate.Length(min=20))
    cover_image = fields.Str(validate=validate.URL(relative=True, require_tld=False), allow_none=True)
    status = fields.Str(missing="draft", validate=validate.OneOf(ALLOWED_STATUSES))
    published_at = fields.DateTime(allow_none=True)
