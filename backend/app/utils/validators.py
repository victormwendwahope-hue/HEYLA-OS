"""
Custom validators and sanitizers used across schemas and routes.
"""
import re
from marshmallow import ValidationError


def validate_phone(value: str):
    """Accept E.164 or local formats."""
    if value and not re.match(r"^\+?[\d\s\-().]{7,20}$", value):
        raise ValidationError("Invalid phone number format.")


def validate_positive(value):
    """Ensure a numeric value is positive."""
    if value is not None and float(value) < 0:
        raise ValidationError("Value must be zero or positive.")


def validate_future_date(value):
    """Ensure a date is in the future."""
    from datetime import date
    if value and value < date.today():
        raise ValidationError("Date must be in the future.")


def validate_date_range(start, end):
    """Ensure start date is before end date."""
    if start and end and start > end:
        raise ValidationError("Start date must be before end date.")


def sanitize_string(value: str) -> str:
    """Strip leading/trailing whitespace and collapse internal spaces."""
    if not isinstance(value, str):
        return value
    return " ".join(value.split())


def validate_slug(value: str):
    """Validate URL-safe slug format."""
    if not re.match(r"^[a-z0-9]+(?:-[a-z0-9]+)*$", value):
        raise ValidationError("Slug must be lowercase letters, numbers, and hyphens only.")
