/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
// import { onAuthStateChanged } from "firebase/auth";
import { FaSyncAlt, FaLowVision } from "react-icons/fa";

import { Login, User, Board, Typing, ColorSettings, SoundSettings, Store, Leaderboard } from './components/index';

import { useColors } from './functions/useColors'
import { useSounds } from './functions/useSounds'
import { launchConfetti } from './functions/confetti.js'

import { auth, saveScores } from './background'

import sounds from "./data/sounds.json"

import './styles/App.scss'; // We'll define the CSS later

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
  
  // onAuthStateChanged(auth, (user) => {
  //   if(user) {
  //     setUser(user)
  //     console.log(user)
  //   }
  // })

  useEffect(() => {
    const setupApp = async () => {
      let user = JSON.parse(localStorage.getItem("user"));
      setUser(user)
    }
    setupApp()
  }, [])
  
  const resetKeyboard = () => {
    setRealTimeKeys({});
    setPersistentKeys({});
  };

  const handleTestComplete = async (results) => {
    if(!user) {
      localStorage.setItem("user", JSON.stringify({
        "stats": {
          "level": {
            "level": "-",
            "next": {}
          },
          "wpm": results.wpm,
          "accuracy": results.accuracy,
          "correctWords": results.correctWords,
          "incorrectWords": results.incorrectWords,
          "timeElapsed": results.timeElapsed,
          "totalWords": results.totalWords,
        },
        "earned": {
          "rank": {
            "label": "Noob",
            "color": "#ff2c2c"
          }
        }
      }))
      setPrevResults({ saved: false, data: results })
      return;
    }
    // TODO: Send results to backend/leaderboard
    toast.promise(
      async () => {
      try {
        const prevLevel = user.stats.level.level
        const prevWPM = user.stats.wpm
        const res = await saveScores(results);
        if (res?.res === "Success") {
          const user = JSON.parse(localStorage.getItem("user"));
          setUser(user)
          if(user.stats.level.level > prevLevel)
            launchConfetti(colors)
          if(user.stats.wpm > prevWPM)
            launchConfetti(colors)
        }
        else throw new Error(res?.res || "Error signing in with Google.");
      } finally {
        setLoading(false);
      }
      }, {
        loading: 'Saving Score..',
        success: 'Saved',
        error: (e) => `Error occured: ${e}`,
      }, {
        icon: false
      }
    );
  }

  const handleLogin = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    setUser(user)
    console.log(user)
    toast(`Signed in as ${user.email}.`)
  }

  useEffect(() => {
    const saveUnsavedResult = async () => {
      if(!prevResults.saved) {
        toast.promise(
          async () => {
            try {
              const prevLevel = user.stats.level.level
              const prevWPM = user.stats.wpm
              const res = await saveScores(prevResults.data);
              if (res?.res === "Success") {
                const user = JSON.parse(localStorage.getItem("user"));
                setUser(user)
                if(user.stat.level.level > prevLevel)
                  launchConfetti(colors)
                if(user.stats.wpm > prevWPM)
                  launchConfetti(colors)
              }
              else throw new Error(res?.res || "Error signing in with Google.");
            } finally {
              setLoading(false);
            }
          }, {
            loading: 'Saving Score..',
            success: 'Saved',
            error: (e) => `Error occured: ${e}`,
          }, {
            icon: false
          }
        );
        setPrevResults(null)
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
        <div id="keyboard-header-container">
          <div id='keyboard-logo'>
            {menu && (<>
              {/* <img src="img/logo.png" alt="logo"></img> */}
              <h3 className='header'>BoardCheck</h3>
            </>)}
          </div>
          <div className='options-container'>
            {menu && (<>
              <FaSyncAlt onClick={resetKeyboard} style={{ fontSize:"14px", cursor:"pointer" }}/>
              <Leaderboard user={user} colors={colors} />
              <Store colors={colors} />
              <SoundSettings colors={colors} sound={sound} updateSound={updateSound} sounds={sounds} />
              <ColorSettings colors={colors} updateColor={updateColor} resetColors={resetColors} />
              {user?.email ? <User colors={colors} user={user} setUser={setUser} /> : <Login colors={colors} onAuthSuccess={handleLogin} />}
            </>)}
          </div>
        </div>
        <div id='keyboard-section'>
          <Board realTimeKeys={realTimeKeys} setRealTimeKeys={setRealTimeKeys} persistentKeys={persistentKeys} setPersistentKeys={setPersistentKeys} sound={sound} colors={colors} />
        </div>
        <div style={{ position:'absolute', top:'8px', right:'8px', display:'flex', gap:'8px' }}>
          <Typing user={user} colors={colors} onTestComplete={handleTestComplete} typingState={typingState} setTypingState={setTypingState} />
          <FaLowVision className='icon-button' onClick={() => setMenu(o => !o)} style={{ fontSize:"14px", cursor:"pointer", opacity:'0.5', aspectRatio:' 1/1' }}/>
        </div>
    </div>
  );
};
