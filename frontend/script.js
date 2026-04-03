// API Configuration
const API_URL = 'http://localhost:5000/api';
const API_KEY = 'apimyapiKEY';

// Global state
let currentUser = null;
let authToken = null;

// ============================================
// AUTHENTICATION
// ============================================

// Check if user is logged in
function checkAuth() {
    authToken = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (authToken && user) {
        currentUser = JSON.parse(user);
        updateUserUI();
        
        // If on login page, redirect to dashboard
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
            window.location.href = 'dashboard.html';
        }
    } else if (!window.location.pathname.includes('index.html')) {
        // Redirect to login if not authenticated
        window.location.href = 'index.html';
    }
}

// Login function
async function login(email, password) {
    // Dummy login accounts
    const dummyUsers = [
        {
            email: 'admin@heylaos.com',
            password: 'admin123',
            full_name: 'Admin User',
            first_name: 'Admin',
            last_name: 'User',
            role: 'Admin',
            avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=667eea&color=fff',
            company: true
        },
        {
            email: 'employee@heylaos.com', 
            password: 'emp123',
            full_name: 'Jane Doe',
            first_name: 'Jane',
            last_name: 'Doe',
            role: 'HR Manager',
            avatar: 'https://ui-avatars.com/api/?name=Jane+Doe&background=28a745&color=fff',
            company: false
        },
        {
            email: 'freelancer@heylaos.com',
            password: 'free123',
            full_name: 'John Smith',
            first_name: 'John',
            last_name: 'Smith',
            role: 'Freelancer',
            avatar: 'https://ui-avatars.com/api/?name=John+Smith&background=ff6b6b&color=fff',
            company: false
        }
    ];
    
    const user = dummyUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('token', 'dummy-jwt-token');
        localStorage.setItem('user', JSON.stringify(user));
        showNotification(`Welcome ${user.full_name}!`, 'success');
        window.location.href = 'dashboard.html';
    } else {
        showNotification('Invalid email or password', 'error');
    }
}

// Register function
async function register(userData) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'dashboard.html';
        } else {
            showNotification(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showNotification('Network error. Please try again.', 'error');
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Update UI with user info
function updateUserUI() {
    if (currentUser) {
        const userNameElements = document.querySelectorAll('#userName');
        const userAvatarElements = document.querySelectorAll('#userAvatar, #currentUserAvatar');
        const userRoleElements = document.querySelectorAll('#userRole');
        
        userNameElements.forEach(el => {
            if (el) el.textContent = currentUser.full_name || `${currentUser.first_name} ${currentUser.last_name}`;
        });
        
        userAvatarElements.forEach(el => {
            if (el) el.src = currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.first_name}+${currentUser.last_name}`;
        });
        
        userRoleElements.forEach(el => {
            if (el) el.textContent = currentUser.role || 'Member';
        });
    }
}

// ============================================
// DASHBOARD FUNCTIONS
// ============================================

async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_URL}/dashboard/stats`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'X-API-Key': API_KEY
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('totalLeads').textContent = data.stats.leads || 0;
            document.getElementById('totalEmployees').textContent = data.stats.employees || 0;
            document.getElementById('totalRevenue').textContent = `KES ${(data.stats.revenue || 0).toLocaleString()}`;
            document.getElementById('totalInvoices').textContent = data.stats.invoices || 0;
            document.getElementById('totalConnections').textContent = data.stats.connections || 0;
            document.getElementById('totalMessages').textContent = data.stats.messages || 0;
            
            // Create charts
            createRevenueChart();
            createPipelineChart();
            loadRecentActivity();
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

function createRevenueChart() {
    const ctx = document.getElementById('revenueChart')?.getContext('2d');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue (KES)',
                    data: [12000, 19000, 15000, 25000, 28000, 32000],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102,126,234,0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { labels: { color: '#333' } }
                }
            }
        });
    }
}

function createPipelineChart() {
    const ctx = document.getElementById('pipelineChart')?.getContext('2d');
    if (ctx) {
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Prospecting', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
                datasets: [{
                    data: [30, 25, 20, 15, 8, 2],
                    backgroundColor: [
                        '#667eea', '#764ba2', '#28a745', '#ffc107', '#17a2b8', '#dc3545'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#333' } }
                }
            }
        });
    }
}

