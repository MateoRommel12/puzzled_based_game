    // Student Management System

    class StudentManager {
        constructor() {
            this.currentPage = 1;
            this.currentLimit = 20;
            this.currentSearch = '';
            this.currentStatus = 'all';
            this.students = [];
            this.totalPages = 1;
            this.isLoading = false;
        }

        /**
         * Initialize student manager
         */
        init() {
            this.setupEventListeners();
            this.loadStudents();
        }

        /**
         * Setup event listeners
         */
        setupEventListeners() {
            // Search input
            const searchInput = document.getElementById('studentSearch');
            if (searchInput) {
                let searchTimeout;
                searchInput.addEventListener('input', (e) => {
                    clearTimeout(searchTimeout);
                    searchTimeout = setTimeout(() => {
                        this.currentSearch = e.target.value;
                        this.currentPage = 1;
                        this.loadStudents();
                    }, 300);
                });
            }

            // Status filter
            const statusFilter = document.getElementById('statusFilter');
            if (statusFilter) {
                statusFilter.addEventListener('change', (e) => {
                    this.currentStatus = e.target.value;
                    this.currentPage = 1;
                    this.loadStudents();
                });
            }

            // Add student button
            const addStudentBtn = document.getElementById('addStudentBtn');
            if (addStudentBtn) {
                addStudentBtn.addEventListener('click', () => {
                    this.openAddStudentModal();
                });
            }

            // Pagination
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('pagination-btn')) {
                    const page = parseInt(e.target.dataset.page);
                    if (page && page !== this.currentPage) {
                        this.currentPage = page;
                        this.loadStudents();
                    }
                }
            });

            // Form submissions
            document.addEventListener('submit', (e) => {
                if (e.target.id && e.target.id.includes('addStudentForm')) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Prevent duplicate submissions
                    if (e.target.dataset.submitting === 'true') {
                        return;
                    }
                    
                    e.target.dataset.submitting = 'true';
                    this.createStudent(e.target).finally(() => {
                        e.target.dataset.submitting = 'false';
                    });
                }
                if (e.target.id && e.target.id.includes('editStudentForm')) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Prevent duplicate submissions
                    if (e.target.dataset.submitting === 'true') {
                        return;
                    }
                    
                    e.target.dataset.submitting = 'true';
                    this.updateStudent(e.target).finally(() => {
                        e.target.dataset.submitting = 'false';
                    });
                }
            });
        }

        /**
         * Load students from API
         */
        async loadStudents() {
            const container = document.getElementById('studentManagementTableBody');
            if (!container) {
                return;
            }

            // Prevent multiple simultaneous calls
            if (this.isLoading) {
                return;
            }

            this.isLoading = true;
            // Show loading state
            this.showLoadingState(container);

            try {
                const params = new URLSearchParams({
                    page: this.currentPage,
                    limit: this.currentLimit,
                    search: this.currentSearch,
                    status: this.currentStatus
                });

                const apiUrl = `/ClusteringGame/api/student-management.php?action=list&${params}`;

                const response = await fetch(apiUrl);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();

                if (result.success) {
                    this.students = result.students;
                    this.totalPages = result.pagination.pages;
                    this.displayStudents(result.students);
                    this.updatePagination(result.pagination);
                    this.updateStats(result.students);
                } else {
                    this.showErrorState(container, result.message);
                }
            } catch (error) {
                this.showErrorState(container, 'Failed to load students: ' + error.message);
            } finally {
                this.isLoading = false;
            }
        }

        /**
         * Display students in table
         */
        displayStudents(students) {
            const container = document.getElementById('studentManagementTableBody');
            if (!container) {
                return;
            }

            if (!students || students.length === 0) {
                container.innerHTML = `
                    <tr>
                        <td colspan="8" class="no-students">
                            <div class="empty-state">
                                <div class="empty-icon">👥</div>
                                <h3>No Students Found</h3>
                                <p>Try adjusting your search or filter criteria</p>
                            </div>
                        </td>
                    </tr>
                `;
                return;
            }

            container.innerHTML = students.map(student => this.createStudentRow(student)).join('');
        }

        /**
         * Create student table row
         */
        createStudentRow(student) {
            const statusClass = student.is_active ? 'status-active' : 'status-inactive';
            const statusText = student.is_active ? 'Active' : 'Inactive';
            const performanceClass = this.getPerformanceClass(student.performance_level);
            
            return `
                <tr data-user-id="${student.user_id}">
                    <td>
                        <div class="student-info">
                            <div class="student-name">${this.escapeHtml(student.full_name)}</div>
                            <div class="student-email">${this.escapeHtml(student.email)}</div>
                        </div>
                    </td>
                    <td>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </td>
                    <td>${student.total_score || 0}</td>
                    <td>${student.games_played || 0}</td>
                    <td>${Math.round(student.literacy_progress || 0)}%</td>
                    <td>${Math.round(student.math_progress || 0)}%</td>
                    <td>
                        <span class="performance-badge ${performanceClass}">
                            ${this.getPerformanceLabel(student.performance_level)}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="studentManager.openEditStudentModal(${student.user_id})" title="Edit Student">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button class="btn-toggle" onclick="studentManager.toggleStudentStatus(${student.user_id})" title="Toggle Status">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M9 12l2 2 4-4"></path>
                                    <path d="M21 12c.552 0 1-.448 1-1V8c0-.552-.448-1-1-1h-3.586l-1.707-1.707A1 1 0 0 0 14.586 5H9.414a1 1 0 0 0-.707.293L6.586 7H3c-.552 0-1 .448-1 1v3c0 .552.448 1 1 1"></path>
                                </svg>
                            </button>
                            <button class="btn-delete" onclick="studentManager.deleteStudent(${student.user_id}, '${this.escapeHtml(student.full_name)}')" title="Delete Student">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }

        /**
         * Update pagination
         */
        updatePagination(pagination) {
            const container = document.getElementById('paginationContainer');
            if (!container) return;

            if (pagination.pages <= 1) {
                container.innerHTML = '';
                return;
            }

            let paginationHTML = '<div class="pagination">';
            
            // Previous button
            if (pagination.page > 1) {
                paginationHTML += `
                    <button class="pagination-btn" data-page="${pagination.page - 1}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                        Previous
                    </button>
                `;
            }

            // Page numbers
            const startPage = Math.max(1, pagination.page - 2);
            const endPage = Math.min(pagination.pages, pagination.page + 2);

            for (let i = startPage; i <= endPage; i++) {
                const isActive = i === pagination.page ? 'active' : '';
                paginationHTML += `<button class="pagination-btn ${isActive}" data-page="${i}">${i}</button>`;
            }

            // Next button
            if (pagination.page < pagination.pages) {
                paginationHTML += `
                    <button class="pagination-btn" data-page="${pagination.page + 1}">
                        Next
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                `;
            }

            paginationHTML += '</div>';
            container.innerHTML = paginationHTML;
        }

        /**
         * Update stats display
         */
        updateStats(students) {
            const activeCount = students.filter(s => s.is_active).length;
            const inactiveCount = students.length - activeCount;
            const totalGames = students.reduce((sum, s) => sum + (s.games_played || 0), 0);

            const activeElement = document.getElementById('activeStudentsCount');
            const inactiveElement = document.getElementById('inactiveStudentsCount');
            const gamesElement = document.getElementById('totalGamesCount');

            if (activeElement) activeElement.textContent = activeCount;
            if (inactiveElement) inactiveElement.textContent = inactiveCount;
            if (gamesElement) gamesElement.textContent = totalGames;
        }

        /**
         * Open add student modal
         */
        openAddStudentModal() {
            const modal = this.createStudentModal('add');
            document.body.appendChild(modal);
            
            setTimeout(() => {
                modal.classList.add('modal-show');
            }, 10);
            
            // Focus first input
            const firstInput = modal.querySelector('input[type="text"]');
            if (firstInput) firstInput.focus();
        }

        /**
         * Open edit student modal
         */
        async openEditStudentModal(userId) {
            const student = this.students.find(s => s.user_id == userId);
            if (!student) {
                return;
            }

            const modal = this.createStudentModal('edit', student);
            document.body.appendChild(modal);
            
            setTimeout(() => {
                modal.classList.add('modal-show');
            }, 10);
            
            // Focus first input
            const firstInput = modal.querySelector('input[type="text"]');
            if (firstInput) firstInput.focus();
        }

        /**
         * Create student modal
         */
        createStudentModal(type, student = null) {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            if (type === 'edit' && student) {
                modal.setAttribute('data-user-id', student.user_id);
            }
            
            // Generate unique IDs for modal form elements
            const modalId = `${type}-modal-${Date.now()}`;
            const formId = `${type}StudentForm-${modalId}`;
            const fullNameId = `fullName-${modalId}`;
            const emailId = `email-${modalId}`;
            const passwordId = `password-${modalId}`;
            
            modal.innerHTML = `
                <div class="student-modal">
                    <div class="student-modal-header">
                        <h2>${type === 'add' ? '➕ Add New Student' : '✏️ Edit Student'}</h2>
                        <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>  
                        </button>
                    </div>
                    
                    <div class="student-modal-content">
                        <form id="${formId}" class="student-form">
                            <div class="form-group">
                                <label for="${fullNameId}">Full Name *</label>
                                <input type="text" id="${fullNameId}" name="full_name" autocomplete="name" value="${student ? this.escapeHtml(student.full_name) : ''}" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="${emailId}">Email Address *</label>
                                <input type="email" id="${emailId}" name="email" autocomplete="email" value="${student ? this.escapeHtml(student.email) : ''}" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="${modalId}">Password ${type === 'add' ? '*' : '(leave blank to keep current)'}</label>
                                <input type="password" id="${modalId}" name="password" autocomplete="new-password" ${type === 'add' ? 'required' : ''}>
                                <small class="form-help">Password must be at least 6 characters long</small>
                            </div>
                            
                            ${type === 'edit' ? `
                                <div class="form-group">
                                    <label>Account Created</label>
                                    <input type="text" value="${this.formatDate(student.created_at)}" readonly>
                                </div>
                                
                                <div class="form-group">
                                    <label>Last Login</label>
                                    <input type="text" value="${this.formatDate(student.last_login)}" readonly>
                                </div>
                            ` : ''}
                            
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                                <button type="submit" class="btn-primary">${type === 'add' ? 'Create Student' : 'Update Student'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            
            return modal;
        }

        /**
         * Create student
         */
        async createStudent(formElement = null) {
            const form = formElement || document.querySelector('form[id*="addStudentForm"]');
            
            if (!form) {
                return;
            }
            
            const formData = new FormData(form);
            
            const data = {
                full_name: formData.get('full_name') || '',
                email: formData.get('email') || '',
                password: formData.get('password') || ''
            };
            
            try {
                const response = await fetch('/ClusteringGame/api/student-management.php?action=create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    const modal = form.closest('.modal-overlay');
                    if (modal) {
                        modal.style.display = 'none';
                    }
                    await successModal('Student created successfully!', 'Success', true); // ✅ Set highZIndex to true
                    this.loadStudents();
                } else {
                    await errorModal('Error: ' + result.message, 'Create Failed');
                }
            } catch (error) {
                console.error('Error creating student:', error);
                await errorModal('Failed to create student. Please try again.', 'Network Error');
            }
        }
        /**
         * Update student
         */
        async updateStudent(formElement = null) {
            const form = formElement || document.querySelector('form[id*="editStudentForm"]');
            const formData = new FormData(form);
            const modalOverlay = form.closest('.modal-overlay');
            const userId = modalOverlay?.getAttribute('data-user-id');
            
            if (!userId) {
                return;
            }
            
            const data = {
                full_name: formData.get('full_name'),
                email: formData.get('email'),
                password: formData.get('password')
            };
            
            try {
                const response = await fetch(`/ClusteringGame/api/student-management.php?action=update&user_id=${userId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    await successModal('Student updated successfully!', 'Success');
                    const modal = document.querySelector('.modal-overlay[data-user-id="' + userId + '"]');
                    if (modal) {
                        modal.remove(); // or modal.style.display = 'none';
                    }
                    this.loadStudents();
                } else {
                    await errorModal('Error: ' + result.message, 'Update Failed');
                }
            } catch (error) {
                console.error('Error updating student:', error);
                await errorModal('Failed to update student. Please try again.', 'Network Error');
            }
        }

        /**
         * Toggle student status
         */
        async toggleStudentStatus(userId) {
            try {
                const response = await fetch(`/ClusteringGame/api/student-management.php?action=toggle-status&user_id=${userId}`, {
                    method: 'POST'
                });
                
                const result = await response.json();
                
                if (result.success) {
                    const statusText = result.is_active ? 'activated' : 'deactivated';
                    await successModal(`Student ${statusText} successfully!`, 'Success');
                    this.loadStudents();
                } else {
                    await errorModal('Error: ' + result.message, 'Status Update Failed');
                }
            } catch (error) {
                console.error('Error toggling student status:', error);
                await errorModal('Failed to update student status. Please try again.', 'Network Error');
            }
        }

        /**
         * Delete student
         */
        async deleteStudent(userId, studentName) {
            const confirmed = await deleteModal(
                `Are you sure you want to delete "${studentName}"? This action cannot be undone and will permanently remove the student and all their data.`,
                "Delete Student"
            );
            
            if (!confirmed) return;
            
            try {
                const response = await fetch(`/ClusteringGame/api/student-management.php?action=delete&user_id=${userId}`, {
                    method: 'DELETE'
                });
                
                const result = await response.json();
                
                if (result.success) {
                    await successModal('Student deleted successfully!', 'Success');
                    this.loadStudents();
                } else {
                    await errorModal('Error: ' + result.message, 'Delete Failed');
                }
            } catch (error) {
                console.error('Error deleting student:', error);
                await errorModal('Failed to delete student. Please try again.', 'Network Error');
            }
        }

        /**
         * Show loading state
         */
        showLoadingState(container) {
            container.innerHTML = `
                <tr>
                    <td colspan="8" class="loading-state">
                        <div class="loading-spinner"></div>
                        <p>Loading students...</p>
                    </td>
                </tr>
            `;
        }

        /**
         * Show error state
         */
        showErrorState(container, message) {
            container.innerHTML = `
                <tr>
                    <td colspan="8" class="error-state">
                        <div class="error-icon">⚠️</div>
                        <h3>Error Loading Students</h3>
                        <p>${this.escapeHtml(message)}</p>
                        <button class="retry-btn" onclick="studentManager.loadStudents()">Try Again</button>
                    </td>
                </tr>
            `;
        }

        /**
         * Get performance class
         */
        getPerformanceClass(level) {
            const classes = {
                'high': 'high-perf',
                'medium': 'medium-perf',
                'low': 'low-perf'
            };
            return classes[level] || 'low-perf';
        }

        /**
         * Get performance label
         */
        getPerformanceLabel(level) {
            const labels = {
                'high': 'High',
                'medium': 'Medium',
                'low': 'Low'
            };
            return labels[level] || 'Low';
        }

        /**
         * Format date for display
         */
        formatDate(dateString) {
            if (!dateString) return 'Never';
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        }

        /**
         * Escape HTML to prevent XSS
         */
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    }

    // Initialize global student manager
    const studentManager = new StudentManager();

    // Auto-initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('studentManagementTableBody')) {
            studentManager.init();
        }
    });
