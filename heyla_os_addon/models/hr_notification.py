from odoo import fields, models


class Notification(models.Model):
    _name = 'heyla.notification'
    _description = 'HEYLA Notification'
    _order = 'timestamp desc'

    user_id = fields.Char()
    notification_type = fields.Char()
    header = fields.Char()
    message = fields.Text()
    metadata_json = fields.Text()
    severity = fields.Selection([
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('critical', 'Critical'),
    ], default='info')
    read = fields.Boolean(default=False)
    read_at = fields.Datetime()
    timestamp = fields.Datetime(default=fields.Datetime.now)

    def mark_read(self):
        self.write({'read': True, 'read_at': fields.Datetime.now()})


class AuditLog(models.Model):
    _name = 'heyla.audit.log'
    _description = 'HEYLA Audit Log'
    _order = 'timestamp desc'

    user_id = fields.Char()
    user_email = fields.Char()
    user_name = fields.Char()
    action = fields.Char(required=True)
    entity = fields.Char()
    entity_id = fields.Char()
    entity_name = fields.Char()
    old_values = fields.Text()
    new_values = fields.Text()
    ip_address = fields.Char()
    timestamp = fields.Datetime(default=fields.Datetime.now)
