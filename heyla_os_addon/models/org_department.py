from odoo import api, fields, models


class Department(models.Model):
    _name = 'heyla.department'
    _description = 'HEYLA Department'
    _inherit = 'mail.thread'
    _rec_name = 'name'
    _order = 'name'

    name = fields.Char(required=True, tracking=True)
    code = fields.Char(tracking=True)
    description = fields.Text()
    head_of_department = fields.Char(tracking=True)
    email = fields.Char()
    phone = fields.Char()
    location = fields.Char()
    budget = fields.Float(default=0.0)
    cost_center = fields.Char()
    is_active = fields.Boolean(default=True)
    created_by = fields.Char()

    division_ids = fields.One2many('heyla.division', 'department_id', string='Divisions')
    employee_count = fields.Integer(compute='_compute_employee_count')

    def _compute_employee_count(self):
        for d in self:
            d.employee_count = self.env['heyla.employee'].search_count([('department', '=', d.name)])


class Division(models.Model):
    _name = 'heyla.division'
    _description = 'HEYLA Division'
    _inherit = 'mail.thread'
    _rec_name = 'name'
    _order = 'name'

    name = fields.Char(required=True, tracking=True)
    code = fields.Char(tracking=True)
    description = fields.Text()
    department_id = fields.Many2one('heyla.department', string='Department', tracking=True)
    head_of_division = fields.Char(tracking=True)
    is_active = fields.Boolean(default=True)
    created_by = fields.Char()

    business_unit_ids = fields.One2many('heyla.business.unit', 'division_id', string='Business Units')


class BusinessUnit(models.Model):
    _name = 'heyla.business.unit'
    _description = 'HEYLA Business Unit'
    _inherit = 'mail.thread'
    _rec_name = 'name'
    _order = 'name'

    name = fields.Char(required=True, tracking=True)
    code = fields.Char(tracking=True)
    description = fields.Text()
    division_id = fields.Many2one('heyla.division', string='Division', tracking=True)
    head_of_unit = fields.Char(tracking=True)
    is_active = fields.Boolean(default=True)
    created_by = fields.Char()

    branch_ids = fields.One2many('heyla.branch.location', 'business_unit_id', string='Branch Locations')


class BranchLocation(models.Model):
    _name = 'heyla.branch.location'
    _description = 'HEYLA Branch Location'
    _inherit = 'mail.thread'
    _rec_name = 'name'
    _order = 'name'

    name = fields.Char(required=True, tracking=True)
    code = fields.Char()
    business_unit_id = fields.Many2one('heyla.business.unit', string='Business Unit', tracking=True)
    address = fields.Text()
    city = fields.Char()
    state = fields.Char()
    country = fields.Char()
    postal_code = fields.Char()
    phone = fields.Char()
    email = fields.Char()
    is_head_office = fields.Boolean(default=False)
    is_active = fields.Boolean(default=True)
    created_by = fields.Char()
    employee_count = fields.Integer(compute='_compute_branch_employee_count')

    def _compute_branch_employee_count(self):
        for b in self:
            b.employee_count = self.env['heyla.employee'].search_count(
                [('branch_location', '=', b.name)]
            )
