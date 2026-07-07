import { API_BASE } from "../services/api";
import React, { useState } from 'react';
import '../css/register.css';
import {
  registerUser,
  getPasswordStrength,
  strengthLabels,
  strengthColors,
} from '../js/auth';

interface Props {
  onRegister: (name: string) => void;
  onGoLogin:  () => void;
}

const Register: React.FC<Props> = ({ onRegister, onGoLogin }) => {
  // Form fields
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [pass,    setPass]    = useState('');
  const [confirm, setConfirm] = useState('');

  // Feedback messages
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  // Password strength (0-3)
  const strength = getPasswordStrength(pass);
  const strengthPct = pass.length === 0 ? 0 : ((strength + 1) / 4) * 100;

  /** Called on Create Account button click */
  async function handleRegister() {

    if (pass !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (pass.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    const response =
      await fetch(
        `http://localhost:8000/api/v1/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            name,
            email,
            password : pass
          })
        }
      );

    const data =
      await response.json();

    if (!response.ok) {

      setError(
        data.detail
      );

      return;

    }

    alert(
      "Account Created"
    );

    onGoLogin();

  }

  return (
    <div className="register-page">

      {/* Floating bubbles */}
      <div className="circle c1" />
      <div className="circle c2" />
      <div className="circle c3" />

      <div className="register-container">

        {/* ── Left: Hero / Benefits ── */}
        <div className="reg-hero">
          <h1>Create Your Free Account</h1>
          <p>
            Join the AI-powered platform to organise and summarise your notes
            from any format — text, image, audio or video.
          </p>

          <div className="benefit-list">
            {[
              ['', 'AI-generated summaries in seconds'],
              ['', 'Store text, PDFs, images, audio & video'],
              ['', 'Your data stays private in your browser'],
              ['', 'Track all your notes in the History view'],
            ].map(([icon, text]) => (
              <div className="benefit-item" key={text}>
                <div className="benefit-icon">{icon}</div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Register Card ── */}
        <div className="register-card">
          <h2>Create Account</h2>

          {error   && <div className="reg-error">{error}</div>}
          {success && <div className="reg-success">{success}</div>}

          {/* Full Name */}
          <div className="reg-input-group">
            <label className="reg-label">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Sankar Raj"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="reg-input-group">
            <label className="reg-label">Email Address</label>
            <input
              type="email"
              placeholder="e.g. sankar@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {/* Password + strength bar */}
          <div className="reg-input-group">
            <label className="reg-label">Password</label>
            <input
              type="password"
              placeholder="At least 8 characters"
              value={pass}
              onChange={e => setPass(e.target.value)}
            />
            {pass.length > 0 && (
              <>
                <div className="strength-bar-wrap">
                  <div
                    className="strength-bar"
                    style={{
                      width: `${strengthPct}%`,
                      background: strengthColors[strength],
                    }}
                  />
                </div>
                <div
                  className="strength-label"
                  style={{ color: strengthColors[strength] }}
                >
                  {strengthLabels[strength]}
                </div>
              </>
            )}
          </div>

          {/* Confirm Password */}
          <div className="reg-input-group">
            <label className="reg-label">Confirm Password</label>
            <input
              type="password"
              placeholder="Re-enter your password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
            />
          </div>

          <button type="button" onClick={handleRegister}>
            Create Account
          </button>

          <div className="reg-switch">
            Already have an account?&nbsp;
            <a onClick={onGoLogin}>Login</a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
