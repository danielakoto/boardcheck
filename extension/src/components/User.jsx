/* eslint-disable no-undef */
import { useState } from "react";
import toast from "react-hot-toast";
import { FaTimes, FaUser } from "react-icons/fa";

import { Loading } from "./index";

import { getRank } from "../functions/useLevels.js";
import { sendMessage } from "../functions/sendMessage.js";

import "../styles/User.scss";

export const User = ({ colors, user, setUser }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const res = await sendMessage({ action: "signOut" });
      if (res?.res === "Success") {
        toast("Signed out.");
        setUser(null);
      } else toast(res?.res || "Error signing in with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          background: open ? colors.keyBg : "var(--bg)",
          color: open ? colors.keyText : "var(--text)",
          borderRadius: "5px",
          padding: "4px",
          cursor: "pointer",
          fontSize: "18px",
          transition: "background 0.3s ease, color 0.3s ease",
          writingMode: "vertical-rl",
          letterSpacing: "2px",
          // boxShadow: open ? 'none' : 'var(--box-shadow)'
          height: "25px",
          width: "25px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FaUser className="icon-button" />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "end",
          justifyContent: "end",
          top: "0px",
          right: open ? "0px" : "-1000px",
          width: "100vw",
          height: "100vh",
          position: "fixed",
          boxSizing: "border-box",
          zIndex: 1001,
          transition: "right 0.3s ease",
          padding: "12px",
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <div
          id="user"
          style={{
            // position: 'fixed',
            // bottom: '11px',
            width: "400px",
            height: "288px",
            background: "var(--overlay-bg)",
            backdropFilter: "blur(5px)",
            color: "var(--text)",
            padding: "16px",
            zIndex: 1002,
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            borderRadius: "5px",
            boxShadow: "var(--box-shadow)",
            boxSizing: "border-box",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {loading && <Loading />}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <h3
              className="header"
              style={{ margin: 0, fontSize: "13px", letterSpacing: "2px", textTransform: "uppercase", opacity: 0.6 }}
            >
              User
            </h3>
            <FaTimes
              onClick={() => setOpen((o) => !o)}
              className="icon-button"
            />
          </div>
          <div id="user-content">
            <div id="user-header">
              <div id="user-main">
                {user.photoURL ? (
                  <img
                    id="user-photo"
                    src={user.photoURL}
                    alt=""
                  />
                ) : (
                  <FaUser id="user-photo" />
                )}
              </div>
              {user?.stats &&
                (() => {
                  const lvl = user.stats.level;
                  const xpInto = lvl.xpIntoLevel ?? 0;
                  const xpNeeded = lvl.xpNeeded ?? 1;
                  const progress = lvl.progress ?? 0;

                  return (
                    <div style={{ width: "100%" }}>
                      {/* Level + next label */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          justifyContent: "space-between",
                          marginBottom: "6px",
                        }}
                      >
                        <span style={{ fontSize: "13px", fontWeight: 500 }}>Level {lvl.level}</span>
                        <span style={{ fontSize: "11px", opacity: 0.4, letterSpacing: "0.5px" }}>
                          {lvl.xpToNextLevel?.toLocaleString()} xp to level {lvl.level + 1}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div
                        style={{
                          width: "100%",
                          height: "4px",
                          background: "rgba(255,255,255,0.1)",
                          borderRadius: "99px",
                          overflow: "hidden",
                          marginBottom: "5px",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${progress}%`,
                            background: "rgba(255,255,255,0.85)",
                            borderRadius: "99px",
                            transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        />
                      </div>

                      {/* XP label + fraction */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: "10px", letterSpacing: "2.5px", textTransform: "uppercase", opacity: 0.35 }}>XP</span>
                        <span style={{ fontSize: "10px", opacity: 0.4 }}>
                          {xpInto.toLocaleString()}
                          <span style={{ opacity: 0.6 }}> / {xpNeeded.toLocaleString()}</span>
                        </span>
                      </div>
                    </div>
                  );
                })()}
            </div>
            {(() => {
              const grade = getRank(user.stats.wpm);
              return (
                <div
                  className="user-stat-card"
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  <div className="user-stat-label">Rank</div>
                  <div
                    style={{
                      fontSize: "12px",
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      color: grade.color,
                      border: `2px solid ${grade.color}`,
                      borderRadius: "4px",
                      padding: "3px 10px",
                      width: "fit-content",
                    }}
                  >
                    {grade.label}
                  </div>
                </div>
              );
            })()}
            {[
              { label: "Accuracy", value: `${user.stats.accuracy}%` },
              { label: "Last WPM", value: user.stats.lastWpm },
              { label: "Completed", value: user.stats.testsCompleted },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="user-stat-card"
                style={{ textAlign: "center" }}
              >
                <div className="user-stat-label">{label}</div>
                <div className="user-stat-value">{value}</div>
              </div>
            ))}
            <div className="user-info">
              <div>{user?.email?.split("@")[0] || ""}</div>
              <div
                className="button"
                onClick={handleSignOut}
                disabled={loading}
              >
                {loading ? "Signing Out…" : "Sign Out"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