async function loadRecentActivity() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    const activities = [
        { type: 'success', title: 'New lead added: Tech Corp', time: '5 minutes ago' },
        { type: 'info', title: 'Invoice #INV-001 paid', time: '1 hour ago' },
        { type: 'warning', title: 'Meeting scheduled with client', time: '3 hours ago' },
        { type: 'success', title: 'New employee onboarded', time: '5 hours ago' },
        { type: 'info', title: 'Deal closed: $50,000', time: '1 day ago' }
    ];
    
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}">
                <i class="fas ${activity.type === 'success' ? 'fa-check' : activity.type === 'info' ? 'fa-info' : 'fa-exclamation'}"></i>
            </div>
            <div class="activity-details">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        </div>
    `).join('');
}

// ============================================
// CRM FUNCTIONS
// ============================================

async function loadLeads() {
    try {
        const response = await fetch(`${API_URL}/crm/leads`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'X-API-Key': API_KEY
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const tbody = document.getElementById('leadsTableBody');
            if (tbody) {
                tbody.innerHTML = data.leads.map(lead => `
                    <tr>
                        <td>${lead.name}</td>
                        <td>${lead.email}</td>
                        <td>${lead.company || '-'}</td>
                        <td><span class="badge ${getStatusBadgeClass(lead.status)}">${lead.status}</span></td>
                        <td>KES ${(lead.expected_value || 0).toLocaleString()}</td>
                        <td>
                            <div class="score-bar">
                                <div class="score-fill" style="width: ${lead.score}%"></div>
                                <span>${lead.score}%</span>
                            </div>
                        </td>
                        <td>
                            <button class="btn-icon" onclick="editLead(${lead.id})"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon" onclick="deleteLead(${lead.id})"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading leads:', error);
    }
}

async function createLead(leadData) {
    try {
        const response = await fetch(`${API_URL}/crm/leads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                'X-API-Key': API_KEY
            },
            body: JSON.stringify(leadData)
        });
        
        if (response.ok) {
            showNotification('Lead created successfully!', 'success');
            loadLeads();
            closeLeadModal();
        }
    } catch (error) {
        showNotification('Error creating lead', 'error');
    }
}

function getStatusBadgeClass(status) {
    const classes = {
        'new': 'badge-primary',
        'contacted': 'badge-info',
        'qualified': 'badge-success',
        'proposal': 'badge-warning',
        'won': 'badge-success',
        'lost': 'badge-danger'
    };
    return classes[status] || 'badge-secondary';
}

// ============================================
// HR FUNCTIONS
// ============================================

async function loadEmployees() {
    try {
        const response = await fetch(`${API_URL}/hr/employees`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'X-API-Key': API_KEY
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const tbody = document.getElementById('employeesTableBody');
            if (tbody) {
                tbody.innerHTML = data.employees.map(emp => `
                    <tr>
                        <td>${emp.employee_number}</td>
                        <td>${emp.first_name} ${emp.last_name}</td>
                        <td>${emp.position || '-'}</td>
                        <td>${emp.department || '-'}</td>
                        <td>KES ${(emp.basic_salary || 0).toLocaleString()}</td>
                        <td><span class="badge ${emp.status === 'active' ? 'badge-success' : 'badge-danger'}">${emp.status}</span></td>
                        <td>
                            <button class="btn-icon" onclick="editEmployee(${emp.id})"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon" onclick="deleteEmployee(${emp.id})"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `).join('');
            }
            
            // Update stats
            document.getElementById('activeEmployees').textContent = data.employees.filter(e => e.status === 'active').length;
            const totalPayroll = data.employees.reduce((sum, e) => sum + (e.basic_salary || 0), 0);
            document.getElementById('monthlyPayroll').textContent = `KES ${totalPayroll.toLocaleString()}`;
            document.getElementById('attendanceRate').textContent = '94%';
        }
    } catch (error) {
        console.error('Error loading employees:', error);
    }
}

