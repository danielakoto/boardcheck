/* eslint-disable no-undef */
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaSyncAlt } from "react-icons/fa";

import { Login } from './Login';
import { User } from './User';
import { Board } from './Board';
import { Typing } from './Typing';
import { ColorSettings } from './ColorSettings';
import { SoundSettings } from './SoundSettings';
import { Store } from './Store';

import { useColors } from './useColors'
import { useSounds } from './useSounds'

import sounds from "../public/sounds/sounds.json"

import './App.scss'; // We'll define the CSS later


export const App = () => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [realTimeKeys, setRealTimeKeys] = useState({}); 
  const [persistentKeys, setPersistentKeys] = useState({});
  const [typingState, setTypingState] = useState("idle")
  const [prevResults, setPrevResults] = useState(null)
  const [loading, setLoading] = useState(false);

  const { colors, updateColor, resetColors } = useColors()

  const { sound, updateSound } = useSounds(sounds)
  
  const sendMessage = (msg) =>
    new Promise((resolve) => chrome.runtime.sendMessage(msg, resolve));

  useEffect(() => {
    const setupApp = async () => {
      let { token } = await chrome.storage.local.get(["token"])
      let { user } = await chrome.storage.local.get(["user"])

      setUser(user)
      setToken(token)
    }
    setupApp()
  }, [])
  
  const resetKeyboard = () => {
    setRealTimeKeys({});
    setPersistentKeys({});
  };

  const handleTestComplete = async (results) => {
    if(!user) {
      setPrevResults({ saved: false, data: results })
      return;
    }
    // TODO: Send results to backend/leaderboard
    toast.promise(
      async () => {
      try {
        const res = await sendMessage({ action: "saveScores", results: results });
        if (res?.res === "Success") {
          let { user } = await chrome.storage.local.get("user");
          setUser(user)
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
    let { user } = await chrome.storage.local.get("user");
    setUser(user)
    toast(`Signed in as ${user.email}.`)
  }

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
            {/* <img src="img/logo.png" alt="logo"></img> */}
            <h3 className='header'>BoardCheck</h3>
          </div>
          <div className='options-container'>
            <Typing user={user} colors={colors} onTestComplete={handleTestComplete} typingState={typingState} setTypingState={setTypingState} />
            <FaSyncAlt onClick={resetKeyboard} style={{ fontSize:"14px", cursor:"pointer" }}/>
            <Store colors={colors} />
            <SoundSettings colors={colors} sound={sound} updateSound={updateSound} sounds={sounds} />
            <ColorSettings colors={colors} updateColor={updateColor} resetColors={resetColors} />
            {user ? <User colors={colors} user={user} setUser={setUser} /> : <Login colors={colors} onAuthSuccess={handleLogin} />}
          </div>
        </div>
        <div id='keyboard-section'>
          <Board realTimeKeys={realTimeKeys} setRealTimeKeys={setRealTimeKeys} persistentKeys={persistentKeys} setPersistentKeys={setPersistentKeys} sound={sound} colors={colors} />
        </div>
    </div>
  );
};
