"use client";

import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";

// Disable prerendering for login page
export const dynamic = 'force-dynamic';

// ============================================
// ICONS
// ============================================

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
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

function CapIcon() {
  return (
    <svg className="cap-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z" />
      <path d="M7 11v4.5c1.5 1.2 3.2 1.8 5 1.8s3.5-.6 5-1.8V11" />
      <path d="M21 9v5" />
    </svg>
  );
}

// ============================================
// ROLE TO DASHBOARD URL MAPPING
// ============================================

const ROLE_DASHBOARD_MAP: Record<string, string> = {
  "School Admin": "https://staging.sgs.swais.in/admin/students",
  "Headmaster":    "https://staging.sgs.swais.in/headmaster",
  "Faculty":       "https://staging.sgs.swais.in/faculty/dashboard",
  "Student":       "https://staging.sgs.swais.in/student",
  "Parent":        "https://staging.sgs.swais.in/parent/dashboard",
};

// ============================================
// EMAIL VALIDATION FUNCTION
// ============================================

async function validateUserEmail(email: string, role: string): Promise<{ isValid: boolean; message: string }> {
  try {
    const response = await fetch('/api/auth/check-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: email.trim(), 
        role: role 
      }),
    });

    const data = await response.json();

    if (response.ok && data.valid) {
      return { isValid: true, message: '' };
    } else {
      return { 
        isValid: false, 
        message: data.message || `No ${role} found with this email. Please contact your administrator.` 
      };
    }
  } catch (error) {
    console.error('Email validation error:', error);
    return { 
      isValid: false, 
      message: 'Unable to validate email. Please try again.' 
    };
  }
}

// ============================================
// MAIN LOGIN PAGE
// ============================================

export default function Home() {
  const roles = ["School Admin", "Headmaster", "Faculty", "Student", "Parent"];
  
  const [selectedRole, setSelectedRole] = useState("Select your role");
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const roleDropdownRef = useRef<HTMLDivElement | null>(null);

  // Handle outside click for dropdown
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // ============================================
  // HANDLE LOGIN WITH EMAIL VALIDATION
  // ============================================

  const handleLogin = async () => {
    setMessage("");

    if (!selectedRole || selectedRole === "Select your role") {
      setMessage("Please select your role.");
      return;
    }

    if (!email.trim()) {
      setMessage("Please enter your email address.");
      return;
    }

    setIsLoading(true);

    try {
      // Validate user email against database
      const validation = await validateUserEmail(email.trim(), selectedRole);
      
      if (!validation.isValid) {
        setMessage(validation.message);
        setIsLoading(false);
        return;
      }

      // Email is valid - proceed with login
      sessionStorage.setItem('userRole', selectedRole);
      sessionStorage.setItem('userEmail', email.trim());
      
      const dashboardUrl = ROLE_DASHBOARD_MAP[selectedRole];
      
      if (!dashboardUrl) {
        setMessage("Invalid role selected. Please try again.");
        setIsLoading(false);
        return;
      }

      sessionStorage.setItem('dashboardRedirectUrl', dashboardUrl);

      if (process.env.NODE_ENV === 'development') {
        window.location.href = dashboardUrl;
        return;
      }

      await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: true,
      });
      
    } catch (error) {
      console.error('Login error:', error);
      setMessage("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    if (selectedRole === "Select your role") return false;
    return email.trim() !== "";
  };

  const getButtonText = () => {
    if (isLoading) return "Please wait...";
    return "Continue";
  };

  return (
    <main className="login-page">
      <section className="brand-panel" aria-label="SGS Portal">
        <div className="sky-shape top-shape" />
        <div className="dot-grid" aria-hidden="true" />

        <div className="brand-content">
          <img 
            className="school-logo" 
            src="/assets/sgs-logo.png" 
            alt="SGS logo"
          />
          <div className="school-lockup" aria-label="SGS Senior Secondary School Shreeramnagar">
            <h1>SGS SENIOR SECONDARY SCHOOL</h1>
            <div className="school-location">
              <span aria-hidden="true" />
              <strong>SHREERAMNAGAR</strong>
              <span aria-hidden="true" />
            </div>
            <div className="school-icon-row">
              <span aria-hidden="true" />
              <CapIcon />
              <span aria-hidden="true" />
            </div>
            <p className="portal-welcome">Welcome to SGS Portal</p>
          </div>
        </div>

        <img 
          className="campus-art" 
          src="/assets/campus-hero.png" 
          alt="Students walking toward a bright school campus" 
        />
        <div className="sky-shape bottom-shape" />
      </section>

      <section className="form-panel" aria-label="Sign in form">
        <form className="login-card" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <div className="form-inner">
            <div className="section-title" aria-label="Sign in to access your account">
              <span aria-hidden="true" />
              <p>Sign in to access your account</p>
              <span aria-hidden="true" />
            </div>

            <label className="field-group">
              <span>
                Email Address <strong className="required-marker">*</strong>
              </span>
              <span className="input-wrap">
                <MailIcon />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isLoading}
                  required
                />
              </span>
            </label>

            <div className="field-group role-dropdown" ref={roleDropdownRef}>
              <span>
                Select Role <strong className="required-marker">*</strong>
              </span>
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

            {message && (
              <div className="form-message" role="alert">
                {message}
              </div>
            )}

            <button 
              className="sign-in" 
              type="submit" 
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? <span className="loader" aria-hidden="true" /> : <LockIcon />}
              <span>{getButtonText()}</span>
            </button>

            <div className="or-row">
              <span>or</span>
            </div>

            <p className="administrator">
              Don't have an account. <strong>Contact SWAIS administrator.</strong>
            </p>
          </div>
        </form>

        <footer className="footer">
          <span>&copy; 2026 SGS Portal. All rights reserved.</span>
          <span className="footer-link">Privacy Policy</span>
          <span className="footer-link">Terms of Use</span>
        </footer>
      </section>
    </main>
  );
}
