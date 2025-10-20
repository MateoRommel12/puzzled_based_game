// Admin Authentication Manager - Backend Integration
class AdminAuthManager {
  constructor() {
    // Always use absolute path from site root
    this.apiUrl = "/ClusteringGame/api/admin-auth.php"
    this.currentAdminKey = "currentAdmin"
  }

  getCurrentAdmin() {
    const adminData = localStorage.getItem(this.currentAdminKey)
    return adminData ? JSON.parse(adminData) : null
  }

  setCurrentAdmin(admin) {
    localStorage.setItem(this.currentAdminKey, JSON.stringify(admin))
  }

  clearCurrentAdmin() {
    localStorage.removeItem(this.currentAdminKey)
  }

  async login(username, password) {
    try {
      // Get CSRF token from form
      const csrfToken = document.querySelector('input[name="csrf_token"]')?.value;
      
      const response = await fetch(`${this.apiUrl}?action=login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      const result = await response.json()

      if (result.success && result.admin) {
        this.setCurrentAdmin(result.admin)
      }

      return result
    } catch (error) {
      console.error("Admin login error:", error)
      return {
        success: false,
        message: "Network error. Please check your connection.",
      }
    }
  }

  async logout() {
    try {
      // Clear admin data immediately
      this.clearCurrentAdmin()
      localStorage.removeItem('currentAdmin')
      sessionStorage.clear()
      
      // Call logout API (don't wait for response)
      fetch(`${this.apiUrl}?action=logout`, {
        method: "POST",
      }).catch(err => console.error("Admin logout API error:", err))
      
      // Determine the correct admin login path
      const isInAdminFolder = window.location.pathname.includes('/admin/')
      const loginPath = isInAdminFolder ? "admin-login.php" : "admin/admin-login.php"
      
      // Force redirect to admin login page with cache busting
      window.location.href = loginPath + "?logout=" + Date.now()
    } catch (error) {
      console.error("Admin logout error:", error)
      // Still redirect even if error
      const isInAdminFolder = window.location.pathname.includes('/admin/')
      const loginPath = isInAdminFolder ? "admin-login.php" : "admin/admin-login.php"
      window.location.href = loginPath + "?logout=" + Date.now()
    }
  }

  async checkSession() {
    try {
      const response = await fetch(`${this.apiUrl}?action=check-session`)
      const result = await response.json()

      if (result.success && result.admin) {
        this.setCurrentAdmin(result.admin)
        return true
      } else {
        this.clearCurrentAdmin()
        return false
      }
    } catch (error) {
      console.error("Admin session check error:", error)
      return false
    }
  }

  isLoggedIn() {
    return this.getCurrentAdmin() !== null
  }

  isAuthenticated() {
    return this.getCurrentAdmin() !== null
  }
}

// Initialize admin auth manager
const adminAuthManager = new AdminAuthManager()

// Handle admin login form
document.getElementById("adminLoginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault()

  const username = document.getElementById("username").value
  const password = document.getElementById("password").value
  const errorMessage = document.getElementById("errorMessage")
  const submitButton = e.target.querySelector('button[type="submit"]')

  // Disable button during request
  submitButton.disabled = true
  submitButton.innerHTML = "<span>Logging in...</span>"

  const result = await adminAuthManager.login(username, password)

  if (result.success) {
    // Check if we're in admin folder or root
    const isInAdminFolder = window.location.pathname.includes('/admin/')
    window.location.href = isInAdminFolder ? "admin-dashboard.php" : "admin/admin-dashboard.php"
  } else {
    submitButton.disabled = false
    submitButton.innerHTML = "<span>Login to Admin Panel</span>"

    errorMessage.textContent = result.message
    errorMessage.style.display = "block"

    setTimeout(() => {
      errorMessage.style.display = "none"
    }, 3000)
  }
})

// Export for use in other pages
if (typeof window !== "undefined") {
  window.adminAuthManager = adminAuthManager
}

// Admin logout function
async function adminLogout() {
  try {
    const confirmed = await confirmModal(
      "Are you sure you want to logout? You'll need to login again to access the admin panel.",
      "Logout Confirmation"
    );
    
    if (confirmed) {
      try {
        await adminAuthManager.logout()
        // The logout function will handle the redirect automatically
      } catch (error) {
        console.error("Admin logout error:", error)
        // Fallback redirect if logout fails
        const isInAdminFolder = window.location.pathname.includes('/admin/')
        window.location.href = isInAdminFolder ? "admin-login.php" : "admin/admin-login.php"
      }
    }
  } catch (error) {
    console.error("adminLogout error:", error)
  }
}

// Export logout function
if (typeof window !== "undefined") {
  window.adminLogout = adminLogout
}
