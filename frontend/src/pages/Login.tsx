import { API_BASE }
from "../services/api";
import React, { useState } from 'react';
import {
  FileText,
  Image,
  Mic,
  NotebookPen,
  Video,
  Brain,
  Mail,
  Lock
} from "lucide-react";
import '../css/login.css';
import { loginUser } from '../js/auth';

interface Props {
  onLogin: (name: string) => void;
  onGoRegister: () => void;
}

const Login: React.FC<Props> = ({ onLogin, onGoRegister }) => {
  // Local form state
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  async function handleLogin() {

    try {

      const response =
        await fetch(
          `${API_BASE}/api/v1/auth/login`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              email,
              password
            })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        setError(data.detail);

        return;

      }

      localStorage.setItem(
        "token",
        data.access_token
      );

      localStorage.setItem(
        "userName",
        data.name
      );
      
      localStorage.setItem(
        "userEmail",
        data.email
      );
      onLogin(data.name);

    }
    catch {

      setError(
        "Unable to connect"
      );

    }

  }

  return (
    <div id="loginPage" className="page active">

      {/* Floating decorative bubbles */}
      <div className="circle c1" />
      <div className="circle c2" />
      <div className="circle c3" />

      <div className="login-container">

        <div className="hero">

          <div className="hero-logo">

            <div className="hero-logo-circle">
              <NotebookPen size={30} />
            </div>

            <div className="hero-logo-text">
              SmartNotes Hub
            </div>

          </div>

          <h1>
            AI-Powered
            Note Summarization
          </h1>

          <p>
            Create, organize, store and summarize notes
            from text, images, audio and video content
            using intelligent AI assistance.
          </p>

          <div className="features">

            <span className="tag">
              <FileText size={18} />
              Text Notes
            </span>

            <span className="tag">
              <Image size={18} />
              Images
            </span>

            <span className="tag">
              <Mic size={18} />
              Audio
            </span>

            <span className="tag">
              <Video size={18} />
              Video
            </span>

            <span className="tag">
              <Brain size={18} />
              AI Summary
            </span>

          </div>

        </div>
        {/* ── Right: Login Card ── */}
        <div className="login-card">
          <h2>Login</h2>

          {/* Error message */}
          {error && <div className="error-msg">{error}</div>}

          <div className="input-group icon-input">
            <Mail size={18} />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div className="input-group icon-input">
            <Lock size={18} />
            <input
              type="password"
              placeholder="Password (min 8 chars)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <button type="button" onClick={handleLogin}>Sign In</button>

          <div className="auth-switch">

            <span>
              Don't have an account?
            </span>

            <a onClick={onGoRegister}>
              Create Account →
            </a>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
