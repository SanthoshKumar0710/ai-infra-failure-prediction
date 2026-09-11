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
  KeyRound,
  CheckCircle2,
  RotateCw,
  X,
} from "lucide-react";

import {
  loginUser,
  registerUser,
  sendPasswordResetOtp,
  verifyOtpAndLogin,
  loginWithGoogle,
} from "../api/auth";

function Login({ onLogin }) {
  const [mode, setMode] = useState("login"); // "login" | "register" | "forgot"
  const [otpStep, setOtpStep] = useState(1); // 1 = enter email, 2 = enter OTP & reset
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // Google Sign-In state
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  // Standard Login / Register form submission
  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim().toLowerCase().endsWith("@gmail.com")) {
      setError("Only @gmail.com email addresses are permitted.");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "login") {
        await loginUser(email, password);
        onLogin();
      } else if (mode === "register") {
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          setLoading(false);
          return;
        }
        await registerUser(email, fullName, password);
        setSuccess("Account created successfully! You can now log in.");
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

      setError(typeof detail === "string" ? detail : JSON.stringify(detail));
    } finally {
      setLoading(false);
    }
  }

  // Send 6-digit OTP to user's email
  async function handleSendOtp(e) {
    e.preventDefault();
    if (!email) {
      setError("Please enter your registered email address.");
      return;
    }
    if (!email.trim().toLowerCase().endsWith("@gmail.com")) {
      setError("Only @gmail.com email addresses are permitted.");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await sendPasswordResetOtp(email);
      setSuccess(
        res.message ||
          `Verification code sent to ${email}. Please check your email inbox.`
      );
      setOtpStep(2);
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.error_code ||
        err.message ||
        "Failed to dispatch verification email. Please ensure SMTP or email settings are configured.";
      setError(typeof detail === "string" ? detail : JSON.stringify(detail));
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP button
  async function handleResendOtp() {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await sendPasswordResetOtp(email);
      setSuccess(
        res.message ||
          `A new verification code was sent to ${email}. Please check your inbox.`
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not resend verification email. Please check email configuration."
      );
    } finally {
      setLoading(false);
    }
  }

  // Verify OTP, update password, and auto-login
  async function handleVerifyOtpAndLogin(e) {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      setError("Please enter the complete 6-digit OTP code received in your email.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await verifyOtpAndLogin(email, otp.trim(), password);
      setSuccess("OTP verified successfully! Logging you in...");
      setTimeout(() => {
        onLogin();
      }, 400);
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.error_code ||
        err.message ||
        "Invalid or expired OTP code.";
      setError(typeof detail === "string" ? detail : JSON.stringify(detail));
      setLoading(false);
    }
  }

  // Trigger Google Sign-In
  async function handleGoogleClick() {
    setError("");
    setSuccess("");

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // If client ID is configured and Google SDK script is ready, trigger official Google popup
    if (clientId && window.google?.accounts?.id) {
      setGoogleLoading(true);
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              await loginWithGoogle({ id_token: response.credential });
              onLogin();
            } catch (err) {
              setError(err.response?.data?.detail || "Google authentication failed.");
            } finally {
              setGoogleLoading(false);
            }
          },
        });
        window.google.accounts.id.prompt();
        return;
      } catch {
        setGoogleLoading(false);
      }
    }

    // Default seamless Google Sign-In dialog
    setGoogleEmail(email || "");
    setGoogleName(fullName || "");
    setGoogleModalOpen(true);
  }

  // Submit Google Sign-In dialog
  async function handleGoogleModalSubmit(e) {
    e.preventDefault();
    if (!googleEmail) return;
    if (!googleEmail.trim().toLowerCase().endsWith("@gmail.com")) {
      setError("Only @gmail.com Google accounts are permitted.");
      return;
    }

    setError("");
    setGoogleLoading(true);

    try {
      await loginWithGoogle({
        email: googleEmail,
        name: googleName || googleEmail.split("@")[0],
      });
      setGoogleModalOpen(false);
      onLogin();
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.error_code ||
        err.message ||
        "Google authentication failed.";
      setError(typeof detail === "string" ? detail : JSON.stringify(detail));
    } finally {
      setGoogleLoading(false);
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
          padding: 40px 38px;
          box-shadow:
            0 25px 65px -12px rgba(0, 0, 0, 0.7),
            0 0 40px -10px rgba(99, 102, 241, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          box-sizing: border-box;
          position: relative;
        }

        .infrasafe-card-header {
          text-align: center;
          margin-bottom: 26px;
        }

        .infrasafe-card-header h2 {
          font-size: 27px;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 8px 0;
          letter-spacing: -0.02em;
        }

        .infrasafe-card-header p {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
          line-height: 1.5;
        }

        /* Google button */
        .infrasafe-google-btn {
          width: 100%;
          height: 48px;
          border: 1px solid rgba(255, 255, 255, 0.13);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          color: #f8fafc;
          font-size: 14.5px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .infrasafe-google-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.09);
          border-color: rgba(255, 255, 255, 0.25);
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .infrasafe-google-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Divider */
        .infrasafe-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 22px 0 20px 0;
          color: #64748b;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .infrasafe-divider::before,
        .infrasafe-divider::after {
          content: "";
          flex: 1;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .infrasafe-divider span {
          padding: 0 14px;
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
          line-height: 1.4;
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
          gap: 18px;
        }

        .infrasafe-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
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

        .infrasafe-input-wrap input.otp-code-input {
          padding: 0 16px;
          text-align: center;
          font-size: 24px;
          letter-spacing: 0.4em;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-weight: 700;
          color: #a5b4fc;
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
          margin-top: -2px;
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
          margin-top: 22px;
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

        .infrasafe-resend-link {
          background: transparent;
          border: 0;
          color: #818cf8;
          font-size: 13px;
          cursor: pointer;
          padding: 0;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: color 0.2s ease;
        }

        .infrasafe-resend-link:hover {
          color: #a5b4fc;
          text-decoration: underline;
        }

        /* Google Modal */
        .infrasafe-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(4, 7, 17, 0.75);
          backdrop-filter: blur(10px);
          display: grid;
          place-items: center;
          padding: 20px;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }

        .infrasafe-modal-box {
          width: 100%;
          max-width: 440px;
          background: #0b1121;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.8), 0 0 30px rgba(99, 102, 241, 0.15);
          position: relative;
        }

        .infrasafe-modal-close {
          position: absolute;
          top: 18px;
          right: 18px;
          background: transparent;
          border: 0;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
        }

        .infrasafe-modal-close:hover {
          color: #ffffff;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
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
            padding: 30px 20px;
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

        {/* Right Login / Register / Forgot Password Card */}
        <div className="infrasafe-card-wrap">
          <div className="infrasafe-login-card">
            <div className="infrasafe-card-header">
              <h2>
                {mode === "login"
                  ? "Welcome Back"
                  : mode === "register"
                  ? "Create Account"
                  : otpStep === 1
                  ? "Reset Password"
                  : "Verify OTP & Sign In"}
              </h2>
              <p>
                {mode === "login"
                  ? "Sign in with your Email or Google Account"
                  : mode === "register"
                  ? "Register using your Email or Google Account"
                  : otpStep === 1
                  ? "Enter your registered email to receive a 6-digit verification code"
                  : `Enter the 6-digit code sent to ${email} to reset password and login`}
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
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
            )}

            {/* Google Sign-In Button (shown for Login & Register) */}
            {mode !== "forgot" && (
              <>
                <button
                  type="button"
                  className="infrasafe-google-btn"
                  onClick={handleGoogleClick}
                  disabled={googleLoading || loading}
                >
                  <svg width="19" height="19" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>
                    {googleLoading
                      ? "Connecting to Google..."
                      : mode === "login"
                      ? "Continue with Google"
                      : "Sign up with Google"}
                  </span>
                </button>

                <div className="infrasafe-divider">
                  <span>or continue with email</span>
                </div>
              </>
            )}

            {/* Form: LOGIN & REGISTER */}
            {mode !== "forgot" && (
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
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="infrasafe-field">
                  <label htmlFor="password">Password</label>
                  <div className="infrasafe-input-wrap">
                    <span className="infrasafe-input-icon">
                      <Lock size={18} />
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete={
                        mode === "login" ? "current-password" : "new-password"
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

                  {mode === "register" && (
                    <small className="infrasafe-helper-hint">
                      Min 8 characters (recommended with uppercase, lowercase, digit, and symbol).
                    </small>
                  )}
                </div>

                {mode === "register" && (
                  <div className="infrasafe-field">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="infrasafe-input-wrap">
                      <span className="infrasafe-input-icon">
                        <Lock size={18} />
                      </span>
                      <input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Re-enter your password"
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
                        setOtpStep(1);
                        setError("");
                        setSuccess("");
                        setPassword("");
                        setConfirmPassword("");
                        setOtp("");
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
                      <span>Sign In with Email</span>
                      <ArrowRight size={18} />
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Form: FORGOT PASSWORD - STEP 1 (Request OTP) */}
            {mode === "forgot" && otpStep === 1 && (
              <form onSubmit={handleSendOtp} className="infrasafe-form">
                <div className="infrasafe-field">
                  <label htmlFor="resetEmail">Registered Email Address</label>
                  <div className="infrasafe-input-wrap">
                    <span className="infrasafe-input-icon">
                      <Mail size={18} />
                    </span>
                    <input
                      id="resetEmail"
                      type="email"
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                  <small className="infrasafe-helper-hint">
                    A secure 6-digit verification code will be sent to your email inbox.
                  </small>
                </div>

                <button
                  type="submit"
                  className="infrasafe-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="loading-spinner small" />
                  ) : (
                    <>
                      <span>Send Verification Email</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Form: FORGOT PASSWORD - STEP 2 (Verify OTP & Reset & Auto-Login) */}
            {mode === "forgot" && otpStep === 2 && (
              <form onSubmit={handleVerifyOtpAndLogin} className="infrasafe-form">
                <div className="infrasafe-field">
                  <label htmlFor="otpCode">6-Digit Code (Sent to your Email)</label>
                  <div className="infrasafe-input-wrap">
                    <input
                      id="otpCode"
                      className="otp-code-input"
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      required
                      autoFocus
                      autoComplete="one-time-code"
                    />
                  </div>
                  <small className="infrasafe-helper-hint">
                    Check your email inbox (and spam folder) for the 6-digit code.
                  </small>
                </div>

                <div className="infrasafe-field">
                  <label htmlFor="newPassword">New Password</label>
                  <div className="infrasafe-input-wrap">
                    <span className="infrasafe-input-icon">
                      <KeyRound size={18} />
                    </span>
                    <input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
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
                </div>

                <div className="infrasafe-field">
                  <label htmlFor="confirmNewPassword">Confirm New Password</label>
                  <div className="infrasafe-input-wrap">
                    <span className="infrasafe-input-icon">
                      <Lock size={18} />
                    </span>
                    <input
                      id="confirmNewPassword"
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

                <div className="infrasafe-row-controls">
                  <button
                    type="button"
                    className="infrasafe-resend-link"
                    onClick={handleResendOtp}
                    disabled={loading}
                  >
                    <RotateCw size={14} />
                    <span>Resend Email</span>
                  </button>

                  <button
                    type="button"
                    className="infrasafe-forgot-btn"
                    onClick={() => {
                      setOtpStep(1);
                      setError("");
                      setSuccess("");
                    }}
                  >
                    Change email
                  </button>
                </div>

                <button
                  type="submit"
                  className="infrasafe-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="loading-spinner small" />
                  ) : (
                    <>
                      <span>Verify OTP & Log In</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Footer Navigation */}
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

      {/* Interactive Google Sign-In Dialog (for direct one-click / demo login) */}
      {googleModalOpen && (
        <div className="infrasafe-modal-overlay">
          <div className="infrasafe-modal-box">
            <button
              type="button"
              className="infrasafe-modal-close"
              onClick={() => setGoogleModalOpen(false)}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.06)",
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 12px auto",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <h3 style={{ margin: "0 0 6px 0", fontSize: 20, color: "#fff" }}>
                Sign in with Google
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>
                Authenticate directly with your Google Workspace or Gmail account
              </p>
            </div>

            <form onSubmit={handleGoogleModalSubmit} className="infrasafe-form">
              <div className="infrasafe-field">
                <label htmlFor="googleEmailInput">Google Email Address</label>
                <div className="infrasafe-input-wrap">
                  <span className="infrasafe-input-icon">
                    <Mail size={18} />
                  </span>
                  <input
                    id="googleEmailInput"
                    type="email"
                    placeholder="user@gmail.com"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="infrasafe-field">
                <label htmlFor="googleNameInput">Display Name (Optional)</label>
                <div className="infrasafe-input-wrap">
                  <span className="infrasafe-input-icon">
                    <User size={18} />
                  </span>
                  <input
                    id="googleNameInput"
                    type="text"
                    placeholder="Google User Name"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="infrasafe-submit-btn"
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <div className="loading-spinner small" />
                ) : (
                  <>
                    <span>Confirm & Sign In with Google</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