async function createEmployee(empData) {
    try {
        const response = await fetch(`${API_URL}/hr/employees`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                'X-API-Key': API_KEY
            },
            body: JSON.stringify(empData)
        });
        
        if (response.ok) {
            showNotification('Employee added successfully!', 'success');
            loadEmployees();
            closeEmployeeModal();
        }
    } catch (error) {
        showNotification('Error adding employee', 'error');
    }
}

function processPayroll() {
    showNotification('Payroll processing started!', 'info');
    setTimeout(() => {
        showNotification('Payroll completed!', 'success');
    }, 3000);
}

// ============================================
// ACCOUNTING FUNCTIONS
// ============================================

async function loadInvoices() {
    try {
        const response = await fetch(`${API_URL}/accounting/invoices`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'X-API-Key': API_KEY
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const tbody = document.getElementById('invoicesTableBody');
            if (tbody) {
                tbody.innerHTML = data.invoices.map(inv => `
                    <tr>
                        <td>${inv.invoice_number}</td>
                        <td>KES ${(inv.amount || 0).toLocaleString()}</td>
                        <td>KES ${(inv.tax || 0).toLocaleString()}</td>
                        <td>KES ${(inv.total || 0).toLocaleString()}</td>
                        <td><span class="badge ${inv.status === 'paid' ? 'badge-success' : inv.status === 'pending' ? 'badge-warning' : 'badge-danger'}">${inv.status}</span></td>
                        <td>${inv.due_date || '-'}</td>
                        <td>
                            ${inv.status !== 'paid' ? `<button class="btn-icon" onclick="payInvoice(${inv.id})"><i class="fas fa-credit-card"></i></button>` : ''}
                            <button class="btn-icon" onclick="downloadInvoice(${inv.id})"><i class="fas fa-download"></i></button>
                        </td>
                    </tr>
                `).join('');
            }
            
            // Calculate financial stats
            const totalIncome = data.invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
            const totalExpenses = totalIncome * 0.6; // Example: 60% expenses
            const netProfit = totalIncome - totalExpenses;
            const taxLiability = netProfit * 0.16;
            
            document.getElementById('totalIncome').textContent = `KES ${totalIncome.toLocaleString()}`;
            document.getElementById('totalExpenses').textContent = `KES ${totalExpenses.toLocaleString()}`;
            document.getElementById('netProfit').textContent = `KES ${netProfit.toLocaleString()}`;
            document.getElementById('taxLiability').textContent = `KES ${taxLiability.toLocaleString()}`;
            
            createFinancialCharts(totalIncome, totalExpenses);
        }
    } catch (error) {
        console.error('Error loading invoices:', error);
    }
}

