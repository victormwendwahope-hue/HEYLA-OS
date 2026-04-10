from flask import Blueprint, request
from marshmallow import ValidationError
from datetime import datetime
from app.extensions import db
from app.models.networking import Post, Comment, Connection, Message
from app.schemas.networking_schema import PostSchema, CommentSchema, MessageSchema
from app.utils.helpers import success_response, error_response, paginate_query, get_pagination_params
from app.middleware.tenant import tenant_required

networking_bp = Blueprint("networking", __name__)
post_schema = PostSchema()
posts_schema = PostSchema(many=True)
comment_schema = CommentSchema()
comments_schema = CommentSchema(many=True)
message_schema = MessageSchema()
messages_schema = MessageSchema(many=True)


# ─── FEED / POSTS ─────────────────────────────────────────────────────────────

@networking_bp.route("/feed", methods=["GET"])
@tenant_required
def feed(org_id, current_user):
    page, per_page = get_pagination_params()
    query = Post.query.filter_by(organization_id=org_id).order_by(Post.created_at.desc())
    result = paginate_query(query, posts_schema, page, per_page)
    return success_response(result["items"], meta=result["meta"])


@networking_bp.route("/posts", methods=["POST"])
@tenant_required
def create_post(org_id, current_user):
    try:
        data = post_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    post = Post(
        organization_id=org_id,
        author_id=current_user.id,
        content=data["content"],
        media_urls=data.get("media_urls", []),
        visibility=data.get("visibility", "organization"),
    )
    db.session.add(post)
    db.session.commit()
    return success_response(post_schema.dump(post), "Post created", 201)


@networking_bp.route("/posts/<int:post_id>", methods=["GET"])
@tenant_required
def get_post(post_id, org_id, current_user):
    post = Post.query.filter_by(id=post_id, organization_id=org_id).first_or_404()
    return success_response(post_schema.dump(post))


@networking_bp.route("/posts/<int:post_id>", methods=["PUT"])
@tenant_required
def update_post(post_id, org_id, current_user):
    post = Post.query.filter_by(id=post_id, organization_id=org_id).first_or_404()
    if post.author_id != current_user.id and not current_user.has_role("admin"):
        return error_response("Not authorized", 403)
    data = request.json or {}
    if "content" in data:
        post.content = data["content"]
    if "media_urls" in data:
        post.media_urls = data["media_urls"]
    db.session.commit()
    return success_response(post_schema.dump(post), "Post updated")


@networking_bp.route("/posts/<int:post_id>", methods=["DELETE"])
@tenant_required
def delete_post(post_id, org_id, current_user):
    post = Post.query.filter_by(id=post_id, organization_id=org_id).first_or_404()
    if post.author_id != current_user.id and not current_user.has_role("admin"):
        return error_response("Not authorized", 403)
    db.session.delete(post)
    db.session.commit()
    return success_response(message="Post deleted")


@networking_bp.route("/posts/<int:post_id>/like", methods=["POST"])
@tenant_required
def like_post(post_id, org_id, current_user):
    post = Post.query.filter_by(id=post_id, organization_id=org_id).first_or_404()
    post.likes_count = (post.likes_count or 0) + 1
    db.session.commit()
    return success_response({"likes_count": post.likes_count})


@networking_bp.route("/posts/<int:post_id>/pin", methods=["PUT"])
@tenant_required
def pin_post(post_id, org_id, current_user):
    if not current_user.has_role("admin") and not current_user.has_role("manager"):
        return error_response("Not authorized", 403)
    post = Post.query.filter_by(id=post_id, organization_id=org_id).first_or_404()
    post.is_pinned = not post.is_pinned
    db.session.commit()
    return success_response({"is_pinned": post.is_pinned})


# ─── COMMENTS ─────────────────────────────────────────────────────────────────

@networking_bp.route("/posts/<int:post_id>/comments", methods=["GET"])
@tenant_required
def list_comments(post_id, org_id, current_user):
    page, per_page = get_pagination_params()
    post = Post.query.filter_by(id=post_id, organization_id=org_id).first_or_404()
    query = Comment.query.filter_by(post_id=post_id).order_by(Comment.created_at.asc())
    result = paginate_query(query, comments_schema, page, per_page)
    return success_response(result["items"], meta=result["meta"])


