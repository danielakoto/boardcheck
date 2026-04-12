/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaSyncAlt, FaLowVision, FaCloudSun } from "react-icons/fa";

import { auth, analytics } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { logEvent } from 'firebase/analytics';

import { Login, User, Board, Typing, ColorSettings, SoundSettings, Leaderboard, Loading, AdBanner } from './components/index';
import { useColors } from './functions/useColors';
import { useSounds } from './functions/useSounds';
import { launchConfetti } from './functions/confetti.js';
import { initUserDetails, saveScores } from './background';
import sounds from "./data/sounds.json";
import './styles/App.scss';

export const App = () => {
  const [user, setUser] = useState(null);
  const [menu, setMenu] = useState(true);
  const [realTimeKeys, setRealTimeKeys] = useState({});
  const [persistentKeys, setPersistentKeys] = useState({});
  const [typingState, setTypingState] = useState("idle");
  const [prevResults, setPrevResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const { colors, updateColor, resetColors } = useColors();
  const { sound, updateSound } = useSounds(sounds);

  let savedTheme = localStorage.getItem('theme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

  // ─── Log app open once on mount ───────────────────────────────────────────
  useEffect(() => {
    logEvent(analytics, 'app_open');
  }, []);

  const toggle = (mode) => {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('theme', mode);
    savedTheme = mode;
    logEvent(analytics, 'theme_toggle', { theme: mode });
  };

  // ─── Auth Listener ────────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser.email) initUserDetails();
        setUser(storedUser ? { ...storedUser, email: firebaseUser.email } : null);
      }
    });
    return () => unsubscribe();
  }, []);

  const resetKeyboard = () => {
    setRealTimeKeys({});
    setPersistentKeys({});
    logEvent(analytics, 'keyboard_reset');
  };

  const handleTestComplete = async (results) => {
    // Always log the test completion with key metrics
    logEvent(analytics, 'test_complete', {
      wpm:           results.wpm,
      accuracy:      results.accuracy,
      total_words:   results.totalWords,
      correct_words: results.correctWords,
      time_elapsed:  results.timeElapsed,
      user_logged_in: !!user,
    });

    if (!user) {
      localStorage.setItem("user", JSON.stringify({
        stats: {
          level:         { level: "-", next: {} },
          wpm:           results.wpm,
          accuracy:      results.accuracy,
          correctWords:  results.correctWords,
          incorrectWords: results.incorrectWords,
          timeElapsed:   results.timeElapsed,
          totalWords:    results.totalWords,
        },
        earned: {
          rank: { label: "Noob", color: "#ff2c2c" }
        }
      }));
      setPrevResults({ saved: false, data: results });
      return;
    }

    toast.promise(
      async () => {
        try {
          setLoading(true);
          const res = await saveScores(results);

          if (res?.res === "Success") {
            const updatedUser = JSON.parse(localStorage.getItem("user"));
            setUser(updatedUser);
            logEvent(analytics, 'score_saved', { wpm: results.wpm, accuracy: results.accuracy });
          } else throw new Error(res?.res || "Error saving scores.");
        } finally {
          setLoading(false);
        }
      },
      {
        loading: 'Saving Score..',
        success: 'Saved',
        error: (e) => `Error occurred: ${e}`,
      },
      { icon: false }
    );
    launchConfetti(colors)
  };

  const handleLogin = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
    logEvent(analytics, 'login_success');
    toast(`Signed in as ${storedUser?.email?.split('@')[0]}`);
  };

  // ─── Save Unsaved Results After Login ─────────────────────────────────────
  useEffect(() => {
    const saveUnsavedResult = async () => {
      if (!prevResults.saved) {
        toast.promise(
          async () => {
            try {
              setLoading(true);
              const res = await saveScores(prevResults.data);
              if (res?.res === "Success") {
                const updatedUser = JSON.parse(localStorage.getItem("user"));
                setUser(updatedUser);
                logEvent(analytics, 'score_saved', {
                  wpm:      prevResults.data.wpm,
                  accuracy: prevResults.data.accuracy,
                  deferred: true,  // score was saved after login
                });
              } else throw new Error(res?.res || "Error saving scores.");
            } finally {
              setLoading(false);
            }
          },
          {
            loading: 'Saving Score..',
            success: 'Saved',
            error: (e) => `Error occurred: ${e}`,
          },
          { icon: false }
        );
        setPrevResults(null);
      }
    };

    if (prevResults && user) saveUnsavedResult();
  }, [user]);

  const handleMenuToggle = () => {
    setMenu(o => {
      logEvent(analytics, 'menu_toggle', { visible: !o });
      return !o;
    });
  };

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
      {loading && <Loading />}
      <div id="keyboard-header-container">
        <div id='keyboard-logo'>
          {menu && <h3 className='header'>BoardCheck</h3>}
        </div>
        <div className='options-container'>
          {menu && (<>
            <FaSyncAlt className='icon-button' onClick={resetKeyboard} style={{ fontSize: "18px", cursor: "pointer" }} />
            <Leaderboard user={user} colors={colors} />
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
        <FaLowVision
          className='icon-button'
          onClick={handleMenuToggle}
          style={{ fontSize: "14px", cursor: "pointer", opacity: '0.5', aspectRatio: '1/1' }}
        />
        <FaCloudSun
          className='icon-button'
          onClick={() => toggle(savedTheme === "light" ? "dark" : "light")}
          style={{ fontSize: "14px", cursor: "pointer", opacity: '0.5', aspectRatio: '1/1' }}
        />
      </div>
      <AdBanner slot="6699150226" format="horizontal" />
    </div>
  );
};