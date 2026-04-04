/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaSyncAlt, FaLowVision, FaCloudSun } from "react-icons/fa";
// Firebase
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

import { Login, User, Board, Typing, ColorSettings, SoundSettings, Store, Leaderboard, Loading } from './components/index';

import { useColors } from './functions/useColors'
import { useSounds } from './functions/useSounds'
import { launchConfetti } from './functions/confetti.js'

import { initUserDetails, saveScores } from './background'

import sounds from "./data/sounds.json"


import './styles/App.scss';

export const App = () => {
  const [user, setUser] = useState(null)
  const [menu, setMenu] = useState(true)
  const [realTimeKeys, setRealTimeKeys] = useState({});
  const [persistentKeys, setPersistentKeys] = useState({});
  const [typingState, setTypingState] = useState("idle")
  const [prevResults, setPrevResults] = useState(null)
  const [loading, setLoading] = useState(false);

  const { colors, updateColor, resetColors } = useColors()
  const { sound, updateSound } = useSounds(sounds)

  // On page load — restore saved preference
  let savedTheme = localStorage.getItem('theme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

  const toggle = (mode) => {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('theme', mode);
    savedTheme = mode
  };
  

  // ─── Auth Listener (replaces setupApp useEffect) ──────────────────────────
  // Firebase silently refreshes the token every hour via onAuthStateChanged.
  // No manual refresh logic needed — this fires on login, logout, and renewal.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Pull the latest user data from localStorage (your existing pattern)
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if(storedUser) initUserDetails();
        // Merge firebase identity with your stored stats/rank data
        setUser(storedUser ? { ...storedUser, email: firebaseUser.email } : null);
      } else {
        // Logged out or token truly dead — clear state
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const resetKeyboard = () => {
    setRealTimeKeys({});
    setPersistentKeys({});
  };

  const handleTestComplete = async (results) => {
    if (!user) {
      localStorage.setItem("user", JSON.stringify({
        "stats": {
          "level": { "level": "-", "next": {} },
          "wpm": results.wpm,
          "accuracy": results.accuracy,
          "correctWords": results.correctWords,
          "incorrectWords": results.incorrectWords,
          "timeElapsed": results.timeElapsed,
          "totalWords": results.totalWords,
        },
        "earned": {
          "rank": { "label": "Noob", "color": "#ff2c2c" }
        }
      }))
      setPrevResults({ saved: false, data: results })
      return;
    }

    toast.promise(
      async () => {
        try {
          setLoading(true)
          const prevLevel = user.stats.level.level
          const prevWPM = user.stats.wpm
          const res = await saveScores(results);
          if (res?.res === "Success") {
            const updatedUser = JSON.parse(localStorage.getItem("user"));
            setUser(updatedUser)
            if (updatedUser.stats.level.level > prevLevel) launchConfetti(colors)
            if (updatedUser.stats.wpm > prevWPM) launchConfetti(colors)
          }
          else throw new Error(res?.res || "Error saving scores.");
        } finally {
          setLoading(false);
        }
      }, {
        loading: 'Saving Score..',
        success: 'Saved',
        error: (e) => `Error occurred: ${e}`,
      }, { icon: false }
    );
  }

  const handleLogin = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser)
    toast(`Signed in as ${storedUser?.email?.split('@')[0]}.`)
  }

  // ─── Save Unsaved Results After Login ─────────────────────────────────────
  useEffect(() => {
    const saveUnsavedResult = async () => {
      if (!prevResults.saved) {
        toast.promise(
          async () => {
            try {
              setLoading(true)
              const res = await saveScores(prevResults.data);
              if (res?.res === "Success") {
                const updatedUser = JSON.parse(localStorage.getItem("user"));
                setUser(updatedUser)
              }
              else throw new Error(res?.res || "Error saving scores.");
            } finally {
              setLoading(false);
            }
          }, {
            loading: 'Saving Score..',
            success: 'Saved',
            error: (e) => `Error occurred: ${e}`,
          }, { icon: false }
        );
        setPrevResults(null)
      }
    }

    if (prevResults && user) {
      saveUnsavedResult()
    }
  }, [user])

  return (
    <div id="keyboard-tester"
      style={{
        '--board-bg':         colors.boardBg,
        '--key-bg':           colors.keyBg,
        '--key-shadow':       colors.keyShadow,
        '--key-text':         colors.keyText,
        '--active-highlight': colors.activeHighlight,
        '--clicked-key-bg':   colors.clickedKeyBg,
        '--clicked-key-text': colors.clickedKeyText,
      }}>
        { loading && (<Loading />) }
      <div id="keyboard-header-container">
        <div id='keyboard-logo'>
          {menu && (
            <h3 className='header'>BoardCheck</h3>
          )}
        </div>
        <div className='options-container'>
          {menu && (<>
            <FaSyncAlt onClick={resetKeyboard} style={{ fontSize: "14px", cursor: "pointer" }} />
            <Leaderboard user={user} colors={colors} />
            <Store colors={colors} />
            <SoundSettings colors={colors} sound={sound} updateSound={updateSound} sounds={sounds} />
            <ColorSettings colors={colors} updateColor={updateColor} resetColors={resetColors} />
            {user?.email
              ? <User colors={colors} user={user} setUser={setUser} />
              : <Login colors={colors} onAuthSuccess={handleLogin} />}
          </>)}
        </div>
      </div>
      <div id='keyboard-section'>
        <Board
          realTimeKeys={realTimeKeys} setRealTimeKeys={setRealTimeKeys}
          persistentKeys={persistentKeys} setPersistentKeys={setPersistentKeys}
          sound={sound} colors={colors}
        />
      </div>
      <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '8px' }}>
        <Typing user={user} colors={colors} onTestComplete={handleTestComplete} typingState={typingState} setTypingState={setTypingState} />
        <FaLowVision className='icon-button' onClick={() => setMenu(o => !o)} style={{ fontSize: "14px", cursor: "pointer", opacity: '0.5', aspectRatio: '1/1' }} />
        <FaCloudSun className='icon-button' onClick={() => toggle(savedTheme === "light" ? "dark" : "light" )} style={{ fontSize: "14px", cursor: "pointer", opacity: '0.5', aspectRatio: '1/1' }} />
      </div>
    </div>
  );
};