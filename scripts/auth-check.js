// Authentication Check - Include this in all protected pages
;(async () => {
  // List of pages that don't require authentication
  const publicPages = ['login.php', 'register.php', 'admin-login.php', 'login.html', 'register.html', 'admin-login.html']
  
  const currentPage = window.location.pathname.split('/').pop()
  
  // Skip auth check for public pages
  if (publicPages.includes(currentPage)) {
    return
  }

  const authManager = window.authManager
  
  if (!authManager) {
    window.location.href = "login.php"
    return
  }

  // Check if user is authenticated locally
  if (!authManager.isAuthenticated()) {
    window.location.href = "login.php"
    return
  }
  
  // Verify session with backend
  try {
    const isValid = await authManager.checkSession()
    
    if (!isValid) {
      // Clear any cached data and redirect
      authManager.clearCurrentUser()
      localStorage.removeItem('currentUser')
      sessionStorage.clear()
      window.location.href = "login.php"
    }
  } catch (error) {
    console.error("Session check failed:", error)
    // Clear any cached data and redirect on error
    authManager.clearCurrentUser()
    localStorage.removeItem('currentUser')
    sessionStorage.clear()
    window.location.href = "login.php"
  }
})()
