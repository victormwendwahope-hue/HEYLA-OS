from odoo import api, fields, models


class AssetCategory(models.Model):
    _name = 'heyla.asset.category'
    _description = 'HEYLA Asset Category'
    _inherit = 'mail.thread'
    _rec_name = 'name'

    name = fields.Char(required=True, tracking=True)
    code = fields.Char()
    description = fields.Text()
    depreciation_method = fields.Selection([
        ('straight_line', 'Straight Line'),
        ('declining', 'Declining Balance'),
        ('none', 'No Depreciation'),
    ], default='straight_line')
    useful_life_years = fields.Integer(default=5)
    is_active = fields.Boolean(default=True)


class CompanyAsset(models.Model):
    _name = 'heyla.company.asset'
    _description = 'HEYLA Company Asset'
    _inherit = 'mail.thread'
    _rec_name = 'name'
    _order = 'id desc'

    asset_number = fields.Char(readonly=True, copy=False, default='New')
    name = fields.Char(required=True, tracking=True)
    category_id = fields.Many2one('heyla.asset.category', string='Category', tracking=True)
    serial_number = fields.Char(tracking=True)
    model = fields.Char()
    manufacturer = fields.Char()
    purchase_date = fields.Date()
    purchase_cost = fields.Float(default=0.0)
    currency = fields.Char(default='KES')
    current_value = fields.Float(compute='_compute_current_value', store=True)
    condition = fields.Selection([
        ('new', 'New'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
        ('damaged', 'Damaged'),
        ('obsolete', 'Obsolete'),
    ], default='good', tracking=True)
    location = fields.Char()
    status = fields.Selection([
        ('available', 'Available'),
        ('assigned', 'Assigned'),
        ('maintenance', 'Under Maintenance'),
        ('disposed', 'Disposed'),
        ('lost', 'Lost/Stolen'),
    ], default='available', tracking=True)
    notes = fields.Text()


class EmployeeAssetAssignment(models.Model):
    _name = 'heyla.employee.asset.assignment'
    _description = 'HEYLA Employee Asset Assignment'
    _inherit = 'mail.thread'
    _rec_name = 'asset_name'
    _order = 'id desc'

    asset_id = fields.Many2one('heyla.company.asset', string='Asset', required=True, tracking=True)
    asset_name = fields.Char(related='asset_id.name', store=True)
    asset_number = fields.Char(related='asset_id.asset_number', store=True)
    employee_id = fields.Many2one('heyla.employee', string='Assigned To', required=True, tracking=True)
    employee_name = fields.Char(related='employee_id.name', store=True)
    assigned_date = fields.Date(required=True, default=fields.Date.today)
    expected_return_date = fields.Date()
    returned_date = fields.Date()
    condition_on_assignment = fields.Selection([
        ('new', 'New'),
        ('good', 'Good'),
        ('fair', 'Fair'),
    ], default='good')
    condition_on_return = fields.Selection([
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
        ('damaged', 'Damaged'),
    ])
    notes = fields.Text()
    status = fields.Selection([
        ('assigned', 'Assigned'),
        ('returned', 'Returned'),
        ('lost', 'Lost'),
    ], default='assigned', tracking=True)

    @api.model_create_multi
    def create(self, vals_list):
        res = super().create(vals_list)
        for a in res:
            a.asset_id.status = 'assigned'
        return res

    def write(self, vals):
        res = super().write(vals)
        for a in self:
            if vals.get('returned_date') or vals.get('status') == 'returned':
                a.asset_id.status = 'available'
        return res
