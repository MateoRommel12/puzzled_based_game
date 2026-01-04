// Profile Management System

class ProfileManager {
    constructor() {
        this.profileData = null;
        this.isModalOpen = false;
    }

    /**
     * Wait for modal system to be available
     */
    async waitForModalSystem() {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        
        while (attempts < maxAttempts) {
            if (typeof window.successModal === 'function' && typeof window.errorModal === 'function') {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        return false;
    }

    /**
     * Show success modal with fallback
     */
    async showSuccessModal(message, title = 'Success') {
        await this.waitForModalSystem();
        
        // Use high z-index if profile modal is open
        const highZIndex = this.isModalOpen;
        
        if (typeof window.successModal === 'function') {
            await window.successModal(message, title, highZIndex);
        } else if (typeof successModal === 'function') {
            await successModal(message, title, highZIndex);
        } else {
            alert(message);
        }
    }

    /**
     * Show error modal with fallback
     */
    async showErrorModal(message, title = 'Error') {
        await this.waitForModalSystem();
        
        // Use high z-index if profile modal is open
        const highZIndex = this.isModalOpen;
        
        if (typeof window.errorModal === 'function') {
            await window.errorModal(message, title, highZIndex);
        } else if (typeof errorModal === 'function') {
            await errorModal(message, title, highZIndex);
        } else {
            alert(message);
        }
    }

    /**
     * Initialize profile manager
     */
    init() {
        this.setupEventListeners();
        this.loadProfileData();
        
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Avatar click handler
        const avatar = document.querySelector('.user-avatar');
        if (avatar) {
            avatar.addEventListener('click', () => {
                this.openProfileModal();
            });
        }

        // Modal close handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeProfileModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen) {
                this.closeProfileModal();
            }
        });

