from marshmallow import Schema, fields, validate


class PostSchema(Schema):
    id = fields.Int(dump_only=True)
    organization_id = fields.Int(dump_only=True)
    author_id = fields.Int(dump_only=True)
    content = fields.Str(required=True, validate=validate.Length(min=1))
    media_urls = fields.List(fields.Str(), load_default=list)
    visibility = fields.Str(load_default="organization")
    likes_count = fields.Int(dump_only=True)
    is_pinned = fields.Bool(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class CommentSchema(Schema):
    id = fields.Int(dump_only=True)
    post_id = fields.Int(required=True)
    author_id = fields.Int(dump_only=True)
    content = fields.Str(required=True, validate=validate.Length(min=1))
    created_at = fields.DateTime(dump_only=True)


class MessageSchema(Schema):
    id = fields.Int(dump_only=True)
    organization_id = fields.Int(dump_only=True)
    sender_id = fields.Int(dump_only=True)
    recipient_id = fields.Int(required=True)
    content = fields.Str(required=True, validate=validate.Length(min=1))
    is_read = fields.Bool(dump_only=True)
    read_at = fields.DateTime(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