@networking_bp.route("/posts/<int:post_id>/comments", methods=["POST"])
@tenant_required
def create_comment(post_id, org_id, current_user):
    post = Post.query.filter_by(id=post_id, organization_id=org_id).first_or_404()
    try:
        data = comment_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    comment = Comment(post_id=post_id, author_id=current_user.id, content=data["content"])
    db.session.add(comment)
    db.session.commit()
    return success_response(comment_schema.dump(comment), "Comment added", 201)


@networking_bp.route("/comments/<int:comment_id>", methods=["DELETE"])
@tenant_required
def delete_comment(comment_id, org_id, current_user):
    comment = Comment.query.get_or_404(comment_id)
    if comment.author_id != current_user.id and not current_user.has_role("admin"):
        return error_response("Not authorized", 403)
    db.session.delete(comment)
    db.session.commit()
    return success_response(message="Comment deleted")


# ─── CONNECTIONS ──────────────────────────────────────────────────────────────

@networking_bp.route("/connections", methods=["GET"])
@tenant_required
def list_connections(org_id, current_user):
    connections = Connection.query.filter(
        db.or_(
            Connection.requester_id == current_user.id,
            Connection.addressee_id == current_user.id,
        ),
        Connection.status == "accepted",
    ).all()
    return success_response([
        {
            "id": c.id,
            "user_id": c.addressee_id if c.requester_id == current_user.id else c.requester_id,
            "status": c.status,
            "created_at": c.created_at.isoformat(),
        }
        for c in connections
    ])


@networking_bp.route("/connections/request", methods=["POST"])
@tenant_required
def request_connection(org_id, current_user):
    addressee_id = request.json.get("user_id")
    if not addressee_id:
        return error_response("user_id required", 400)
    existing = Connection.query.filter_by(
        requester_id=current_user.id, addressee_id=addressee_id
    ).first()
    if existing:
        return error_response("Connection request already sent", 409)
    conn = Connection(requester_id=current_user.id, addressee_id=addressee_id)
    db.session.add(conn)
    db.session.commit()
    return success_response({"id": conn.id, "status": conn.status}, "Connection requested", 201)


@networking_bp.route("/connections/<int:conn_id>/accept", methods=["PUT"])
@tenant_required
def accept_connection(conn_id, org_id, current_user):
    conn = Connection.query.filter_by(id=conn_id, addressee_id=current_user.id).first_or_404()
    conn.status = "accepted"
    db.session.commit()
    return success_response({"id": conn.id, "status": conn.status}, "Connection accepted")


# ─── MESSAGES ─────────────────────────────────────────────────────────────────

@networking_bp.route("/messages", methods=["GET"])
@tenant_required
def list_messages(org_id, current_user):
    page, per_page = get_pagination_params()
    other_user_id = request.args.get("user_id", type=int)
    query = Message.query.filter(
        Message.organization_id == org_id,
        db.or_(
            Message.sender_id == current_user.id,
            Message.recipient_id == current_user.id,
        ),
    )
    if other_user_id:
        query = query.filter(
            db.or_(
                db.and_(Message.sender_id == current_user.id, Message.recipient_id == other_user_id),
                db.and_(Message.sender_id == other_user_id, Message.recipient_id == current_user.id),
            )
        )
    query = query.order_by(Message.created_at.asc())
    result = paginate_query(query, messages_schema, page, per_page)
    return success_response(result["items"], meta=result["meta"])


@networking_bp.route("/messages", methods=["POST"])
@tenant_required
def send_message(org_id, current_user):
    try:
        data = message_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    msg = Message(
        organization_id=org_id,
        sender_id=current_user.id,
        recipient_id=data["recipient_id"],
        content=data["content"],
    )
    db.session.add(msg)
    db.session.commit()
    return success_response(message_schema.dump(msg), "Message sent", 201)


@networking_bp.route("/messages/<int:msg_id>/read", methods=["PUT"])
@tenant_required
def mark_read(msg_id, org_id, current_user):
    msg = Message.query.filter_by(id=msg_id, recipient_id=current_user.id).first_or_404()
    msg.is_read = True
    msg.read_at = datetime.utcnow()
    db.session.commit()
    return success_response(message_schema.dump(msg), "Message marked as read")
