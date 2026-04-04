/* eslint-disable no-undef */
import { useState } from "react";
import toast from 'react-hot-toast';
import { FaTimes, FaUser } from "react-icons/fa";

import { Loading } from './index';

import { signUp, signIn, signInWithGoogle } from '../background'

import '../styles/Login.scss'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.5 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.5 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8H6.3C9.7 35.7 16.3 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C43 34.7 48 30 48 24c0-1.3-.1-2.6-.4-3.9z"/>
  </svg>
);

export const Login = ({ colors, onAuthSuccess }) => {
   const [open, setOpen] = useState(false)
   const [isSignIn, setIsSignIn] = useState(false);
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [loading, setLoading] = useState(false);

   const handleSignUp = async () => {
      if (!email || !password || !confirmPassword) {
         toast("Please fill in all fields.");
         return;
      }
      if (password !== confirmPassword) {
         toast("Passwords do not match.");
         return;
      }
      if (password.length < 8) {
         toast("Password must be at least 8 characters.");
         return;
      }
      setLoading(true);
      try {
         const res = await signUp(email, password);
         if (res?.res === "Success") onAuthSuccess();
         else toast(res?.res || "Error signing up.");
      } finally {
         setLoading(false);
      }
   };

   // ── Sign In ────────────────────────────────────────────────────────────────
   const handleSignIn = async () => {
      if (!email || !password) {
         toast("Please enter your email and password.");
         return;
      }
      setLoading(true);
      try {
         const res = await signIn(email, password);
         if (res?.res === "Success") onAuthSuccess();
         else toast(res?.res || "Error signing in.");
      } finally {
         setLoading(false);
      }
   };

  // ── Google Sign In ─────────────────────────────────────────────────────────
   const handleGoogleSignIn = async () => {
      setLoading(true);
      try {
         const res = await signInWithGoogle();
         if (res?.res === "Success") onAuthSuccess();
         else toast(res?.res || "Error signing in with Google.");
      } finally {
         setLoading(false);
      }
   };

  // ── Toggle mode ───────────────────────────────────────────────────────────
   const toggleMode = () => {
      setIsSignIn((prev) => !prev);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
   };

  return (
  <>
      <div
         onClick={() => setOpen(o => !o)}
         style={{
            background: open ? colors.keyBg : 'var(--bg)',
            color: open ? colors.keyText : 'var(--text)',
            borderRadius: '5px',
            padding: '4px',
            cursor: 'pointer',
            fontSize: '18px',
            transition: 'background 0.3s ease, color 0.3s ease',
            writingMode: 'vertical-rl',
            letterSpacing: '2px',
            // boxShadow: open ? 'none' : 'var(--box-shadow)'
            height: '25px',
            width: '25px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
         }}
      >
         <FaUser />
      </div>
      <div
         style={{
            display: 'flex',
            alignItems: 'start',
            justifyContent: 'end',
            top:'0px',
            right: open ? '0px' : '-100vw',
            width:'100vw', 
            height: '100vh',
            padding:'12px',
            position: 'fixed',
            transition: 'right 0.3s ease',
            boxSizing: 'border-box',
            zIndex: 1001,
         }}
         onClick={() => setOpen(o => !o)}
      >      
         <div id="sign-up" 
            style={{
               width: '400px',
               height: 'fit-content',
               background: 'var(--overlay-bg)',
               backdropFilter: 'blur(5px)',
               color: 'var(--text)',
               padding: '8px',
               zIndex: 1002,
               display: 'flex',
               flexDirection: 'column',
               gap: '8px',
               borderRadius: '5px',
               boxShadow: 'var(--box-shadow)',
               boxSizing: 'border-box'
            }}
            onClick={(e) => e.stopPropagation()}
         >
            { loading && (<Loading />) }
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',  width: '100%' }}>
               <h3 className='header'  style={{ margin: 0, fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.6 }}>Login | Register</h3>
               <FaTimes onClick={() => setOpen(o => !o)} className='icon-button' />
            </div>
            <div style={{
               fontSize: '9px',
               letterSpacing: '1.5px',
               textTransform: 'uppercase',
               opacity: 0.35,
            }}>
               {isSignIn
                  ? "Sign in.."
                  : "Create an account.."}
            </div>
            <div id="login-input-fields">
               <input
                  id="email"
                  className="login-input-style"
                  type="text"
                  placeholder="Email..."
                  minLength={3}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
               />
               <input
                  id="password"
                  className="login-input-style"
                  type="password"
                  placeholder="Password..."
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
               />

               {!isSignIn && (
               <input
                  id="register-password"
                  className="login-input-style"
                  type="password"
                  placeholder="Type Password again..."
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
               />
               )}
            </div>

            {!isSignIn && (
            <div
               className="button"
               onClick={handleSignUp}
               disabled={loading}
            >
               {loading ? "Signing Up…" : "Sign Up"}
            </div>
            )}

            {isSignIn && (
            <div
               className="button"
               onClick={handleSignIn}
               disabled={loading}
            >
               {loading ? "Signing In…" : "Sign In"}
            </div>
            )}

            <div
               id="google-sign-in-button"
               className="button"
               onClick={handleGoogleSignIn}
               disabled={loading}
            >
               <GoogleIcon />
               <div>Continue with Google</div>
            </div>

            {isSignIn ? (
            <div className="login-message" onClick={toggleMode}>
               <span>Don't have an account? </span>
               <span className="caution" style={{ color: "var(--accent)"}}>Click here to register.</span>
            </div>
            ) : (
            <div className="login-message" onClick={toggleMode}>
               <span>Already have an account? </span>
               <span className="success" style={{ color: "var(--accent)"}}>Click here to sign in.</span>
            </div>
            )}
         </div>
      </div>
   </>
  );
}