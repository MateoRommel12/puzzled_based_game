/**
 * Loading States and UI Utilities
 * Provides consistent loading states across the application
 */

class LoadingManager {
    constructor() {
        this.activeLoaders = new Set();
        this.loadingOverlay = null;
    }

    /**
     * Show a loading overlay with message
     */
    showOverlay(message = 'Loading...', showSpinner = true) {
        if (this.loadingOverlay) {
            this.hideOverlay();
        }

        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay fade-in';
        overlay.id = 'global-loading-overlay';
        
        const content = document.createElement('div');
        content.className = 'loading-content';
        
        if (showSpinner) {
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner-large';
            content.appendChild(spinner);
        }
        
        const text = document.createElement('p');
        text.className = 'loading-text';
        text.textContent = message;
        content.appendChild(text);
        
        overlay.appendChild(content);
        document.body.appendChild(overlay);
        
        this.loadingOverlay = overlay;
        this.activeLoaders.add('overlay');
    }

    /**
     * Hide the loading overlay
     */
    hideOverlay() {
        if (this.loadingOverlay) {
            this.loadingOverlay.remove();
            this.loadingOverlay = null;
            this.activeLoaders.delete('overlay');
        }
    }

    /**
     * Show loading state for a button
     */
    showButtonLoading(button, loadingText = 'Loading...') {
        const originalText = button.innerHTML;
        button.dataset.originalText = originalText;
        button.disabled = true;
        
        button.innerHTML = `
            <span class="loading-spinner"></span>
            ${loadingText}
        `;
        
        button.classList.add('loading');
        this.activeLoaders.add(`button-${button.id || 'unknown'}`);
    }

    /**
     * Hide loading state for a button
     */
    hideButtonLoading(button) {
        const originalText = button.dataset.originalText;
        if (originalText) {
            button.innerHTML = originalText;
            delete button.dataset.originalText;
        }
        
        button.disabled = false;
        button.classList.remove('loading');
        this.activeLoaders.delete(`button-${button.id || 'unknown'}`);
    }

    /**
     * Show loading state for a form
     */
    showFormLoading(form) {
        form.classList.add('form-loading');
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            this.showButtonLoading(submitButton);
        }
        this.activeLoaders.add(`form-${form.id || 'unknown'}`);
    }

    /**
     * Hide loading state for a form
     */
    hideFormLoading(form) {
        form.classList.remove('form-loading');
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            this.hideButtonLoading(submitButton);
        }
        this.activeLoaders.delete(`form-${form.id || 'unknown'}`);
    }

    /**
     * Show skeleton loading for content
     */
    showSkeleton(container, skeletonCount = 3) {
        container.classList.add('skeleton-container');
        
        for (let i = 0; i < skeletonCount; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'skeleton skeleton-text';
            container.appendChild(skeleton);
        }
        
        this.activeLoaders.add(`skeleton-${container.id || 'unknown'}`);
    }

    /**
     * Hide skeleton loading
     */
    hideSkeleton(container) {
        container.classList.remove('skeleton-container');
        const skeletons = container.querySelectorAll('.skeleton');
        skeletons.forEach(skeleton => skeleton.remove());
        this.activeLoaders.delete(`skeleton-${container.id || 'unknown'}`);
    }

    /**
     * Show error message with animation
     */
    showError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
        element.classList.add('shake');
        
        setTimeout(() => {
            element.classList.remove('shake');
        }, 500);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hideMessage(element);
        }, 5000);
    }

    /**
     * Show success message with animation
     */
    showSuccess(element, message) {
        element.textContent = message;
        element.style.display = 'block';
        element.classList.add('fade-in');
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            this.hideMessage(element);
        }, 3000);
    }

    /**
     * Hide message element
     */
    hideMessage(element) {
        element.style.display = 'none';
        element.classList.remove('fade-in', 'shake');
    }

    /**
     * Clear all loading states
     */
    clearAll() {
        this.activeLoaders.forEach(loader => {
            if (loader.startsWith('overlay')) {
                this.hideOverlay();
            } else if (loader.startsWith('button-')) {
                const buttonId = loader.replace('button-', '');
                const button = document.getElementById(buttonId);
                if (button) {
                    this.hideButtonLoading(button);
                }
            } else if (loader.startsWith('form-')) {
                const formId = loader.replace('form-', '');
                const form = document.getElementById(formId);
                if (form) {
                    this.hideFormLoading(form);
                }
            } else if (loader.startsWith('skeleton-')) {
                const containerId = loader.replace('skeleton-', '');
                const container = document.getElementById(containerId);
                if (container) {
                    this.hideSkeleton(container);
                }
            }
        });
        
        this.activeLoaders.clear();
    }

    /**
     * Get loading status
     */
    isLoading() {
        return this.activeLoaders.size > 0;
    }
}

// Create global instance
window.loadingManager = new LoadingManager();

// Utility functions for common use cases
window.showLoading = (message) => window.loadingManager.showOverlay(message);
window.hideLoading = () => window.loadingManager.hideOverlay();
window.showButtonLoading = (button, text) => window.loadingManager.showButtonLoading(button, text);
window.hideButtonLoading = (button) => window.loadingManager.hideButtonLoading(button);
window.showFormLoading = (form) => window.loadingManager.showFormLoading(form);
window.hideFormLoading = (form) => window.loadingManager.hideFormLoading(form);
window.showError = (element, message) => window.loadingManager.showError(element, message);
window.showSuccess = (element, message) => window.loadingManager.showSuccess(element, message);

// Auto-clear loading states on page unload
window.addEventListener('beforeunload', () => {
    window.loadingManager.clearAll();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, pause animations
        document.body.classList.add('page-hidden');
    } else {
        // Page is visible, resume animations
        document.body.classList.remove('page-hidden');
    }
});
