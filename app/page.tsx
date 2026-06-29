"use client";

import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";

// ============================================
// ICONS - Exact same as SSS
// ============================================

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 1.9Z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
      <path d="M16 3.1a4 4 0 0 1 0 7.8" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <path d="M12 15v2" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg className="chevron" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

// ============================================
// MAIN LOGIN PAGE - Exact SSS UI with SGS functionality
// ============================================

export default function Home() {
  // SGS Role Options
  const roles = ["College Admin", "Headmaster", "Faculty", "Student", "Parent"];
  
  // State
  const [method, setMethod] = useState("email");
  const [selectedRole, setSelectedRole] = useState("Select your role");
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneStep, setPhoneStep] = useState("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const roleDropdownRef = useRef(null);

  // Handle outside click for dropdown
  useEffect(() => {
    function handleOutsideClick(event) {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setIsRoleOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Handle Login - SGS functionality (Google OAuth + Role-based redirect)
  const handleLogin = async () => {
    if (!selectedRole || selectedRole === "Select your role") {
      setMessage("Please select your role.");
      return;
    }

    if (method === "email" && !email.trim()) {
      setMessage("Please enter your email address.");
      return;
    }

    if (method === "phone" && !phone.trim()) {
      setMessage("Please enter your phone number.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      // Store role and email for redirect
      sessionStorage.setItem('userRole', selectedRole);
      sessionStorage.setItem('userEmail', email || phone);

      // For local testing - show alert
      if (process.env.NODE_ENV === 'development') {
        alert(`Login attempted!\n\nEmail: ${email || phone}\nRole: ${selectedRole}\nRemember Me: ${rememberMe}`);
        setIsLoading(false);
        return;
      }

      // For production - Google OAuth
      await signIn('google', {
        callbackUrl: '/dashboard',
      });
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!phone.trim()) {
      setMessage("Please enter your phone number.");
      return;
    }
    setPhoneStep("otp");
    setMessage("OTP sent to your phone.");
  };

  const isFormValid = () => {
    if (selectedRole === "Select your role") return false;
    if (method === "email") return email.trim() !== "";
    if (method === "phone") {
      if (phoneStep === "phone") return phone.trim() !== "";
      return otp.trim() !== "";
    }
    return false;
  };

  const getButtonText = () => {
    if (isLoading) return "Please wait...";
    if (method === "phone") {
      if (phoneStep === "otp") return "Verify OTP";
      return "Send OTP";
    }
    return "Continue";
  };

  return (
    <main className="login-page">
      {/* LEFT PANEL - Branding */}
      <section className="brand-panel" aria-label="SGS Portal">
        <div className="sky-shape top-shape" />
        <div className="dot-grid" aria-hidden="true" />

        <div className="brand-content">
          <img 
            className="school-logo" 
            src="/assets/sgs-logo.png" 
            alt="SGS logo"
          />
          <h1>SGS PORTAL</h1>
          <div className="gold-divider" aria-hidden="true" />
          <p className="tagline">Smart. Global. Secure.</p>
        </div>

        <img 
          className="campus-art" 
          src="/assets/campus-hero.png" 
          alt="Students walking toward a bright school campus" 
        />
        <div className="sky-shape bottom-shape" />
      </section>

      {/* RIGHT PANEL - Login Form */}
      <section className="form-panel" aria-label="Sign in form">
        <form className="login-card" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <div className="form-inner">
            <p className="section-title">Sign in with</p>

            {/* Email / Phone Tabs */}
            <div className="tabs" role="tablist" aria-label="Sign in method">
              <button
                className={`tab ${method === "email" ? "active" : ""}`}
                type="button"
                role="tab"
                aria-selected={method === "email"}
                onClick={() => {
                  setMethod("email");
                  setMessage("");
                }}
              >
                <MailIcon />
                <span>Email</span>
              </button>
              <button
                className={`tab ${method === "phone" ? "active" : ""}`}
                type="button"
                role="tab"
                aria-selected={method === "phone"}
                onClick={() => {
                  setMethod("phone");
                  setMessage("");
                }}
              >
                <PhoneIcon />
                <span>Phone Number</span>
              </button>
            </div>

            {/* Email or Phone Input */}
            {method === "email" ? (
              <label className="field-group">
                <span>Email Address</span>
                <span className="input-wrap">
                  <MailIcon />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={isLoading}
                  />
                </span>
              </label>
            ) : (
              <>
                <label className="field-group">
                  <span>Phone Number</span>
                  <span className="input-wrap">
                    <PhoneIcon />
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      disabled={isLoading || phoneStep !== "phone"}
                    />
                  </span>
                </label>
                {phoneStep === "otp" ? (
                  <label className="field-group">
                    <span>OTP</span>
                    <span className="input-wrap">
                      <LockIcon />
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                        disabled={isLoading}
                      />
                    </span>
                  </label>
                ) : null}
              </>
            )}

            {/* Role Dropdown - SGS Roles */}
            <div className="field-group role-dropdown" ref={roleDropdownRef}>
              <span>Select Role</span>
              <button
                className={`select-box ${isRoleOpen ? "open" : ""}`}
                type="button"
                aria-expanded={isRoleOpen}
                disabled={isLoading}
                onClick={() => setIsRoleOpen((current) => !current)}
              >
                <span className="select-label">
                  <UsersIcon />
                  <span id="selectedRole">{selectedRole}</span>
                </span>
                <ChevronIcon />
              </button>
              {isRoleOpen ? (
                <div className="role-menu" role="listbox" aria-label="Role options">
                  {roles.map((role) => (
                    <button
                      className={`role-menu-option ${selectedRole === role ? "selected" : ""}`}
                      key={role}
                      type="button"
                      role="option"
                      aria-selected={selectedRole === role}
                      onClick={() => {
                        setSelectedRole(role);
                        setIsRoleOpen(false);
                      }}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Message */}
            {message ? <p className="form-message" role="alert">{message}</p> : null}

            {/* Remember Me */}
            <div className="form-links-row">
              <label className="remember">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
            </div>

            {/* Submit Button */}
            <button 
              className="sign-in" 
              type="submit" 
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? <span className="loader" aria-hidden="true" /> : <LockIcon />}
              <span>{getButtonText()}</span>
            </button>

            {/* OR Divider */}
            <div className="or-row">
              <span>or</span>
            </div>

            {/* Footer */}
            <p className="administrator">
              Don't have an account? <strong>Contact your administrator</strong>
            </p>
          </div>
        </form>

        <footer className="footer">
          <span>&copy; 2024 SGS Portal. All rights reserved.</span>
          <span className="footer-link">Privacy Policy</span>
          <span className="footer-link">Terms of Use</span>
        </footer>
      </section>
    </main>
  );
}
