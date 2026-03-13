import React, { useState } from 'react';
import { FaSyncAlt, FaLowVision } from "react-icons/fa";

import { Board } from './Board';
import { Typing } from './Typing';
import { ColorSettings } from './ColorSettings';
import { SoundSettings } from './SoundSettings';
import { Store } from './Store';

import { useColors } from './useColors'
import { useSounds } from './useSounds'

import sounds from "./sounds.json"

import './App.scss'; // We'll define the CSS later

export const KeyboardApp = () => {
  const [menu, setMenu] = useState(true)
  const [realTimeKeys, setRealTimeKeys] = useState({}); 
  const [persistentKeys, setPersistentKeys] = useState({});
  const [typingState, setTypingState] = useState("idle")
  const { colors, updateColor, resetColors } = useColors()
  const { sound, updateSound } = useSounds(sounds)
  
  const resetKeyboard = () => {
    setRealTimeKeys({});
    setPersistentKeys({});
  };

  const handleTestComplete = (results) => {
    console.log('Test completed:', results);
    // TODO: Send results to backend/leaderboard
  };
  
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
              <Store colors={colors} />
              <SoundSettings colors={colors} sound={sound} updateSound={updateSound} sounds={sounds} />
              <ColorSettings colors={colors} updateColor={updateColor} resetColors={resetColors} />
              <FaSyncAlt className='icon-button' onClick={resetKeyboard} style={{ fontSize:"14px", cursor:"pointer" }}/>
            </>)}
            
          </div>
        </div>
        <div id='keyboard-section'>
          <Board realTimeKeys={realTimeKeys} setRealTimeKeys={setRealTimeKeys} persistentKeys={persistentKeys} setPersistentKeys={setPersistentKeys} sound={sound} colors={colors} />
        </div>
        <div style={{ position:'absolute', top:'8px', right:'8px', display:'flex', gap:'8px' }}>
          <Typing colors={colors} onTestComplete={handleTestComplete} typingState={typingState} setTypingState={setTypingState} />
          <FaLowVision className='icon-button' onClick={() => setMenu(o => !o)} style={{ fontSize:"14px", cursor:"pointer", opacity:'0.5', aspectRatio:' 1/1' }}/>
        </div>
    </div>
  );
};
