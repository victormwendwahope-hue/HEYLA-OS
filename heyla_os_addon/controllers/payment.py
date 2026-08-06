from odoo import http
from odoo.http import request
from .auth import _auth_required, _admin_required
import json
import base64
import hashlib
import hmac
import secrets
from datetime import datetime
from urllib.parse import urlencode
from threading import Thread

PLANS_PRICES = {
    'starter': {'monthly': 2500, 'yearly': 24000},
    'growth': {'monthly': 5000, 'yearly': 48000},
    'professional': {'monthly': 10000, 'yearly': 96000},
    'enterprise': {'monthly': 20000, 'yearly': None},
}


class PaymentController(http.Controller):

    def _get_gateway(self, gateway_type):
        return request.env['heyla.payment.gateway'].sudo().search([('gateway_type', '=', gateway_type), ('active', '=', True)], limit=1)

    def _mpesa_auth(self, gateway):
        import requests as rq
        auth_url = 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
        auth = base64.b64encode(f"{gateway.consumer_key}:{gateway.consumer_secret}".encode()).decode()
        resp = rq.get(auth_url, headers={'Authorization': f'Basic {auth}'})
        if resp.status_code != 200:
            raise Exception('M-Pesa auth failed')
        return resp.json().get('access_token')

    def _mpesa_stk_push(self, phone, amount, reference, gateway, callback_url):
        import requests as rq
        token = self._mpesa_auth(gateway)
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password = base64.b64encode(
            (gateway.shortcode + gateway.passkey + timestamp).encode()
        ).decode()

        payload = {
            'BusinessShortCode': gateway.shortcode,
            'Password': password,
            'Timestamp': timestamp,
            'TransactionType': 'CustomerPayBillOnline',
            'Amount': int(amount),
            'PartyA': phone,
            'PartyB': gateway.shortcode,
            'PhoneNumber': phone,
            'CallBackURL': callback_url,
            'AccountReference': reference[:12],
            'TransactionDesc': f'HEYLA Subscription {reference}',
        }
        resp = rq.post(
            'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            json=payload,
            headers={'Authorization': f'Bearer {token}'},
        )
        return resp.json()

    def _mpesa_query(self, checkout_request_id, gateway):
        import requests as rq
        token = self._mpesa_auth(gateway)
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password = base64.b64encode(
            (gateway.shortcode + gateway.passkey + timestamp).encode()
        ).decode()
        payload = {
            'BusinessShortCode': gateway.shortcode,
            'Password': password,
            'Timestamp': timestamp,
            'CheckoutRequestID': checkout_request_id,
        }
        resp = rq.post(
            'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query',
            json=payload,
            headers={'Authorization': f'Bearer {token}'},
        )
        return resp.json()

    def _create_transaction(self, user, gateway, amount, plan, billing_cycle, phone=None):
        tx = request.env['heyla.payment.transaction'].sudo().create({
            'user_id': user.id,
            'gateway_id': gateway.id,
            'amount': amount,
            'plan': plan,
            'billing_cycle': billing_cycle,
            'status': 'pending',
            'phone_number': phone,
        })
        return tx

    def _activate_subscription_after_payment(self, user, plan, billing_cycle):
        user._activate_subscription(plan, billing_cycle)

    def _create_settlement(self, transaction):
        bank_accounts = request.env['heyla.settlement.bank.account'].sudo().search([
            ('is_active', '=', True),
            ('auto_settle', '=', True),
        ])
        if not bank_accounts:
            return

        total_pct = sum(bank_accounts.mapped('settlement_percentage'))
        for bank in bank_accounts:
            share_pct = bank.settlement_percentage / total_pct if total_pct else 0
            settle_amount = transaction.amount * share_pct
            if settle_amount > 0:
                request.env['heyla.settlement.transfer'].sudo().create({
                    'bank_account_id': bank.id,
                    'transaction_id': transaction.id,
                    'amount': settle_amount,
                    'status': 'pending',
                })

    # ==================== PUBLIC API ENDPOINTS ====================

    @http.route('/api/payment/gateways', type='http', auth='none', methods=['GET'], csrf=False)
    def get_gateways(self):
        gateways = request.env['heyla.payment.gateway'].sudo().search([('active', '=', True)])
        result = []
        for g in gateways:
            info = {
                'type': g.gateway_type,
                'name': g.display_name,
            }
            if g.gateway_type == 'stripe':
                info['publishableKey'] = g.stripe_publishable_key
            if g.gateway_type == 'paystack':
                info['publicKey'] = g.paystack_public_key
            result.append(info)
        return http.Response(json.dumps({'gateways': result}), content_type='application/json', status=200)

    @http.route('/api/payment/initiate-mpesa', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def initiate_mpesa(self):
        try:
            user = request.heyla_user
            data = json.loads(request.httprequest.data)
            plan = data.get('plan')
            billing_cycle = data.get('billingCycle', 'monthly')
            phone = data.get('phone', '').strip()

            if not phone or len(phone) < 10:
                return http.Response(json.dumps({'error': 'Valid phone number required'}), content_type='application/json', status=400)

            if phone.startswith('0'):
                phone = '254' + phone[1:]
            elif phone.startswith('+'):
                phone = phone[1:]
            elif not phone.startswith('254'):
                phone = '254' + phone

            price = PLANS_PRICES.get(plan, {}).get(billing_cycle)
            if not price:
                return http.Response(json.dumps({'error': 'Invalid plan or billing cycle'}), content_type='application/json', status=400)

            gateway = self._get_gateway('mpesa')
            if not gateway:
                return http.Response(json.dumps({'error': 'M-Pesa gateway not configured'}), content_type='application/json', status=503)

            tx = self._create_transaction(user, gateway, price, plan, billing_cycle, phone)
            callback_url = f"{gateway.callback_base_url}/api/payment/mpesa-callback"
            resp = self._mpesa_stk_push(phone, price, tx.reference, gateway, callback_url)

            if resp.get('ResponseCode') == '0':
                tx.status = 'processing'
                tx.gateway_transaction_id = resp.get('CheckoutRequestID')
                tx.gateway_response = json.dumps(resp)
                return http.Response(json.dumps({
                    'ok': True,
                    'reference': tx.reference,
                    'checkoutRequestId': resp.get('CheckoutRequestID'),
                    'customerMessage': resp.get('CustomerMessage', 'Please check your phone to complete payment'),
                }), content_type='application/json', status=200)
            else:
                tx.status = 'failed'
                tx.failure_reason = resp.get('errorMessage', resp.get('ResponseDescription', 'M-Pesa request failed'))
                tx.gateway_response = json.dumps(resp)
                return http.Response(json.dumps({'error': tx.failure_reason}), content_type='application/json', status=400)

        except (json.JSONDecodeError, Exception) as e:
            return http.Response(json.dumps({'error': str(e)}), content_type='application/json', status=400)

    @http.route('/api/payment/mpesa-status', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def mpesa_status(self):
        try:
            user = request.heyla_user
            data = json.loads(request.httprequest.data)
            checkout_request_id = data.get('checkoutRequestId')
            if not checkout_request_id:
                return http.Response(json.dumps({'error': 'checkoutRequestId required'}), content_type='application/json', status=400)

            gateway = self._get_gateway('mpesa')
            if not gateway:
                return http.Response(json.dumps({'error': 'M-Pesa gateway not configured'}), content_type='application/json', status=503)

            tx = request.env['heyla.payment.transaction'].sudo().search([
                ('gateway_transaction_id', '=', checkout_request_id),
            ], limit=1)

            if tx and tx.user_id.id != user.id:
                return http.Response(json.dumps({'error': 'Not your transaction'}), content_type='application/json', status=403)

            resp = self._mpesa_query(checkout_request_id, gateway)
            result_code = resp.get('ResultCode')
            result_desc = resp.get('ResultDesc', '')

            if result_code == '0':
                if tx and tx.status == 'processing':
                    tx.status = 'completed'
                    tx.gateway_response = json.dumps(resp)
                    tx.mpesa_receipt = resp.get('MpesaReceiptNumber', '')
                    self._activate_subscription_after_payment(tx.user_id, tx.plan, tx.billing_cycle)
                    self._create_settlement(tx)
                return http.Response(json.dumps({'status': 'completed', 'receipt': resp.get('MpesaReceiptNumber', '')}), content_type='application/json', status=200)
            elif result_code == '1037':
                return http.Response(json.dumps({'status': 'pending'}), content_type='application/json', status=200)
            else:
                if tx:
                    tx.status = 'failed'
                    tx.failure_reason = result_desc
                return http.Response(json.dumps({'status': 'failed', 'reason': result_desc}), content_type='application/json', status=200)
        except Exception as e:
            return http.Response(json.dumps({'error': str(e)}), content_type='application/json', status=400)

    @http.route('/api/payment/mpesa-callback', type='http', auth='none', methods=['POST'], csrf=False)
    def mpesa_callback(self):
        try:
            data = json.loads(request.httprequest.data)
            body = data.get('Body', {})
            stk_callback = body.get('stkCallback', {})
            result_code = stk_callback.get('ResultCode')
            result_desc = stk_callback.get('ResultDesc', '')
            checkout_request_id = stk_callback.get('CheckoutRequestID')
            metadata = stk_callback.get('CallbackMetadata', {}).get('Item', [])

            tx = request.env['heyla.payment.transaction'].sudo().search([
                ('gateway_transaction_id', '=', checkout_request_id),
            ], limit=1)

            mpesa_receipt = ''
            total_amount = 0.0
            for item in metadata:
                if item.get('Name') == 'MpesaReceiptNumber':
                    mpesa_receipt = item.get('Value', '')
                elif item.get('Name') == 'Amount':
                    try:
                        total_amount = float(item.get('Value', 0) or 0)
                    except (TypeError, ValueError):
                        total_amount = 0.0

            if not tx or tx.status != 'processing':
                return http.Response(json.dumps({'ResultCode': 0, 'ResultDesc': 'Success'}), content_type='application/json', status=200)

            if result_code == 0:
                if total_amount and abs(total_amount - (tx.amount or 0)) > 1:
                    tx.status = 'failed'
                    tx.failure_reason = f'Amount mismatch: callback {total_amount} vs expected {tx.amount}'
                    tx.gateway_response = json.dumps(data)
                else:
                    # The callback payload itself is not trusted (anyone can POST to this URL).
                    # Confirm with Safaricom server-side before activating, so a spoofed
                    # callback can never grant a free subscription. On transient query
                    # failure the tx stays 'processing' and the authenticated status poll
                    # (which also queries Safaricom) completes the activation.
                    try:
                        gateway = tx.gateway_id
                        confirm = self._mpesa_query(checkout_request_id, gateway)
                        if confirm.get('ResultCode') == '0' and tx.status == 'processing':
                            tx.status = 'completed'
                            tx.mpesa_receipt = mpesa_receipt or confirm.get('MpesaReceiptNumber', '')
                            tx.gateway_response = json.dumps(data)
                            self._activate_subscription_after_payment(tx.user_id, tx.plan, tx.billing_cycle)
                            self._create_settlement(tx)
                        else:
                            tx.gateway_response = json.dumps({'callback': data, 'confirm': confirm})
                    except Exception as exc:
                        tx.gateway_response = json.dumps({'callback': data, 'confirmError': str(exc)})
            elif tx:
                tx.status = 'failed'
                tx.failure_reason = result_desc
                tx.gateway_response = json.dumps(data)

            return http.Response(json.dumps({'ResultCode': 0, 'ResultDesc': 'Success'}), content_type='application/json', status=200)
        except Exception:
            return http.Response(json.dumps({'ResultCode': 0, 'ResultDesc': 'Success'}), content_type='application/json', status=200)

    @http.route('/api/payment/initiate-stripe', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def initiate_stripe(self):
        try:
            user = request.heyla_user
            data = json.loads(request.httprequest.data)
            plan = data.get('plan')
            billing_cycle = data.get('billingCycle', 'monthly')

            price = PLANS_PRICES.get(plan, {}).get(billing_cycle)
            if not price:
                return http.Response(json.dumps({'error': 'Invalid plan or billing cycle'}), content_type='application/json', status=400)

            gateway = self._get_gateway('stripe')
            if not gateway:
                return http.Response(json.dumps({'error': 'Stripe gateway not configured'}), content_type='application/json', status=503)

            tx = self._create_transaction(user, gateway, price, plan, billing_cycle)

            import requests as rq
            resp = rq.post(
                'https://api.stripe.com/v1/payment_intents',
                data={
                    'amount': int(price * 100),
                    'currency': 'kes',
                    'metadata[reference]': tx.reference,
                    'metadata[plan]': plan,
                    'metadata[billing_cycle]': billing_cycle,
                    'metadata[user_id]': user.id,
                },
                headers={
                    'Authorization': f'Bearer {gateway.stripe_secret_key}',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            )
            result = resp.json()

            if resp.status_code == 200:
                tx.status = 'processing'
                tx.stripe_payment_intent_id = result.get('id')
                tx.gateway_transaction_id = result.get('id')
                tx.gateway_response = json.dumps(result)
                return http.Response(json.dumps({
                    'ok': True,
                    'reference': tx.reference,
                    'clientSecret': result.get('client_secret'),
                    'paymentIntentId': result.get('id'),
                }), content_type='application/json', status=200)
            else:
                tx.status = 'failed'
                tx.failure_reason = result.get('error', {}).get('message', 'Stripe request failed')
                tx.gateway_response = json.dumps(result)
                return http.Response(json.dumps({'error': tx.failure_reason}), content_type='application/json', status=400)

        except (json.JSONDecodeError, Exception) as e:
            return http.Response(json.dumps({'error': str(e)}), content_type='application/json', status=400)

    @http.route('/api/payment/stripe-webhook', type='http', auth='none', methods=['POST'], csrf=False)
    def stripe_webhook(self):
        try:
            payload = request.httprequest.data
            sig_header = request.httprequest.headers.get('Stripe-Signature', '')

            gateway = self._get_gateway('stripe')
            if not gateway:
                return http.Response(json.dumps({'error': 'Stripe not configured'}), content_type='application/json', status=503)

            # Webhook signature is mandatory: never process an unsigned event.
            if not gateway.stripe_webhook_secret:
                return http.Response(json.dumps({'error': 'Stripe webhook secret not configured'}), content_type='application/json', status=400)

            from stripe import Webhook
            try:
                event = Webhook.construct_event(payload, sig_header, gateway.stripe_webhook_secret)
            except Exception:
                return http.Response(json.dumps({'error': 'Invalid signature'}), content_type='application/json', status=400)

            if event.get('type') == 'payment_intent.succeeded':
                intent = event['data']['object']
                ref = intent.get('metadata', {}).get('reference', '')
                tx = request.env['heyla.payment.transaction'].sudo().search([
                    ('reference', '=', ref),
                ], limit=1)
                if tx and tx.status == 'processing':
                    amount_ok = intent.get('amount', 0) == int((tx.amount or 0) * 100)
                    currency_ok = (intent.get('currency') or '').lower() == 'kes'
                    if not (amount_ok and currency_ok):
                        tx.status = 'failed'
                        tx.failure_reason = f'Webhook mismatch: amount {intent.get("amount")} {intent.get("currency")} vs {int(tx.amount * 100)} kes'
                        tx.gateway_response = json.dumps(event)
                    else:
                        tx.status = 'completed'
                        tx.gateway_response = json.dumps(event)
                        self._activate_subscription_after_payment(tx.user_id, tx.plan, tx.billing_cycle)
                        self._create_settlement(tx)

            elif event.get('type') == 'payment_intent.payment_failed':
                intent = event['data']['object']
                ref = intent.get('metadata', {}).get('reference', '')
                tx = request.env['heyla.payment.transaction'].sudo().search([
                    ('reference', '=', ref),
                ], limit=1)
                if tx:
                    tx.status = 'failed'
                    tx.failure_reason = intent.get('last_payment_error', {}).get('message', 'Payment failed')
                    tx.gateway_response = json.dumps(event)

            return http.Response(json.dumps({'received': True}), content_type='application/json', status=200)
        except Exception:
            return http.Response(json.dumps({'received': True}), content_type='application/json', status=200)

    @http.route('/api/payment/initiate-paystack', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def initiate_paystack(self):
        try:
            user = request.heyla_user
            data = json.loads(request.httprequest.data)
            plan = data.get('plan')
            billing_cycle = data.get('billingCycle', 'monthly')

            price = PLANS_PRICES.get(plan, {}).get(billing_cycle)
            if not price:
                return http.Response(json.dumps({'error': 'Invalid plan or billing cycle'}), content_type='application/json', status=400)

            gateway = self._get_gateway('paystack')
            if not gateway:
                return http.Response(json.dumps({'error': 'Paystack gateway not configured'}), content_type='application/json', status=503)

            tx = self._create_transaction(user, gateway, price, plan, billing_cycle)

            import requests as rq
            callback_url = f"{gateway.callback_base_url}/payment?reference={tx.reference}"
            resp = rq.post(
                'https://api.paystack.co/transaction/initialize',
                json={
                    'email': user.email,
                    'amount': int(price * 100),
                    'currency': 'KES',
                    'reference': tx.reference,
                    'callback_url': callback_url,
                    'metadata': {
                        'reference': tx.reference,
                        'plan': plan,
                        'billing_cycle': billing_cycle,
                        'user_id': user.id,
                    },
                },
                headers={
                    'Authorization': f'Bearer {gateway.paystack_secret_key}',
                    'Content-Type': 'application/json',
                },
            )
            result = resp.json()

            if result.get('status'):
                tx.status = 'processing'
                tx.paystack_authorization_url = result['data'].get('authorization_url')
                tx.paystack_access_code = result['data'].get('access_code')
                tx.gateway_transaction_id = tx.reference
                tx.gateway_response = json.dumps(result)
                return http.Response(json.dumps({
                    'ok': True,
                    'reference': tx.reference,
                    'authorizationUrl': result['data'].get('authorization_url'),
                    'accessCode': result['data'].get('access_code'),
                }), content_type='application/json', status=200)
            else:
                tx.status = 'failed'
                tx.failure_reason = result.get('message', 'Paystack request failed')
                tx.gateway_response = json.dumps(result)
                return http.Response(json.dumps({'error': tx.failure_reason}), content_type='application/json', status=400)

        except (json.JSONDecodeError, Exception) as e:
            return http.Response(json.dumps({'error': str(e)}), content_type='application/json', status=400)

    @http.route('/api/payment/paystack-webhook', type='http', auth='none', methods=['POST'], csrf=False)
    def paystack_webhook(self):
        try:
            payload = request.httprequest.data
            sig = request.httprequest.headers.get('x-paystack-signature', '')

            gateway = self._get_gateway('paystack')
            if not gateway:
                return http.Response(json.dumps({'error': 'Paystack not configured'}), content_type='application/json', status=503)

            # Webhook signature is mandatory: never process an unsigned event.
            if not gateway.paystack_webhook_secret:
                return http.Response(json.dumps({'error': 'Paystack webhook secret not configured'}), content_type='application/json', status=400)

            expected_sig = hmac.new(
                gateway.paystack_webhook_secret.encode(),
                payload,
                hashlib.sha512,
            ).hexdigest()
            if sig != expected_sig:
                return http.Response(json.dumps({'error': 'Invalid signature'}), content_type='application/json', status=400)

            event = json.loads(payload)
            if event.get('event') == 'charge.success':
                data = event['data']
                ref = data.get('reference', '')
                tx = request.env['heyla.payment.transaction'].sudo().search([
                    ('reference', '=', ref),
                ], limit=1)
                if tx and tx.status == 'processing':
                    amount_ok = int(data.get('amount', 0)) == int((tx.amount or 0) * 100)
                    currency_ok = (data.get('currency') or '').lower() == 'kes'
                    if not (amount_ok and currency_ok):
                        tx.status = 'failed'
                        tx.failure_reason = f'Webhook mismatch: amount {data.get("amount")} {data.get("currency")} vs {int(tx.amount * 100)} kes'
                        tx.gateway_response = json.dumps(event)
                    else:
                        tx.status = 'completed'
                        tx.gateway_transaction_id = data.get('id', ref)
                        tx.gateway_response = json.dumps(event)
                        self._activate_subscription_after_payment(tx.user_id, tx.plan, tx.billing_cycle)
                        self._create_settlement(tx)

            return http.Response(json.dumps({'received': True}), content_type='application/json', status=200)
        except Exception:
            return http.Response(json.dumps({'received': True}), content_type='application/json', status=200)

    @http.route('/api/payment/verify', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def verify_payment(self):
        try:
            user = request.heyla_user
            data = json.loads(request.httprequest.data)
            reference = data.get('reference')
            if not reference:
                return http.Response(json.dumps({'error': 'Reference required'}), content_type='application/json', status=400)

            tx = request.env['heyla.payment.transaction'].sudo().search([
                ('reference', '=', reference),
            ], limit=1)
            if not tx:
                return http.Response(json.dumps({'error': 'Transaction not found'}), content_type='application/json', status=404)
            if tx.user_id.id != user.id:
                return http.Response(json.dumps({'error': 'Not your transaction'}), content_type='application/json', status=403)

            return http.Response(json.dumps({
                'status': tx.status,
                'reference': tx.reference,
                'amount': tx.amount,
                'plan': tx.plan,
                'billingCycle': tx.billing_cycle,
                'gatewayType': tx.gateway_type,
                'mpesaReceipt': tx.mpesa_receipt,
                'failureReason': tx.failure_reason,
            }), content_type='application/json', status=200)
        except Exception as e:
            return http.Response(json.dumps({'error': str(e)}), content_type='application/json', status=400)

    @http.route('/api/payment/history', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def payment_history(self):
        user = request.heyla_user
        txs = request.env['heyla.payment.transaction'].sudo().search([
            ('user_id', '=', user.id),
        ], order='create_date desc', limit=50)
        result = []
        for tx in txs:
            result.append({
                'reference': tx.reference,
                'amount': tx.amount,
                'currency': tx.currency,
                'status': tx.status,
                'plan': tx.plan,
                'billingCycle': tx.billing_cycle,
                'gatewayType': tx.gateway_type,
                'mpesaReceipt': tx.mpesa_receipt,
                'createdAt': tx.create_date.isoformat() if tx.create_date else None,
            })
        return http.Response(json.dumps({'transactions': result}), content_type='application/json', status=200)

    @http.route('/api/settlement/accounts', type='http', auth='none', methods=['GET'], csrf=False)
    @_admin_required
    def get_settlement_accounts(self):
        accounts = request.env['heyla.settlement.bank.account'].sudo().search([('is_active', '=', True)])
        result = []
        for acc in accounts:
            result.append({
                'id': acc.id,
                'accountName': acc.account_name,
                'bankName': acc.bank_name,
                'accountNumber': acc.account_number,
                'currency': acc.currency,
                'settlementPercentage': acc.settlement_percentage,
                'autoSettle': acc.auto_settle,
                'settlementFrequency': acc.settlement_frequency,
                'totalSettled': acc.total_settled,
                'totalPending': acc.total_pending,
            })
        return http.Response(json.dumps({'accounts': result}), content_type='application/json', status=200)

    @http.route('/api/settlement/transfers', type='http', auth='none', methods=['GET'], csrf=False)
    @_admin_required
    def get_settlement_transfers(self):
        transfers = request.env['heyla.settlement.transfer'].sudo().search([], order='create_date desc', limit=100)
        result = []
        for t in transfers:
            result.append({
                'reference': t.reference,
                'bankAccount': t.bank_account_id.account_name,
                'bankName': t.bank_account_id.bank_name,
                'amount': t.amount,
                'currency': t.currency,
                'status': t.status,
                'transactionReference': t.transaction_id.reference,
                'transferDate': t.transfer_date.isoformat() if t.transfer_date else None,
                'gatewayReference': t.gateway_reference,
            })
        return http.Response(json.dumps({'transfers': result}), content_type='application/json', status=200)

    @http.route('/api/payment/admin/trigger-settlement', type='http', auth='none', methods=['POST'], csrf=False)
    @_admin_required
    def trigger_settlement(self):
        try:
            pending = request.env['heyla.settlement.transfer'].sudo().search([
                ('status', '=', 'pending'),
            ])
            for transfer in pending:
                transfer.status = 'processing'
                try:
                    self._process_bank_transfer(transfer)
                    transfer.mark_completed(gateway_ref=f'AUTO-{transfer.reference}')
                except Exception as e:
                    transfer.mark_failed(str(e))

            return http.Response(json.dumps({'ok': True, 'processed': len(pending)}), content_type='application/json', status=200)
        except Exception as e:
            return http.Response(json.dumps({'error': str(e)}), content_type='application/json', status=400)

    def _process_bank_transfer(self, transfer):
        bank = transfer.bank_account_id
        gateway = self._get_gateway('mpesa')
        if not gateway or not gateway.initiator_name or not gateway.security_credential:
            raise Exception('M-Pesa B2C not configured for settlement transfers')

        import requests as rq
        token = self._mpesa_auth(gateway)
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password = base64.b64encode(
            (gateway.shortcode + gateway.passkey + timestamp).encode()
        ).decode()

        payload = {
            'InitiatorName': gateway.initiator_name,
            'SecurityCredential': gateway.security_credential,
            'CommandID': 'BusinessPayment',
            'Amount': int(transfer.amount),
            'PartyA': gateway.shortcode,
            'PartyB': bank.account_number,
            'Remarks': f'Settlement {transfer.reference}',
            'QueueTimeOutURL': f"{gateway.callback_base_url}/api/payment/b2c-timeout",
            'ResultURL': f"{gateway.callback_base_url}/api/payment/b2c-result",
            'Occasion': 'HEYLA Settlement',
        }
        resp = rq.post(
            'https://api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest',
            json=payload,
            headers={'Authorization': f'Bearer {token}'},
        )
        result = resp.json()
        if resp.status_code != 200 or result.get('ResponseCode') != '0':
            raise Exception(result.get('ResponseDescription', 'B2C transfer failed'))
