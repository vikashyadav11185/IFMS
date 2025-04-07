const API_BASE_URL = "http://localhost:9090/api";

class AuthAPI {
  // ✅ Email Validation Function
  static isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@nucleusteq\.com$/;
    return regex.test(email);
  }

  // ✅ Login Function
  static async login(email, password) {
    try {
      if (!AuthAPI.isValidEmail(email)) {
        throw new Error("Email is not valid");
      }

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      console.log("Login Response:", data);
      localStorage.setItem("accessToken", data.token);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userRole", data.role);

      alert("Welcome back, logged in successfully!");
      AuthAPI.redirectToDashboard(data.role);
      return data;
    } catch (error) {
      console.error("Login error:", error);
      document.getElementById("error-message").textContent = error.message;
    }
  }

  // ✅ Signup Function (Fixed)
  static async signup(
    fullName,
    email,
    password,
    confirmPassword,
    role,
    position
  ) {
    try {
      if (!AuthAPI.isValidEmail(email)) {
        throw new Error("Email is not valid");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          confirmPassword,
          role,
          position,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Signup failed");
      }

      alert("Registered successfully!");
      window.location.href = "index.html";
    } catch (error) {
      console.error("Signup error:", error);
      document.getElementById("error-message").textContent = error.message;
    }
  }

  // ✅ Forgot Password Function
  static async forgotPassword(email) {
    try {
      if (!AuthAPI.isValidEmail(email)) {
        throw new Error("Email is not valid");
      }

      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Password reset failed");
      }

      alert("Password reset link has been sent to your email.");
    } catch (error) {
      console.error("Forgot password error:", error);
      document.getElementById("error-message").textContent = error.message;
    }
  }

  // ✅ Role-Based Redirection
  static redirectToDashboard(role) {
    if (!role) {
      window.location.href = "index.html";
      return;
    }
    if (role.includes("HR_MANAGER")) {
      window.location.href = "candidates-interviewers.html";
    } else if (role.toLowerCase().includes("interviewer")) {
      window.location.href = "interviewer-dashboard.html";
    } else {
      window.location.href = "dashboard.html";
    }
  }
}

// ✅ Event Listeners
document.addEventListener("DOMContentLoaded", function () {
  // Login Form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      await AuthAPI.login(email, password);
    });
  }

  // Signup Form
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const fullName = document.getElementById("fullName").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      const role = document.getElementById("role").value;
      const position = document.getElementById("position").value;
      await AuthAPI.signup(
        fullName,
        email,
        password,
        confirmPassword,
        role,
        position
      );
    });
  }

  // Forgot Password Form
  const forgotPasswordForm = document.getElementById("forgotPasswordForm");
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const email = document.getElementById("email").value;
      await AuthAPI.forgotPassword(email);
    });
  }
});
