import React, { useState } from 'react';
import { TbReload } from "react-icons/tb";

import { Board } from './Board';
import { Typing } from './Typing';
import { ColorSettings } from './ColorSettings';
import { SoundSettings } from './SoundSettings';
import { Store } from './Store';

import { useColors } from './useColors'
import { useSounds } from './useSounds'

import sounds from "../public/sounds/sounds.json"

import './KeyboardApp.scss'; // We'll define the CSS later

export const KeyboardApp = () => {
  const [pressed, setPressed] = useState(null)
  const [realTimeKeys, setRealTimeKeys] = useState({}); 
  const [persistentKeys, setPersistentKeys] = useState({});
  const { colors, updateColor, resetColors } = useColors()
  const { sound, updateSound } = useSounds(sounds)
  
  const resetKeyboard = () => {
    setRealTimeKeys({});
    setPersistentKeys({});
  };
  
  return (
    <div id="keyboard-tester">
        <div id="keyboard-header-container">
          <div id='keyboard-logo'>
            <img src="img/logo.png" alt="logo"></img>
            <h3 className='header'>BoardCheck</h3>
          </div>
          <div className='options-container'>
            <Store colors={colors} />
            <SoundSettings colors={colors} sound={sound} updateSound={updateSound} sounds={sounds} />
            <ColorSettings colors={colors} updateColor={updateColor} resetColors={resetColors} />
            <TbReload className="TbReload" onClick={resetKeyboard}/>
          </div>
        </div>
        <div id='typing-section' >
          <Typing colors={colors} pressed={pressed} />
        </div>
        <div id='keyboard-section'>
          <Board setPressed={setPressed} realTimeKeys={realTimeKeys} setRealTimeKeys={setRealTimeKeys} persistentKeys={persistentKeys} setPersistentKeys={setPersistentKeys} sound={sound} colors={colors} />
        </div>
    </div>
  );
};
