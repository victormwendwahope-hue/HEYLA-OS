from flask import Blueprint, request
from app.utils.helpers import success_response, error_response
from app.middleware.tenant import tenant_required
import random

chat_bp = Blueprint("chat", __name__)

MOCK_RESPONSES = [
    "I can help you with that! Could you provide more details?",
    "Based on your data, I recommend reviewing the latest reports.",
    "That's a great question. Let me analyze your organization's metrics.",
    "I've processed your request. Here's what I found based on your data.",
    "I can assist with HR, accounting, inventory, and more. What would you like to explore?",
    "Sure! I'm HeyleyBot, your AI assistant. How can I help you today?",
    "I've checked your records. Everything looks good, but there are a few items worth reviewing.",
    "Let me look into that for you...",
]


@chat_bp.route("/", methods=["POST"])
@tenant_required
def chat(org_id, current_user):
    data = request.json or {}
    message = data.get("message", "").strip()
    if not message:
        return error_response("message is required", 400)

    history = data.get("history", [])

    # Placeholder: keyword-based mock responses
    message_lower = message.lower()
    if any(w in message_lower for w in ["employee", "hr", "staff", "attendance"]):
        response = "I can see your HR module data. You can manage employees, track attendance, and process payroll from the HR section."
    elif any(w in message_lower for w in ["invoice", "payment", "accounting", "expense"]):
        response = "Your accounting module handles invoices, payments, and expenses. Would you like a financial summary?"
    elif any(w in message_lower for w in ["vehicle", "driver", "trip", "fuel", "transport"]):
        response = "Your fleet management is active. You can track vehicles, drivers, trips, and fuel consumption."
    elif any(w in message_lower for w in ["lead", "deal", "crm", "pipeline", "customer"]):
        response = "Your CRM pipeline is live. You can track leads, manage deals, and log activities."
    elif any(w in message_lower for w in ["product", "inventory", "stock", "equipment"]):
        response = "The inventory module tracks your products and equipment. Want me to highlight low-stock items?"
    elif any(w in message_lower for w in ["job", "hire", "recruit", "candidate"]):
        response = "Your marketplace is ready for job postings and applications. You can manage recruitment from the Jobs section."
    elif any(w in message_lower for w in ["hello", "hi", "hey", "help"]):
        response = "Hello! I'm HeyleyBot, your AI assistant for HEYLA OS. I can help with HR, CRM, accounting, inventory, transport, and more. What would you like to do?"
    else:
        response = random.choice(MOCK_RESPONSES)

    return success_response({
        "message": response,
        "bot": "HeyleyBot",
        "model": "heyla-ai-v1",
        "history": history + [
            {"role": "user", "content": message},
            {"role": "assistant", "content": response},
        ],
    })


@chat_bp.route("/history", methods=["GET"])
@tenant_required
def chat_history(org_id, current_user):
    # Placeholder: no persistence yet
    return success_response({"history": [], "message": "Chat history will be available in a future version."})