        // Form submission handlers
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'profileForm') {
                e.preventDefault();
                this.updateProfile();
            }
            if (e.target.id === 'passwordForm') {
                e.preventDefault();
                this.changePassword();
            }
        });
    }

    /**
     * Load profile data
     */
    async loadProfileData() {
        try {
            const response = await fetch('/ClusteringGame/api/profile.php?action=get');
            const result = await response.json();

            if (result.success) {
                this.profileData = result.profile;
                this.updateProfileDisplay();
            } else {
                alert('Error loading profile: ' + result.message);
            }
        } catch (error) {
            alert('Error loading profile data: ' + error.message);
        }
    }

    /**
     * Update profile display in header
     */
    updateProfileDisplay() {
        if (!this.profileData) return;

        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = this.profileData.full_name;
        }

        const gamesPlayedElement = document.getElementById('gamesPlayed');
        if (gamesPlayedElement) {
            gamesPlayedElement.textContent = this.profileData.games_played || 0;
        }

        const totalScoreElement = document.getElementById('totalScore');
        if (totalScoreElement) {
            totalScoreElement.textContent = this.profileData.total_score || 0;
        }
    }

    /**
     * Open profile modal
     */
    openProfileModal() {
        if (!this.profileData) {
            this.loadProfileData().then(() => {
                this.showProfileModal();
            });
        } else {
            this.showProfileModal();
        }
    }

    /**
     * Show profile modal
     */
    showProfileModal() {
        const modal = this.createProfileModal();
        document.body.appendChild(modal);
        
        // Add animation
        setTimeout(() => {
            modal.classList.add('modal-show');
        }, 10);
        
        this.isModalOpen = true;
        
        // Focus first input
        const firstInput = modal.querySelector('input[type="text"]');
        if (firstInput) {
            firstInput.focus();
        }
    }

    /**
     * Create profile modal HTML
     */
    createProfileModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="profile-modal">
                <div class="profile-modal-header">
                    <h2>👤 Edit Profile</h2>
                    <button class="modal-close-btn" onclick="profileManager.closeProfileModal()">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                
                <div class="profile-modal-content">
                    <div class="profile-tabs">
                        <button class="profile-tab active" data-tab="profile">Profile Info</button>
                        <button class="profile-tab" data-tab="password">Change Password</button>
                    </div>
                    
                    <div class="profile-tab-content">
                        <!-- Profile Info Tab -->
                        <div id="profileTab" class="profile-tab-panel active">
                            <form id="profileForm" class="profile-form">
                                <div class="form-group">
                                    <label for="fullName">Full Name</label>
                                    <input type="text" id="fullName" name="full_name" value="${this.escapeHtml(this.profileData?.full_name || '')}" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="email">Email Address</label>
                                    <input type="email" id="email" name="email" value="${this.escapeHtml(this.profileData?.email || '')}" required>
                                </div>
                                
                                <div class="form-group">
                                    <label>Account Created</label>
                                    <input type="text" value="${this.formatDate(this.profileData?.created_at)}" readonly>
                                </div>
                                
                                <div class="form-group">
                                    <label>Last Login</label>
                                    <input type="text" value="${this.formatDate(this.profileData?.last_login)}" readonly>
                                </div>
                                
                                <div class="form-actions">
                                    <button type="button" class="btn-secondary" onclick="profileManager.closeProfileModal()">Cancel</button>
                                    <button type="submit" class="btn-primary">Save Changes</button>
                                </div>
                            </form>
                        </div>
                        
                        <!-- Change Password Tab -->
                        <div id="passwordTab" class="profile-tab-panel">
                            <form id="passwordForm" class="profile-form">
                                <div class="form-group">
                                    <label for="currentPassword">Current Password</label>
                                    <input type="password" id="currentPassword" name="current_password" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="newPassword">New Password</label>
                                    <input type="password" id="newPassword" name="new_password" required minlength="6">
                                    <small class="form-help">Password must be at least 6 characters long</small>
                                </div>
                                
                                <div class="form-group">
                                    <label for="confirmPassword">Confirm New Password</label>
                                    <input type="password" id="confirmPassword" name="confirm_password" required minlength="6">
                                </div>
                                
                                <div class="form-actions">
                                    <button type="button" class="btn-secondary" onclick="profileManager.closeProfileModal()">Cancel</button>
                                    <button type="submit" class="btn-primary">Change Password</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Setup tab switching
        modal.querySelectorAll('.profile-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchProfileTab(e.target.dataset.tab);
            });
        });
        
        return modal;
    }

    /**
     * Switch profile tab
     */
    switchProfileTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.profile-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab panels
        document.querySelectorAll('.profile-tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
    }

    /**
     * Close profile modal
     */
    closeProfileModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.classList.remove('modal-show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
        this.isModalOpen = false;
    }

    /**
     * Update profile
     */
    async updateProfile() {
        const form = document.getElementById('profileForm');
        if (!form) {
            await this.showErrorModal('Profile form not found!', 'Error');
            return;
        }
        
        const formData = new FormData(form);
        
        const data = {
            full_name: formData.get('full_name'),
            email: formData.get('email')
        };
        
        try {
            const response = await fetch('/ClusteringGame/api/profile.php?action=update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                await this.showSuccessModal('Profile updated successfully!', 'Success');
                
                this.profileData.full_name = data.full_name;
                this.profileData.email = data.email;
                this.updateProfileDisplay();
                this.closeProfileModal();
            } else {
                await this.showErrorModal('Error: ' + result.message, 'Update Failed');
            }
        } catch (error) {
            await this.showErrorModal('Failed to update profile. Please try again.', 'Network Error');
        }
    }

    /**
     * Change password
     */
    async changePassword() {
        const form = document.getElementById('passwordForm');
        const formData = new FormData(form);
        
        const data = {
            current_password: formData.get('current_password'),
            new_password: formData.get('new_password'),
            confirm_password: formData.get('confirm_password')
        };
        
        // Client-side validation
        console.log('Password validation data:', data);
        
        if (data.new_password !== data.confirm_password) {
            console.log('Password mismatch detected');
            await this.showErrorModal('New passwords do not match!', 'Password Mismatch');
            return;
        }
        
        if (data.new_password.length < 6) {
            console.log('Password too short detected');
            await this.showErrorModal('New password must be at least 6 characters long!', 'Password Too Short');
            return;
        }
        
        if (!data.current_password) {
            console.log('Missing current password detected');
            await this.showErrorModal('Current password is required!', 'Missing Password');
            return;
        }
        
        try {
            const response = await fetch('/ClusteringGame/api/profile.php?action=change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            // Temporary debugging - remove this after testing
            console.log('Password change response:', result);
            
            if (result.success) {
                await this.showSuccessModal('Password changed successfully!', 'Success');
                
                form.reset();
            } else {
                // Show specific error message from server
                const errorMessage = result.message || 'Unknown error occurred';
                console.log('Password change error:', errorMessage);
                await this.showErrorModal(errorMessage, 'Password Change Failed');
            }
        } catch (error) {
            await this.showErrorModal('Failed to change password. Please try again.', 'Network Error');
        }
    }

    /**
     * Get performance level label
     */
    getPerformanceLabel(level) {
        const labels = {
            'high': 'High Achiever 🏆',
            'medium': 'Average Performer 📚',
            'low': 'Needs Support 🎯'
        };
        return labels[level] || 'Unknown';
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

// Initialize global profile manager
const profileManager = new ProfileManager();

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit to ensure modal system is initialized
    setTimeout(() => {
        profileManager.init();
    }, 100);
});
