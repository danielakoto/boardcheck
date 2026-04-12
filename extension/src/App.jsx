/* eslint-disable no-undef */
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaSyncAlt, FaCloudSun } from "react-icons/fa";

import { Login, User, Board, Typing, ColorSettings, SoundSettings, Leaderboard, Loading } from './components/index';

import { useColors } from './functions/useColors'
import { useSounds } from './functions/useSounds'

import { launchConfetti } from './functions/confetti.js'
import { sendMessage } from './functions/sendMessage.js'

import sounds from "../public/sounds/sounds.json"

import './styles/App.scss';

export const App = () => {
  const [user, setUser] = useState(null)
  const [realTimeKeys, setRealTimeKeys] = useState({}); 
  const [persistentKeys, setPersistentKeys] = useState({});
  const [typingState, setTypingState] = useState("idle")
  const [prevResults, setPrevResults] = useState(null)
  const [loading, setLoading] = useState(false);

  const { colors, updateColor, resetColors } = useColors()
  const { sound, updateSound } = useSounds(sounds)

  let savedTheme = "dark"
  chrome.storage.sync.get('theme', ({ theme }) => {
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme);
      savedTheme = theme
    }
  });

  const toggle = (mode) => {
    document.documentElement.setAttribute('data-theme', mode);
    chrome.storage.sync.set({ theme: mode });
    savedTheme = mode
    console.log("Changed color.")
  };


  // ─── Setup + Token Refresh on Mount ───────────────────────────────────────
  useEffect(() => {
    const setupApp = async () => {
      const { user } = await chrome.storage.local.get(["user"]);

      if (user) {
        // Attempt a silent token refresh before doing anything else
        const res = await sendMessage({ action: "refreshToken" });
        if (res?.res === "Success") {
          // Re-fetch in case the background updated the stored token
          const { user: refreshedUser } = await chrome.storage.local.get(["user"]);
          setUser(refreshedUser);
        } else {
          // Token is dead — log out gracefully
          await chrome.storage.local.remove("user");
          setUser(null);
          toast("Session expired. Please sign in again.");
        }
      } else {
        setUser(null);
      }
    };
    setupApp();
  }, []);

  // ─── Periodic Token Refresh (every 30 min) ────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const THIRTY_MINUTES = 30 * 60 * 1000;
    const interval = setInterval(async () => {
      const res = await sendMessage({ action: "refreshToken" });
      if (res?.res === "Success") {
        const { user: refreshedUser } = await chrome.storage.local.get(["user"]);
        setUser(refreshedUser);
      } else {
        await chrome.storage.local.remove("user");
        setUser(null);
        toast("Session expired. Please sign in again.");
      }
    }, THIRTY_MINUTES);

    return () => clearInterval(interval);
  }, [user]);
  
  const resetKeyboard = () => {
    setRealTimeKeys({});
    setPersistentKeys({});
  };

  const handleTestComplete = async (results) => {
    launchConfetti(colors)

    if(!user) {
      chrome.storage.local.set({ user: {
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
      }})
      setPrevResults({ saved: false, data: results })
      return;
    }

    toast.promise(
      async () => {
        try {
          setLoading(true)
          const res = await sendMessage({ action: "saveScores", results: results });
          if (res?.res === "Success") {
            let { user } = await chrome.storage.local.get("user");
            setUser(user)
          }
          else throw new Error(res?.res || "Error saving scores.");
        } finally {
          setLoading(false);
        }
      }, {
        loading: 'Saving Score..',
        success: 'Saved',
        error: (e) => `Error occured: ${e}`,
      }, { icon: false }
    );
  }

  const handleLogin = async () => {
    let { user } = await chrome.storage.local.get("user");
    setUser(user)
    toast(`Signed in as ${user.email?.split('@')[0]}`)
  }

  // ─── Save Unsaved Results After Login ─────────────────────────────────────
  useEffect(() => {
    const saveUnsavedResult = async () => {
      if(!prevResults.saved) {
        toast.promise(
          async () => {
            try {
              const res = await sendMessage({ action: "saveScores", results: prevResults.data });
              if (res?.res === "Success") {
                let { user } = await chrome.storage.local.get("user");
                setUser(user)
              }
              else throw new Error(res?.res || "Error saving scores.");
            } finally {
              setLoading(false);
            }
          }, {
            loading: 'Saving Score..',
            success: 'Saved',
            error: (e) => `Error occured: ${e}`,
          }, { icon: false }
        );
      }
    }

    if(prevResults && user) {
      saveUnsavedResult()
    }
  }, [user])
  
  return (
    <div id="keyboard-tester"
      style={{
        '--board-bg':             colors.boardBg,
        '--key-bg':               colors.keyBg,
        '--key-shadow':           colors.keyShadow,
        '--key-text':             colors.keyText,
        '--active-highlight':     colors.activeHighlight,
        '--clicked-key-bg':       colors.clickedKeyBg,
        '--clicked-key-text':     colors.clickedKeyText,
      }}>
        { loading && (<Loading />) }
        <div id="keyboard-header-container">
          <div id='keyboard-logo'>
            <h3 className='header'>BoardCheck</h3>
          </div>
          <div className='options-container'>
            <Typing user={user} colors={colors} onTestComplete={handleTestComplete} typingState={typingState} setTypingState={setTypingState} />
            
            <div 
              onClick={resetKeyboard}
              style={{
                borderRadius: '5px',
                padding: '4px',
                cursor: 'pointer',
                fontSize: '18px',
                height: '25px',
                width: '25px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FaSyncAlt />
            </div>
            <div
              onClick={() => toggle(savedTheme === "light" ? "dark" : "light" )} 
              style={{
                borderRadius: '5px',
                padding: '4px',
                cursor: 'pointer',
                fontSize: '18px',
                height: '25px',
                width: '25px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FaCloudSun />
            </div>
            <Leaderboard user={user} colors={colors} />
            <SoundSettings colors={colors} sound={sound} updateSound={updateSound} sounds={sounds} />
            <ColorSettings colors={colors} updateColor={updateColor} resetColors={resetColors} />
            {user?.email ? <User colors={colors} user={user} setUser={setUser} /> : <Login colors={colors} onAuthSuccess={handleLogin} />}
          </div>
        </div>
        <div id='keyboard-section'>
          <Board realTimeKeys={realTimeKeys} setRealTimeKeys={setRealTimeKeys} persistentKeys={persistentKeys} setPersistentKeys={setPersistentKeys} sound={sound} colors={colors} />
        </div>
        { loading && (<Loading />) }
    </div>
  );
};