import { useState } from "react";
import {
  BrainCircuit,
  Eye,
  EyeOff,
  ShieldAlert,
  ShieldCheck,
  Bell,
  Mail,
  Lock,
  ArrowRight,
  User,
} from "lucide-react";

import { loginUser, registerUser, resetPassword } from "../api/auth";

function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "login") {
        await loginUser(email, password);
        onLogin();
      } else if (mode === "register") {
        await registerUser(email, fullName, password);
        setSuccess(
          "Account created! You can now log in."
        );
        setMode("login");
        setPassword("");
      } else if (mode === "forgot") {
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          setLoading(false);
          return;
        }
        await resetPassword(email, password);
        setSuccess(
          "Password reset successfully! Please sign in with your new password."
        );
        setMode("login");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.error_code ||
        err.message ||
        "Something went wrong.";

      setError(
        typeof detail === "string"
          ? detail
          : JSON.stringify(detail)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="infrasafe-login-viewport">
      <style>{`
        .infrasafe-login-viewport {
          min-height: 100vh;
          width: 100%;
          background: #040711;
          background-image:
            radial-gradient(circle at 15% 25%, rgba(99, 102, 241, 0.22) 0%, transparent 45%),
            radial-gradient(circle at 85% 35%, rgba(37, 99, 235, 0.18) 0%, transparent 45%),
            radial-gradient(circle at 50% 85%, rgba(139, 92, 246, 0.12) 0%, transparent 50%),
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 100% 100%, 100% 100%, 100% 100%, 48px 48px, 48px 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 24px;
          box-sizing: border-box;
          font-family: Inter, system-ui, -apple-system, sans-serif;
          color: #f1f5f9;
        }

        .infrasafe-login-shell {
          width: 100%;
          max-width: 1140px;
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 56px;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        /* Left visual panel */
        .infrasafe-visual-panel {
          display: flex;
          flex-direction: column;
          gap: 28px;
          padding: 16px 0;
        }

        .infrasafe-brand-row {
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }

        .infrasafe-brand-badge {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #3b82f6 100%);
          display: grid;
          place-items: center;
          color: #ffffff;
          box-shadow: 0 0 24px rgba(99, 102, 241, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.4);
        }

        .infrasafe-brand-name {
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #ffffff;
        }

        .infrasafe-brand-name span {
          background: linear-gradient(135deg, #a5b4fc, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .infrasafe-headline {
          font-size: 40px;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
          color: #f8fafc;
          margin: 0;
        }

        .infrasafe-tagline {
          font-size: 19px;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(90deg, #818cf8 0%, #60a5fa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.01em;
        }

        .infrasafe-description {
          font-size: 15px;
          line-height: 1.6;
          color: #94a3b8;
          margin: 0;
          max-width: 480px;
        }

        /* Features list */
        .infrasafe-features {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 8px;
          max-width: 460px;
        }

        .infrasafe-feature-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 18px;
          background: rgba(15, 23, 42, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
        }

        .infrasafe-feature-item:hover {
          transform: translateY(-2px);
          border-color: rgba(99, 102, 241, 0.35);
          background: rgba(15, 23, 42, 0.75);
        }

        .infrasafe-feature-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .infrasafe-feature-icon.purple {
          background: rgba(99, 102, 241, 0.16);
          color: #a5b4fc;
          border: 1px solid rgba(99, 102, 241, 0.3);
          box-shadow: 0 0 16px rgba(99, 102, 241, 0.25);
        }

        .infrasafe-feature-icon.blue {
          background: rgba(59, 130, 246, 0.16);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.3);
          box-shadow: 0 0 16px rgba(59, 130, 246, 0.25);
        }

        .infrasafe-feature-icon.teal {
          background: rgba(20, 184, 166, 0.16);
          color: #2dd4bf;
          border: 1px solid rgba(20, 184, 166, 0.3);
          box-shadow: 0 0 16px rgba(20, 184, 166, 0.25);
        }

        .infrasafe-feature-text strong {
          display: block;
          font-size: 15px;
          font-weight: 600;
          color: #f1f5f9;
          margin-bottom: 2px;
        }

        .infrasafe-feature-text span {
          display: block;
          font-size: 13px;
          color: #94a3b8;
        }

        /* Right login card */
        .infrasafe-card-wrap {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .infrasafe-login-card {
          width: 100%;
          max-width: 470px;
          background: rgba(11, 17, 33, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 24px;
          padding: 44px 40px;
          box-shadow:
            0 25px 65px -12px rgba(0, 0, 0, 0.7),
            0 0 40px -10px rgba(99, 102, 241, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          box-sizing: border-box;
        }

        .infrasafe-card-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .infrasafe-card-header h2 {
          font-size: 28px;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 8px 0;
          letter-spacing: -0.02em;
        }

        .infrasafe-card-header p {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
        }

        /* Alert notifications */
        .infrasafe-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 12px;
          font-size: 13px;
          margin-bottom: 20px;
        }

        .infrasafe-alert.error {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }

        .infrasafe-alert.success {
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #6ee7b7;
        }

        /* Form elements */
        .infrasafe-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .infrasafe-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .infrasafe-field label {
          font-size: 13px;
          font-weight: 500;
          color: #cbd5e1;
          letter-spacing: 0.01em;
        }

        .infrasafe-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .infrasafe-input-icon {
          position: absolute;
          left: 14px;
          color: #64748b;
          pointer-events: none;
          display: grid;
          place-items: center;
        }

        .infrasafe-input-wrap input {
          width: 100%;
          height: 48px;
          background: rgba(7, 11, 22, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0 16px 0 44px;
          font-size: 14px;
          color: #ffffff;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .infrasafe-input-wrap input:focus {
          border-color: #6366f1;
          background: rgba(10, 15, 30, 0.9);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }

        .infrasafe-input-wrap input::placeholder {
          color: #64748b;
        }

        .infrasafe-input-wrap input:-webkit-autofill,
        .infrasafe-input-wrap input:-webkit-autofill:hover,
        .infrasafe-input-wrap input:-webkit-autofill:focus,
        .infrasafe-input-wrap input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #090e1d inset !important;
          -webkit-text-fill-color: #ffffff !important;
          caret-color: #ffffff !important;
          transition: background-color 5000s ease-in-out 0s;
        }

        .infrasafe-eye-btn {
          position: absolute;
          right: 12px;
          background: transparent;
          border: 0;
          color: #64748b;
          cursor: pointer;
          padding: 6px;
          display: grid;
          place-items: center;
          border-radius: 6px;
          transition: color 0.2s ease;
        }

        .infrasafe-eye-btn:hover {
          color: #cbd5e1;
        }

        .infrasafe-helper-hint {
          font-size: 12px;
          color: #818cf8;
          margin-top: 2px;
        }

        /* Controls row (Remember me & Forgot password) */
        .infrasafe-row-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          color: #94a3b8;
          margin-top: -4px;
        }

        .infrasafe-checkbox-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }

        .infrasafe-checkbox-label input[type="checkbox"] {
          appearance: none;
          -webkit-appearance: none;
          width: 17px;
          height: 17px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(7, 11, 22, 0.8);
          cursor: pointer;
          display: grid;
          place-items: center;
          margin: 0;
          outline: none;
          transition: all 0.2s ease;
        }

        .infrasafe-checkbox-label input[type="checkbox"]:checked {
          background: #3b82f6;
          border-color: #3b82f6;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
        }

        .infrasafe-checkbox-label input[type="checkbox"]:checked::before {
          content: "";
          width: 5px;
          height: 9px;
          border: solid #ffffff;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg) translate(-1px, -1px);
        }

        .infrasafe-forgot-btn {
          background: transparent;
          border: 0;
          color: #60a5fa;
          font-size: 13px;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s ease;
        }

        .infrasafe-forgot-btn:hover {
          color: #93c5fd;
          text-decoration: underline;
        }

        /* Submit CTA */
        .infrasafe-submit-btn {
          height: 48px;
          border: 0;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
          color: #ffffff;
          font-size: 15px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          box-shadow: 0 6px 20px -4px rgba(99, 102, 241, 0.5);
          transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
          margin-top: 4px;
        }

        .infrasafe-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.08);
          box-shadow: 0 8px 25px -4px rgba(99, 102, 241, 0.65);
        }

        .infrasafe-submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* Footer toggle */
        .infrasafe-card-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 13.5px;
          color: #94a3b8;
        }

        .infrasafe-switch-btn {
          background: transparent;
          border: 0;
          color: #60a5fa;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          padding: 0 0 0 6px;
          transition: color 0.2s ease;
        }

        .infrasafe-switch-btn:hover {
          color: #93c5fd;
          text-decoration: underline;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .infrasafe-login-shell {
            grid-template-columns: 1fr;
            gap: 40px;
            max-width: 520px;
          }

          .infrasafe-visual-panel {
            text-align: center;
            align-items: center;
            padding: 0;
          }

          .infrasafe-headline {
            font-size: 32px;
          }

          .infrasafe-description {
            max-width: 100%;
          }

          .infrasafe-features {
            width: 100%;
            max-width: 100%;
          }
        }

        @media (max-width: 480px) {
          .infrasafe-login-viewport {
            padding: 20px 14px;
          }

          .infrasafe-login-card {
            padding: 32px 22px;
            border-radius: 20px;
          }

          .infrasafe-headline {
            font-size: 26px;
          }

          .infrasafe-brand-name {
            font-size: 22px;
          }
        }
      `}</style>

      <div className="infrasafe-login-shell">
        {/* Left Visual Panel */}
        <div className="infrasafe-visual-panel">
          <div className="infrasafe-brand-row">
            <div className="infrasafe-brand-badge">
              <BrainCircuit size={26} />
            </div>
            <div className="infrasafe-brand-name">
              InfraSafe <span>AI</span>
            </div>
          </div>

          <h1 className="infrasafe-headline">
            AI-Powered Infrastructure
            <br />
            Failure Prediction
          </h1>

          <p className="infrasafe-tagline">
            Monitor. Predict. Prevent.
          </p>

          <p className="infrasafe-description">
            Leverage advanced machine learning to detect potential failures
            before they happen and keep your infrastructure resilient.
          </p>

          <div className="infrasafe-features">
            <div className="infrasafe-feature-item">
              <div className="infrasafe-feature-icon purple">
                <BrainCircuit size={20} />
              </div>
              <div className="infrasafe-feature-text">
                <strong>AI Predictions</strong>
                <span>Smart models predict failures early</span>
              </div>
            </div>

            <div className="infrasafe-feature-item">
              <div className="infrasafe-feature-icon blue">
                <ShieldCheck size={20} />
              </div>
              <div className="infrasafe-feature-text">
                <strong>Real-time Monitoring</strong>
                <span>Track infrastructure health 24/7</span>
              </div>
            </div>

            <div className="infrasafe-feature-item">
              <div className="infrasafe-feature-icon teal">
                <Bell size={20} />
              </div>
              <div className="infrasafe-feature-text">
                <strong>Instant Alerts</strong>
                <span>Get notified about critical issues</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Login Card */}
        <div className="infrasafe-card-wrap">
          <div className="infrasafe-login-card">
            <div className="infrasafe-card-header">
              <h2>
                {mode === "login"
                  ? "Welcome Back"
                  : mode === "register"
                  ? "Create Account"
                  : "Reset Password"}
              </h2>
              <p>
                {mode === "login"
                  ? "Sign in to your InfraSafe AI dashboard"
                  : mode === "register"
                  ? "Register a new account to get started."
                  : "Enter your registered email and choose a new password."}
              </p>
            </div>

            {error && (
              <div className="infrasafe-alert error">
                <ShieldAlert size={18} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="infrasafe-alert success">
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="infrasafe-form">
              {mode === "register" && (
                <div className="infrasafe-field">
                  <label htmlFor="fullName">Full Name</label>
                  <div className="infrasafe-input-wrap">
                    <span className="infrasafe-input-icon">
                      <User size={18} />
                    </span>
                    <input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              <div className="infrasafe-field">
                <label htmlFor="email">Email Address</label>
                <div className="infrasafe-input-wrap">
                  <span className="infrasafe-input-icon">
                    <Mail size={18} />
                  </span>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="infrasafe-field">
                <label htmlFor="password">
                  {mode === "forgot" ? "New Password" : "Password"}
                </label>
                <div className="infrasafe-input-wrap">
                  <span className="infrasafe-input-icon">
                    <Lock size={18} />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      mode === "forgot"
                        ? "Enter your new password"
                        : "Enter your password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete={
                      mode === "login"
                        ? "current-password"
                        : "new-password"
                    }
                  />
                  <button
                    type="button"
                    className="infrasafe-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {(mode === "register" || mode === "forgot") && (
                  <small className="infrasafe-helper-hint">
                    Min 8 characters (recommended with uppercase, lowercase, digit, and symbol).
                  </small>
                )}
              </div>

              {mode === "forgot" && (
                <div className="infrasafe-field">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <div className="infrasafe-input-wrap">
                    <span className="infrasafe-input-icon">
                      <Lock size={18} />
                    </span>
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              )}

              {mode === "login" && (
                <div className="infrasafe-row-controls">
                  <label className="infrasafe-checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Remember me</span>
                  </label>

                  <button
                    type="button"
                    className="infrasafe-forgot-btn"
                    onClick={() => {
                      setMode("forgot");
                      setError("");
                      setSuccess("");
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="infrasafe-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <div className="loading-spinner small" />
                ) : mode === "login" ? (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={18} />
                  </>
                ) : mode === "register" ? (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={18} />
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="infrasafe-card-footer">
              {mode === "login" ? (
                <p>
                  Don&apos;t have an account?
                  <button
                    type="button"
                    className="infrasafe-switch-btn"
                    onClick={() => {
                      setMode("register");
                      setError("");
                      setSuccess("");
                    }}
                  >
                    Sign up
                  </button>
                </p>
              ) : mode === "register" ? (
                <p>
                  Already have an account?
                  <button
                    type="button"
                    className="infrasafe-switch-btn"
                    onClick={() => {
                      setMode("login");
                      setError("");
                      setSuccess("");
                    }}
                  >
                    Sign in
                  </button>
                </p>
              ) : (
                <p>
                  Remembered your password?
                  <button
                    type="button"
                    className="infrasafe-switch-btn"
                    onClick={() => {
                      setMode("login");
                      setError("");
                      setSuccess("");
                    }}
                  >
                    Back to Sign In
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

