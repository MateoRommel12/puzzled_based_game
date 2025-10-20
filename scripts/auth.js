// Authentication Manager - Database Backend Integration
class AuthManager {
  constructor() {
    this.apiUrl = "/ClusteringGame/api/auth.php"
    this.currentUserKey = "currentUser"
  }

  getCurrentUser() {
    const userData = localStorage.getItem(this.currentUserKey)
    return userData ? JSON.parse(userData) : null
  }

  setCurrentUser(user) {
    localStorage.setItem(this.currentUserKey, JSON.stringify(user))
  }

  clearCurrentUser() {
    localStorage.removeItem(this.currentUserKey)
  }

  async register(fullName, email, password, confirmPassword) {
    try {
      // Get CSRF token from form
      const csrfToken = document.querySelector('input[name="csrf_token"]')?.value;
      
      const response = await fetch(`${this.apiUrl}?action=register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
          confirmPassword,
        }),
      })

      const result = await response.json()
      
      if (result.success && result.user) {
        this.setCurrentUser(result.user)
      }
      
      return result
    } catch (error) {
      console.error("Registration error:", error)
      return {
        success: false,
        message: "Network error. Please check your connection.",
      }
    }
  }

  async login(email, password) {
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
          email,
          password,
        }),
      })

      const result = await response.json()
      
      if (result.success && result.user) {
        this.setCurrentUser(result.user)
      }
      
      return result
    } catch (error) {
      console.error("Login error:", error)
      
      // Handle different types of errors
      if (error instanceof SyntaxError) {
        return {
          success: false,
          message: "Server error. Please try again later.",
        }
      }
      
      return {
        success: false,
        message: "Network error. Please check your connection.",
      }
    }
  }

  async logout() {
    try {
      // Clear user data immediately
      this.clearCurrentUser()
      localStorage.removeItem('currentUser')
      sessionStorage.clear()
      
      // Call logout API (don't wait for response)
      fetch(`${this.apiUrl}?action=logout`, {
        method: "POST",
      }).catch(err => console.error("Logout API error:", err))
      
      // Determine the correct login path
      const isInGamesFolder = window.location.pathname.includes('/games/')
      const loginPath = isInGamesFolder ? "../login.php" : "login.php"
      
      // Force redirect to login page with cache busting
      window.location.href = loginPath + "?logout=" + Date.now()
    } catch (error) {
      console.error("Logout error:", error)
      // Still redirect even if error
      const isInGamesFolder = window.location.pathname.includes('/games/')
      const loginPath = isInGamesFolder ? "../login.php" : "login.php"
      window.location.href = loginPath + "?logout=" + Date.now()
    }
  }

  async checkSession() {
    try {
      const response = await fetch(`${this.apiUrl}?action=check-session`)
      const result = await response.json()
      
      if (result.success && result.user) {
        this.setCurrentUser(result.user)
        return true
      } else {
        this.clearCurrentUser()
        return false
      }
    } catch (error) {
      console.error("Session check error:", error)
      return false
    }
  }

  isAuthenticated() {
    return this.getCurrentUser() !== null
  }
}

// Initialize Auth Manager
const authManager = new AuthManager()

// Login Form Handler
if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault()

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const errorMessage = document.getElementById("errorMessage")
    const submitButton = e.target.querySelector('button[type="submit"]')

    // Disable button during request
    submitButton.disabled = true
    submitButton.innerHTML = '<span>Logging in...</span>'

    const result = await authManager.login(email, password)

    if (result.success) {
      // Redirect to dashboard
      window.location.href = "index.php"
    } else {
      submitButton.disabled = false
      submitButton.innerHTML = '<span>Login</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>'
      
      errorMessage.textContent = result.message
      errorMessage.classList.add("show")

      setTimeout(() => {
        errorMessage.classList.remove("show")
      }, 3000)
    }
  })
}

// Register Form Handler
if (document.getElementById("registerForm")) {
  document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault()

    const fullName = document.getElementById("fullName").value
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const confirmPassword = document.getElementById("confirmPassword").value
    const errorMessage = document.getElementById("errorMessage")
    const successMessage = document.getElementById("successMessage")
    const submitButton = e.target.querySelector('button[type="submit"]')

    // Disable button during request
    submitButton.disabled = true
    submitButton.innerHTML = '<span>Creating Account...</span>'

    const result = await authManager.register(fullName, email, password, confirmPassword)

    if (result.success) {
      successMessage.textContent = "Account created successfully! Redirecting to login..."
      successMessage.classList.add("show")

      setTimeout(() => {
        window.location.href = "login.php"
      }, 2000)
    } else {
      submitButton.disabled = false
      submitButton.innerHTML = '<span>Create Account</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>'
      
      errorMessage.textContent = result.message
      errorMessage.classList.add("show")
      setTimeout(() => errorMessage.classList.remove("show"), 3000)
    }
  })
}

// Export for use in other pages
if (typeof window !== "undefined") {
  window.authManager = authManager
}
