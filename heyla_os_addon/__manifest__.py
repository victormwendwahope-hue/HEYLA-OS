{
    'name': 'HEYLA OS - Business Management Suite',
    'version': '18.0.1.0.0',
    'category': 'Business',
    'summary': 'Complete Business Management: HR, CRM, Accounting, Inventory, EHS, Engineering, Transport, Fuel, Jobs, Networking',
    'description': """
HEYLA OS - Complete Business Management Suite
===============================================
Full-featured business operating system covering:
- Human Resources (Employees, Payroll, Attendance, Leave, Performance, WIBA, Injuries, Blacklist, Documents)
- CRM & Sales (Lead Tracking)
- Accounting & Payroll
- Inventory & Equipment
- EHS (Environment, Health & Safety)
- Engineering (FIDIC Contract Management)
- Transport & Fuel Logistics
- Jobs & Recruitment
- Professional Networking
    """,
    'author': 'HEYLA',
    'website': 'https://heyla-os.dev',
    'depends': ['base', 'mail', 'web'],
    'data': [
        'security/ir.model.access.csv',
        'data/demo_data.xml',
    ],
    'demo': [],
    'installable': True,
    'application': True,
    'auto_install': False,
    'license': 'LGPL-3',
    'assets': {},
}
