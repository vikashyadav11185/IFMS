// user-profile.js

document.addEventListener("DOMContentLoaded", function () {
  // Initialize sidebar toggle functionality
  initSidebar();

  // Load user profile data
  loadUserProfile();
  setupLogoutHandler();
  preventBackNavigation();
  checkAuthStatus();
});

// Handle sidebar toggle for mobile view
function initSidebar() {
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebar = document.getElementById("sidebar");

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", function () {
      sidebar.classList.toggle("active");
    });
  }
}

// Load user profile data from localStorage
function loadUserProfile() {
  // Get the authentication data from localStorage
  // Using accessToken as per your auth.js implementation
  const token = localStorage.getItem("accessToken");
  const userEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");

  if (!token || !userEmail) {
    // If no token or email exists, redirect to login page
    window.location.href = "index.html";
    return;
  }

  try {
    // Decode the JWT token to get additional user data (if available)
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
      throw new Error("Invalid token format");
    }

    // Decode the payload (second part of the token)
    const payload = JSON.parse(atob(tokenParts[1]));

    // Combine token payload with stored user data
    const userData = {
      email: userEmail,
      role: userRole,
      sub: payload.sub || "", // Username or subject from token (if available)
      fullName: payload.fullName || "", // Full name if available in token
    };

    // Update the profile information on the page
    updateProfileUI(userData);
  } catch (error) {
    console.error("Error processing user data:", error);
    // Use the available data even if token decoding fails
    updateProfileUI({
      email: userEmail,
      role: userRole,
    });
  }
}

// Update the UI with user profile data
function updateProfileUI(userData) {
  // Extract name from email if full name not available
  let displayName = "";

  // Try to use fullName from token if available
  if (userData.fullName) {
    displayName = userData.fullName;
  } else {
    // Extract username from email (before the @ symbol)
    const emailParts = userData.email.split("@");
    const username = emailParts[0];

    // Format username for display (capitalize first letter of each word)
    displayName = username
      .split(".")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  // Update profile name
  const profileNameElement = document.getElementById("profileName");
  if (profileNameElement) {
    profileNameElement.textContent = displayName;
  }

  // Update email
  const profileEmailElement = document.getElementById("profileEmail");
  if (profileEmailElement) {
    profileEmailElement.textContent = userData.email;
  }

  // Update role
  const profileRoleElement = document.getElementById("profileRole");
  if (profileRoleElement) {
    // Format role for display (e.g., "INTERVIEWER" to "Interviewer")
    let displayRole = userData.role || "";

    // Handle various role formats
    if (displayRole.includes("_")) {
      // Convert HR_MANAGER to HR Manager
      displayRole = displayRole
        .split("_")
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" ");
    } else {
      // Convert INTERVIEWER to Interviewer
      displayRole = displayRole.charAt(0) + displayRole.slice(1).toLowerCase();
    }

    profileRoleElement.textContent = displayRole;
  }

  // Update user name in the welcome message
  const userNameElement = document.getElementById("userName");
  if (userNameElement) {
    // Use first name or first part of display name for welcome message
    const firstName = displayName.split(" ")[0];
    userNameElement.textContent = firstName;
  }

  // Create avatar with user initials
  const userAvatarElement = document.getElementById("userAvatar");
  if (userAvatarElement) {
    const initials = getInitials(displayName);
    userAvatarElement.textContent = initials;
  }
}

// Get initials from user's name
function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

// Check if token is expired (utility function)
function isTokenExpired(token) {
  try {
    const tokenParts = token.split(".");
    const payload = JSON.parse(atob(tokenParts[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true; // Assume expired if can't decode
  }
}

function setupLogoutHandler() {
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    window.location.href = "index.html";
  });
}

function preventBackNavigation() {
  window.history.pushState(null, "", window.location.href);
  window.addEventListener("popstate", function () {
    window.history.pushState(null, "", window.location.href);
  });
}

function checkAuthStatus() {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("userRole");

  if (!token) {
    window.location.href = "index.html";
  }
}
