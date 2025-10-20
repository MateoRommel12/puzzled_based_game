// Admin Authentication Check - Include this in all admin pages
;(async () => {
  const currentPage = window.location.pathname.split('/').pop()
  
  // Skip auth check for admin login page
  if (currentPage === 'admin-login.php' || currentPage === 'admin-login.html') {
    return
  }

  const adminAuthManager = window.adminAuthManager
  
  if (!adminAuthManager) {
    window.location.href = "admin-login.php"
    return
  }

  // Check if admin is authenticated locally
  if (!adminAuthManager.isLoggedIn()) {
    const isInAdminFolder = window.location.pathname.includes('/admin/')
    window.location.href = isInAdminFolder ? "admin-login.php" : "admin/admin-login.php"
    return
  }
  
  // Verify session with backend
  const isValid = await adminAuthManager.checkSession()
  
  if (!isValid) {
    const isInAdminFolder = window.location.pathname.includes('/admin/')
    window.location.href = isInAdminFolder ? "admin-login.php" : "admin/admin-login.php"
  }
})()