async function createInvoice(invoiceData) {
    try {
        const response = await fetch(`${API_URL}/accounting/invoices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                'X-API-Key': API_KEY
            },
            body: JSON.stringify(invoiceData)
        });
        
        if (response.ok) {
            showNotification('Invoice created successfully!', 'success');
            loadInvoices();
            closeInvoiceModal();
        }
    } catch (error) {
        showNotification('Error creating invoice', 'error');
    }
}

async function payInvoice(invoiceId) {
    try {
        const response = await fetch(`${API_URL}/accounting/invoices/${invoiceId}/pay`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'X-API-Key': API_KEY
            }
        });
        
        if (response.ok) {
            showNotification('Invoice paid successfully!', 'success');
            loadInvoices();
        }
    } catch (error) {
        showNotification('Error processing payment', 'error');
    }
}

function createFinancialCharts(income, expenses) {
    const ctx1 = document.getElementById('financialChart')?.getContext('2d');
    if (ctx1) {
        new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Income',
                        data: [12000, 19000, 15000, 25000, 28000, income / 6],
                        backgroundColor: 'rgba(40,167,69,0.5)',
                        borderColor: '#28a745',
                        borderWidth: 2
                    },
                    {
                        label: 'Expenses',
                        data: [8000, 11000, 9000, 15000, 16000, expenses / 6],
                        backgroundColor: 'rgba(220,53,69,0.5)',
                        borderColor: '#dc3545',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { labels: { color: '#333' } }
                }
            }
        });
    }
    
    const ctx2 = document.getElementById('cashFlowChart')?.getContext('2d');
    if (ctx2) {
        new Chart(ctx2, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Cash Flow',
                    data: [5000, 12000, 8000, 15000],
                    borderColor: '#17a2b8',
                    backgroundColor: 'rgba(23,162,184,0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { labels: { color: '#333' } }
                }
            }
        });
    }
}

// ============================================
// NETWORKING FUNCTIONS
// ============================================

async function loadPosts() {
    try {
        const response = await fetch(`${API_URL}/networking/posts`, {
            headers: {
                'X-API-Key': API_KEY
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const feed = document.getElementById('postsFeed');
            if (feed) {
                feed.innerHTML = data.posts.map(post => `
                    <div class="post-card">
                        <div class="post-header">
                            <img src="https://ui-avatars.com/api/?name=User" alt="" class="avatar-sm">
                            <div class="post-user-info">
                                <h4>User ${post.user_id}</h4>
                                <small>${new Date(post.created_at).toLocaleString()}</small>
                            </div>
                        </div>
                        <div class="post-content">
                            <p>${post.content}</p>
                        </div>
                        ${post.media_url ? `<div class="post-media"><img src="${post.media_url}" alt=""></div>` : ''}
                        <div class="post-stats">
                            <span><i class="fas fa-heart"></i> ${post.likes} likes</span>
                            <span><i class="fas fa-comment"></i> ${post.comments} comments</span>
                        </div>
                        <div class="post-actions-buttons">
                            <button class="post-action-btn" onclick="likePost(${post.id})"><i class="far fa-heart"></i> Like</button>
                            <button class="post-action-btn" onclick="commentOnPost(${post.id})"><i class="far fa-comment"></i> Comment</button>
                            <button class="post-action-btn" onclick="sharePost(${post.id})"><i class="fas fa-share"></i> Share</button>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

async function createPost(content, mediaUrl = null) {
    try {
        const response = await fetch(`${API_URL}/networking/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                'X-API-Key': API_KEY
            },
            body: JSON.stringify({ content, media_url: mediaUrl })
        });
        
        if (response.ok) {
            showNotification('Post created successfully!', 'success');
            loadPosts();
            document.getElementById('postContent').value = '';
        }
    } catch (error) {
        showNotification('Error creating post', 'error');
    }
}

async function likePost(postId) {
    try {
        const response = await fetch(`${API_URL}/networking/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'X-API-Key': API_KEY
            }
        });
        
        if (response.ok) {
            loadPosts();
        }
    } catch (error) {
        console.error('Error liking post:', error);
    }
}

async function loadConnections() {
    try {
        const response = await fetch(`${API_URL}/networking/connections`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'X-API-Key': API_KEY
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const connectionsList = document.getElementById('connectionsList');
            if (connectionsList) {
                connectionsList.innerHTML = data.connections.map(conn => `
                    <div class="connection-item">
                        <img src="https://ui-avatars.com/api/?name=User${conn.connected_user_id}" alt="">
                        <div class="connection-info">
                            <h4>User ${conn.connected_user_id}</h4>
                            <p>Connected ${new Date(conn.created_at).toLocaleDateString()}</p>
                        </div>
                        <button class="connect-btn" onclick="sendMessage(${conn.connected_user_id})">Message</button>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading connections:', error);
    }
}

async function sendMessage(receiverId, content) {
    try {
        const response = await fetch(`${API_URL}/networking/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                'X-API-Key': API_KEY
            },
            body: JSON.stringify({ receiver_id: receiverId, content })
        });
        
        if (response.ok) {
            showNotification('Message sent!', 'success');
            closeMessageModal();
        }
    } catch (error) {
        showNotification('Error sending message', 'error');
    }
}

// ============================================
// MARKETPLACE FUNCTIONS
// ============================================

async function loadJobs() {
    try {
        const response = await fetch(`${API_URL}/marketplace/jobs`, {
            headers: {
                'X-API-Key': API_KEY
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const jobsGrid = document.getElementById('jobsGrid');
            if (jobsGrid) {
                jobsGrid.innerHTML = data.jobs.map(job => `
                    <div class="job-card">
                        <div class="job-header">
                            <h3 class="job-title">${job.title}</h3>
                            <span class="job-budget">KES ${(job.budget || 0).toLocaleString()}</span>
                        </div>
                        <p class="job-description">${job.description?.substring(0, 150)}...</p>
                        <div class="job-skills">
                            ${(job.skills || []).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                        </div>
                        <div class="job-footer">
                            <span class="job-deadline"><i class="far fa-calendar"></i> Due: ${job.deadline || 'Flexible'}</span>
                            <button class="apply-btn" onclick="applyForJob(${job.id})">Apply Now</button>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading jobs:', error);
    }
}

async function createJob(jobData) {
    try {
        const response = await fetch(`${API_URL}/marketplace/jobs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                'X-API-Key': API_KEY
            },
            body: JSON.stringify(jobData)
        });
        
        if (response.ok) {
            showNotification('Job posted successfully!', 'success');
            loadJobs();
            closeJobModal();
        }
    } catch (error) {
        showNotification('Error posting job', 'error');
    }
}

async function applyForJob(jobId) {
    document.getElementById('proposalJobId').value = jobId;
    document.getElementById('proposalModal').style.display = 'block';
}

async function submitProposal(proposalData) {
    try {
        const response = await fetch(`${API_URL}/marketplace/proposals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                'X-API-Key': API_KEY
            },
            body: JSON.stringify(proposalData)
        });
        
        if (response.ok) {
            showNotification('Proposal submitted!', 'success');
            closeProposalModal();
        }
    } catch (error) {
        showNotification('Error submitting proposal', 'error');
    }
}

function filterJobs() {
    const search = document.getElementById('jobSearch')?.value || '';
    const category = document.getElementById('jobCategory')?.value || '';
    const budgetMin = document.getElementById('budgetMin')?.value || 0;
    const budgetMax = document.getElementById('budgetMax')?.value || 9999999;
    
    // Filter jobs based on criteria
    loadJobs({ search, category, budgetMin, budgetMax });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        border-radius: 10px;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Modal Functions
function showLeadModal() {
    const modal = document.getElementById('leadModal');
    if (modal) modal.style.display = 'block';
}

function closeLeadModal() {
    const modal = document.getElementById('leadModal');
    if (modal) modal.style.display = 'none';
}

function showEmployeeModal() {
    const modal = document.getElementById('employeeModal');
    if (modal) modal.style.display = 'block';
}

function closeEmployeeModal() {
    const modal = document.getElementById('employeeModal');
    if (modal) modal.style.display = 'none';
}

function showInvoiceModal() {
    const modal = document.getElementById('invoiceModal');
    if (modal) modal.style.display = 'block';
}

function closeInvoiceModal() {
    const modal = document.getElementById('invoiceModal');
    if (modal) modal.style.display = 'none';
}

function showJobModal() {
    const modal = document.getElementById('jobModal');
    if (modal) modal.style.display = 'block';
}

function closeJobModal() {
    const modal = document.getElementById('jobModal');
    if (modal) modal.style.display = 'none';
}

function closeProposalModal() {
    const modal = document.getElementById('proposalModal');
    if (modal) modal.style.display = 'none';
}

function closeMessageModal() {
    const modal = document.getElementById('messageModal');
    if (modal) modal.style.display = 'none';
}

function showRegister() {
    document.querySelector('.auth-card:first-child').style.display = 'none';
    document.getElementById('registerCard').style.display = 'block';
}

function showLogin() {
    document.getElementById('registerCard').style.display = 'none';
    document.querySelector('.auth-card:first-child').style.display = 'block';
}

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    // Update button styles
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Load data based on tab
    if (tabName === 'leads') loadLeads();
    if (tabName === 'deals') loadDeals();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Profile specific
    if (window.location.pathname.includes('profile.html')) {
        loadProfile();
        initProfileListeners();
    }
    
    // Form submissions
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            login(email, password);
        });
    }
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
    
    // Existing forms...
    const leadForm = document.getElementById('leadForm');
    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const leadData = {
                name: document.getElementById('leadName').value,
                email: document.getElementById('leadEmail').value,
                phone: document.getElementById('leadPhone').value,
                company: document.getElementById('leadCompany').value,
                industry: document.getElementById('leadIndustry').value,
                expected_value: parseFloat(document.getElementById('leadValue').value) || 0
            };
            createLead(leadData);
        });
    }
    
    // ... (keep all other existing form listeners)
    
    // Load data based on current page
    if (window.location.pathname.includes('dashboard.html')) {
        loadDashboardStats();
    } else if (window.location.pathname.includes('crm.html')) {
        loadLeads();
    } else if (window.location.pathname.includes('hr.html')) {
        loadEmployees();
    } else if (window.location.pathname.includes('accounting.html')) {
        loadInvoices();
    } else if (window.location.pathname.includes('networking.html')) {
        loadPosts();
        loadConnections();
    } else if (window.location.pathname.includes('marketplace.html')) {
        loadJobs();
    }
    
    // Registration toggle
    if (document.getElementById('registerTypeLabel')) {
        toggleRegisterType(); // Initialize
    }
});

// Profile functions
async function loadProfile() {
    try {
        const response = await fetch(`${API_URL}/profile`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'X-API-Key': API_KEY
            }
        });
        
        if (response.ok) {
            const profile = await response.json();
            populateProfileForm(profile);
            updateProfileHeader(profile);
            document.getElementById('profileAvatar').src = profile.avatar || `https://ui-avatars.com/api/?name=${profile.first_name || ''}+${profile.last_name || ''}`;
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function initProfileListeners() {
    document.getElementById('personalForm').addEventListener('submit', updatePersonalInfo);
    document.getElementById('companyForm').addEventListener('submit', updateCompanyInfo);
    document.getElementById('passwordForm').addEventListener('submit', changePassword);
    document.getElementById('avatarInput').addEventListener('change', uploadAvatar);
    document.getElementById('newPassword').addEventListener('input', validatePassword);
    document.getElementById('confirmPassword').addEventListener('input', checkPasswordMatch);
    document.querySelector('[onclick="saveNotificationSettings()"]').addEventListener('click', saveNotificationSettings);
}

// Registration with Company/Individual support
function toggleRegisterType() {
    const toggle = document.querySelector('.account-type-toggle .toggle-switch');
    const individualFields = document.getElementById('individualFields');
    const companyFields = document.getElementById('companyFields');
    const label = document.getElementById('registerTypeLabel');
    
    const isCompany = toggle.classList.contains('active');
    
    if (isCompany) {
        toggle.classList.remove('active');
        toggle.querySelector('.toggle-slider').style.transform = 'translateX(0)';
        individualFields.style.display = 'block';
        companyFields.style.display = 'none';
        label.textContent = 'Individual';
        document.querySelector('#individualFields input').required = true;
    } else {
        toggle.classList.add('active');
        toggle.querySelector('.toggle-slider').style.transform = 'translateX(26px)';
        individualFields.style.display = 'none';
        companyFields.style.display = 'block';
        label.textContent = 'Company';
        document.querySelector('#companyFields input').required = true;
    }
}

async function handleRegistration(e) {
    e.preventDefault();
    
    const isCompany = document.querySelector('.account-type-toggle .toggle-switch').classList.contains('active');
    
    const userData = {
        email: document.getElementById('regEmail').value,
        phone: document.getElementById('regPhone').value,
        password: document.getElementById('regPassword').value,
        role: document.getElementById('regRole').value,
        account_type: isCompany ? 'company' : 'individual'
    };
    
    if (isCompany) {
        userData.company_name = document.getElementById('regCompanyName').value;
        userData.company_reg_no = document.getElementById('regCompanyRegNo').value;
        userData.company_tax_id = document.getElementById('regCompanyTaxId').value;
    } else {
        userData.first_name = document.getElementById('regFirstName').value;
        userData.last_name = document.getElementById('regLastName').value;
    }
    
    await register(userData);
}

// Keep all existing functions and add profile/company functions as implemented in profile.html inline script
// (loadProfile, updatePersonalInfo, updateCompanyInfo, changePassword, etc. already functional in profile.html)

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .badge {
        padding: 4px 8px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
    }
    
    .badge-primary { background: #667eea; color: white; }
    .badge-success { background: #28a745; color: white; }
    .badge-warning { background: #ffc107; color: #333; }
    .badge-danger { background: #dc3545; color: white; }
    .badge-info { background: #17a2b8; color: white; }
    .badge-secondary { background: #6c757d; color: white; }
    
    .btn-icon {
        background: none;
        border: none;
        cursor: pointer;
        padding: 5px;
        margin: 0 3px;
        color: #666;
        transition: color 0.3s ease;
    }
    
    .btn-icon:hover {
        color: #667eea;
    }
    
    .score-bar {
        position: relative;
        width: 80px;
        height: 20px;
        background: #e9ecef;
        border-radius: 10px;
        overflow: hidden;
    }
    
    .score-fill {
        position: absolute;
        height: 100%;
        background: #28a745;
        transition: width 0.3s ease;
    }
    
    .score-bar span {
        position: absolute;
        width: 100%;
        text-align: center;
        font-size: 10px;
        line-height: 20px;
        z-index: 1;
        color: #333;
    }
`;
document.head.appendChild(style);
```

### 14. Database Setup (`backend/database.sql`)
```sql
-- Create database
CREATE DATABASE heyla_os;
\c heyla_os;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar VARCHAR(500),
    role VARCHAR(50) DEFAULT 'freelancer',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CRM Leads table
CREATE TABLE crm_leads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(255),
    industry VARCHAR(100),
    status VARCHAR(50) DEFAULT 'new',
    score INTEGER DEFAULT 0,
    expected_value DECIMAL(12,2) DEFAULT 0,
    probability INTEGER DEFAULT 0,
    notes TEXT,
    next_followup TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CRM Deals table
CREATE TABLE crm_deals (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES crm_leads(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    value DECIMAL(12,2) DEFAULT 0,
    probability INTEGER DEFAULT 0,
    stage VARCHAR(50) DEFAULT 'prospecting',
    expected_close DATE,
    actual_close DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- HR Employees table
CREATE TABLE hr_employees (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    national_id VARCHAR(20) UNIQUE NOT NULL,
    kra_pin VARCHAR(11) UNIQUE,
    nssf_number VARCHAR(20) UNIQUE,
    position VARCHAR(100),
    department VARCHAR(100),
    basic_salary DECIMAL(12,2) DEFAULT 0,
    housing_allowance DECIMAL(12,2) DEFAULT 0,
    transport_allowance DECIMAL(12,2) DEFAULT 0,
    employment_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounting Invoices table
CREATE TABLE accounting_invoices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(12,2) DEFAULT 0,
    tax DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    due_date DATE,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Networking Posts table
CREATE TABLE networking_posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url VARCHAR(500),
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Networking Connections table
CREATE TABLE networking_connections (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    connected_user_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, connected_user_id)
);

-- Networking Messages table
CREATE TABLE networking_messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_leads_user ON crm_leads(user_id);
CREATE INDEX idx_leads_status ON crm_leads(status);
CREATE INDEX idx_deals_user ON crm_deals(user_id);
CREATE INDEX idx_deals_stage ON crm_deals(stage);
CREATE INDEX idx_employees_user ON hr_employees(user_id);
CREATE INDEX idx_invoices_user ON accounting_invoices(user_id);
CREATE INDEX idx_invoices_status ON accounting_invoices(status);
CREATE INDEX idx_posts_user ON networking_posts(user_id);
CREATE INDEX idx_posts_created ON networking_posts(created_at DESC);
CREATE INDEX idx_connections_user ON networking_connections(user_id);
CREATE INDEX idx_messages_sender ON networking_messages(sender_id);
CREATE INDEX idx_messages_receiver ON networking_messages(receiver_id);
CREATE INDEX idx_messages_created ON networking_messages(created_at DESC);
