from app.extensions import db
from datetime import datetime


class Role(db.Model):
    __tablename__ = "roles"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    description = db.Column(db.String(255))
    permissions = db.Column(db.JSON, default=dict)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_roles = db.relationship("UserRole", back_populates="role")

    def __repr__(self):
        return f"<Role {self.name}>"


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(30))
    avatar_url = db.Column(db.String(500))
    is_active = db.Column(db.Boolean, default=True)
    is_owner = db.Column(db.Boolean, default=False)
    last_login = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("organization_id", "email", name="uq_org_user_email"),
    )

    organization = db.relationship("Organization", back_populates="users")
    user_roles = db.relationship("UserRole", back_populates="user", cascade="all, delete-orphan")
    settings = db.relationship("UserSettings", back_populates="user", uselist=False)
    posts = db.relationship("Post", back_populates="author", cascade="all, delete-orphan")
    messages_sent = db.relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def roles(self):
        return [ur.role for ur in self.user_roles]

    def has_role(self, role_name):
        return any(r.name == role_name for r in self.roles)

    def __repr__(self):
        return f"<User {self.email}>"


class UserRole(db.Model):
    __tablename__ = "user_roles"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey("roles.id"), nullable=False)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("user_id", "role_id", name="uq_user_role"),
    )

    user = db.relationship("User", back_populates="user_roles")
    role = db.relationship("Role", back_populates="user_roles")
