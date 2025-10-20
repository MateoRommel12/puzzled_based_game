// Admin Authentication Check - Include this in all admin protected pages
;(async () => {
  // List of admin pages that don't require authentication
  const publicAdminPages = ['admin-login.php', 'admin-login.html']
  
  const currentPage = window.location.pathname.split('/').pop()
  
  // Skip auth check for public admin pages
  if (publicAdminPages.includes(currentPage)) {
    return
  }
  
  // Skip if not in admin folder
  if (!window.location.pathname.includes('/admin/')) {
    return
  }

  const adminAuthManager = window.adminAuthManager
  
  if (!adminAuthManager) {
    window.location.href = "admin-login.php"
    return
  }

  // Check if admin is authenticated locally
  if (!adminAuthManager.isAuthenticated()) {
    window.location.href = "admin-login.php"
    return
  }
  
  // Verify session with backend
  try {
    const isValid = await adminAuthManager.checkSession()
    
    if (!isValid) {
      // Clear any cached data and redirect
      adminAuthManager.clearCurrentAdmin()
      localStorage.removeItem('currentAdmin')
      sessionStorage.clear()
      window.location.href = "admin-login.php"
    }
  } catch (error) {
    console.error("Admin session check failed:", error)
    // Clear any cached data and redirect on error
    adminAuthManager.clearCurrentAdmin()
    localStorage.removeItem('currentAdmin')
    sessionStorage.clear()
    window.location.href = "admin-login.php"
  }
})()
