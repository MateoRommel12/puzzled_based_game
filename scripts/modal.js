/**
 * Custom Modal System
 * Beautiful, animated confirmation dialogs
 */

class ModalManager {
    constructor() {
        this.activeModal = null;
        this.init();
    }

    init() {
        // Create modal HTML if it doesn't exist
        if (!document.getElementById('modalOverlay')) {
            this.createModalHTML();
        }
        
        // Add CSS if not already added
        if (!document.getElementById('modalCSS')) {
            this.addModalCSS();
        }
    }

    addModalCSS() {
        // Don't add CSS if it's already in the page
        const existingLink = document.querySelector('link[href*="modal.css"]');
        if (existingLink) {
            return;
        }
        
        const link = document.createElement('link');
        link.id = 'modalCSS';
        link.rel = 'stylesheet';
        
        // Detect if we're in admin folder or root
        const isInAdminFolder = window.location.pathname.includes('/admin/');
        link.href = isInAdminFolder ? '../styles/modal.css' : 'styles/modal.css';
        
        document.head.appendChild(link);
    }

    createModalHTML() {
        const modalHTML = `
            <div id="modalOverlay" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <div class="modal-icon" id="modalIcon">⚠️</div>
                        <h3 class="modal-title" id="modalTitle">Confirm Action</h3>
                    </div>
                    <p class="modal-message" id="modalMessage">Are you sure you want to proceed?</p>
                    <div class="modal-buttons" id="modalButtons">
                        <button class="modal-btn modal-btn-secondary" id="modalCancel">Cancel</button>
                        <button class="modal-btn modal-btn-primary" id="modalConfirm">Confirm</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Store the bound handler for Escape key
        this.escapeHandler = (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.hide();
                if (this.activeModal.onCancel) {
                    this.activeModal.onCancel();
                }
            }
        };
        
        document.addEventListener('keydown', this.escapeHandler);
    }

    show(options = {}) {
        const {
            title = 'Confirm Action',
            message = 'Are you sure you want to proceed?',
            type = 'warning', // warning, success, danger, info
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            confirmClass = 'modal-btn-primary',
            onConfirm = null,
            onCancel = null,
            showCancel = true,
            highZIndex = false // For showing above other modals
        } = options;

        this.activeModal = {
            onConfirm,
            onCancel
        };

        // Update modal content
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const modalConfirm = document.getElementById('modalConfirm');
        const modalCancel = document.getElementById('modalCancel');
        
        if (!modalTitle || !modalMessage || !modalConfirm || !modalCancel) {
            return;
        }
        
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalConfirm.textContent = confirmText;
        modalCancel.textContent = cancelText;

        // Update icon and colors based on type
        const icon = document.getElementById('modalIcon');
        const confirmBtn = document.getElementById('modalConfirm');
        const cancelBtn = document.getElementById('modalCancel');
        const overlay = document.getElementById('modalOverlay');

        // Reset classes
        icon.className = 'modal-icon';
        confirmBtn.className = 'modal-btn';
        cancelBtn.style.display = showCancel ? 'block' : 'none';

        switch (type) {
            case 'success':
                icon.textContent = '✅';
                icon.classList.add('success');
                confirmBtn.classList.add('modal-btn-success');
                break;
            case 'danger':
                icon.textContent = '🗑️';
                icon.classList.add('danger');
                confirmBtn.classList.add('modal-btn-danger');
                break;
            case 'info':
                icon.textContent = 'ℹ️';
                icon.classList.add('info');
                confirmBtn.classList.add('modal-btn-primary');
                break;
            default: // warning
                icon.textContent = '⚠️';
                icon.classList.add('warning');
                confirmBtn.classList.add('modal-btn-danger');
        }

        // Remove old event listeners by cloning buttons
        const newConfirmBtn = confirmBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        // Add fresh event listeners for this specific modal
        newConfirmBtn.addEventListener('click', () => {
            this.hide();
            if (onConfirm) {
                onConfirm();
            }
        });

        newCancelBtn.addEventListener('click', () => {
            this.hide();
            if (onCancel) {
                onCancel();
            }
        });

        // Close on overlay click
        const overlayClickHandler = (e) => {
            if (e.target === overlay) {
                this.hide();
                if (onCancel) {
                    onCancel();
                }
                overlay.removeEventListener('click', overlayClickHandler);
            }
        };
        overlay.addEventListener('click', overlayClickHandler);

        // Set z-index based on highZIndex flag
        if (highZIndex) {
            overlay.style.zIndex = '99999';
        } else {
            overlay.style.zIndex = '10000';
        }

        // Show modal
        overlay.classList.add('active');
        
        // Focus on confirm button
        setTimeout(() => {
            newConfirmBtn.focus();
        }, 300);
    }

    hide() {
        const overlay = document.getElementById('modalOverlay');
        overlay.classList.remove('active');
        this.activeModal = null;
    }

    // Convenience methods for common use cases
    confirm(message, title = 'Confirm Action') {
        return new Promise((resolve) => {
            this.show({
                title,
                message,
                type: 'warning',
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        });
    }

    alert(message, title = 'Notice', type = 'info', highZIndex = false) {
        return new Promise((resolve) => {
            this.show({
                title,
                message,
                type,
                confirmText: 'OK',
                showCancel: false,
                highZIndex,
                onConfirm: () => resolve(true)
            });
        });
    }

    success(message, title = 'Success!', highZIndex = false) {
        return this.alert(message, title, 'success', highZIndex);
    }

    error(message, title = 'Error', highZIndex = false) {
        return this.alert(message, title, 'danger', highZIndex);
    }

    warning(message, title = 'Warning') {
        return this.alert(message, title, 'warning');
    }

    info(message, title = 'Information') {
        return this.alert(message, title, 'info');
    }

    delete(message, title = 'Delete Confirmation') {
        return new Promise((resolve) => {
            this.show({
                title,
                message,
                type: 'danger',
                confirmText: 'Delete',
                cancelText: 'Cancel',
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        });
    }
}

// Initialize modal manager when DOM is ready
let modalManagerInstance = null;

function initModalManager() {
    if (!modalManagerInstance) {
        modalManagerInstance = new ModalManager();
    }
    return modalManagerInstance;
}

// Initialize immediately
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.modalManager = initModalManager();
    });
} else {
    window.modalManager = initModalManager();
}

// Convenience functions for backward compatibility
window.showModal = (options) => {
    if (!window.modalManager) window.modalManager = initModalManager();
    return window.modalManager.show(options);
};

window.confirmModal = (message, title) => {
    if (!window.modalManager) window.modalManager = initModalManager();
    return window.modalManager.confirm(message, title);
};

window.alertModal = (message, title, type) => {
    if (!window.modalManager) window.modalManager = initModalManager();
    return window.modalManager.alert(message, title, type);
};

window.successModal = (message, title, highZIndex = false) => {
    if (!window.modalManager) window.modalManager = initModalManager();
    return window.modalManager.success(message, title, highZIndex);
};

window.errorModal = (message, title, highZIndex = false) => {
    if (!window.modalManager) window.modalManager = initModalManager();
    return window.modalManager.error(message, title, highZIndex);
};

window.warningModal = (message, title) => {
    if (!window.modalManager) window.modalManager = initModalManager();
    return window.modalManager.warning(message, title);
};

window.infoModal = (message, title) => {
    if (!window.modalManager) window.modalManager = initModalManager();
    return window.modalManager.info(message, title);
};

window.deleteModal = (message, title) => {
    if (!window.modalManager) {
        window.modalManager = initModalManager();
    }
    return window.modalManager.delete(message, title);
};
