/* eslint-disable no-undef */
import { useState } from "react";
import toast from 'react-hot-toast';
import { FaTimes, FaUser } from "react-icons/fa";

import './User.scss'

export const User = ({ colors, user, setUser }) => {
   const [open, setOpen] = useState(false)
   const [loading, setLoading] = useState(false);

   const sendMessage = (msg) =>
      new Promise((resolve) => chrome.runtime.sendMessage(msg, resolve));

   const handleSignOut = async () => {
      setLoading(true);
      try {
         const res = await sendMessage({ action: "signOut" });
         if (res?.res === "Success") {
            toast('Signed out.')
            setUser(null);
         } 
         else toast(res?.res || "Error signing in with Google.");
      } finally {
         setLoading(false);
      }
   }

  return (
  <>
      <div
         onClick={() => setOpen(o => !o)}
         style={{
            background: open ? colors.keyBg : 'var(--bg)',
            color: 'var(--text)',
            borderRadius: '5px',
            padding: '4px',
            cursor: 'pointer',
            fontSize: '18px',
            transition: 'background 0.3s ease',
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
      <div id="user" style={{
        position: 'fixed',
        bottom: '11px',
        right: open ? '12px' : '-255px',
        width: '250px',
        height: '289px',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(5px)',
        color: 'var(--text)',
        padding: '16px',
        zIndex: 999,
        transition: 'right 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        borderRadius: '5px',
        boxShadow: 'var(--box-shadow)',
        boxSizing: 'border-box'
      }}>
         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',  width: '100%' }}>
            <h3 className='header'  style={{ margin: 0, fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.6 }}>User</h3>
            <FaTimes onClick={() => setOpen(o => !o)} className='icon-button' />
         </div>
         <div id="user-content">
            <div id="user-header">
               <div id="user-main">
                  {user.photoURL 
                     ? <img id="user-photo" src={user.photoURL} alt="" />
                     : <FaUser id="user-photo" />
                  }
               </div>
               <div className="user-wpm">
                  <div>{user.stats.wpm}</div>
               </div>
            </div>
            {[
               { label: 'Rank', value: user.earned.rank },
               { label: 'Accuracy', value: `${user.stats.accuracy}%` },
               { label: 'Completed', value: user.stats.testsCompleted },
               { label: ' Last WPM',  value: user.stats.lastWpm },
               ].map(({ label, value }) => (
                  <div key={label} className="user-stat-card" style={{ textAlign: 'center' }}>
                     <div className="user-stat-label">{label}</div>
                     <div className="user-stat-value">{value}</div>
                  </div>
               ))
            }
            <div className="user-info">
               <div>{user.displayName ? user.displayName : user.email}</div>
               <div className="button" onClick={handleSignOut} disabled={loading}>{loading ? "Signing Out…" : "Sign Out"}</div>
            </div>
         </div>
      </div>
   </>
  );
}