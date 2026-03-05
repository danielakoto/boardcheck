import React, { useEffect, useRef } from 'react'
import toast from 'react-hot-toast';

// Array representing the key rows
const KEYBOARD_LAYOUT = [
   ['Esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12','Insert','Home', 'Circle'],
   ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace', 'Del'],
   ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\', 'PgUp'],
   ['CapsLock', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', '\'', 'Enter', 'PgDn'],
   ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift', '↑', 'End'],
   ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Fn', 'Ctrl', '←', '↓', '→'],
];

const normalizeKey = (key) => {
   // Normalize the key to handle known differences
   const specialKeysMap = {
      ' ': 'Space',
      'Backspace': 'Backspace',
      'Enter': 'Enter',
      'Shift': 'Shift',
      'Control': 'Ctrl',
      'Alt': 'Alt',
      'Meta': 'Win',
      'CapsLock': 'CapsLock',
      'Tab': 'Tab',
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'ArrowLeft': '←',
      'ArrowRight': '→',
      'Insert': 'Insert',
      'Home': 'Home',
      'PageUp': 'PgUp',
      'Delete': 'Del',
      'End': 'End',
      'PageDown': 'PgDn',
      'Escape': 'Esc',
      'AudioVolumeUp': 'Circle',
      'AudioVolumeDown': 'Circle',
      'MediaPlayPause': 'Circle'
   };
   
   return specialKeysMap[key] || key.toUpperCase(); // Use uppercase for letter keys
};

const KEY_ROW = {}
KEYBOARD_LAYOUT.forEach((row, rowIndex) => {
  row.forEach((key) => {
    KEY_ROW[key] = rowIndex
  })
})

const semitones = (n) => Math.pow(2, n / 12)

const ROW_PITCH = {
   0: semitones(2),   // Esc, F1-F12 row — highest
   1: semitones(1),   // ` 1 2 3 4 row
   2: semitones(0),   // Tab Q W E R row — normal (baseline)
   3: semitones(-1),  // CapsLock A S D row
   4: semitones(-2),  // Shift Z X C row
   5: semitones(-3),  // Ctrl Win Alt Space row — deepest
}

const KEY_PITCH_OVERRIDES = {
   'Space':     semitones(-6),
   'Enter':     semitones(-5),
   'Backspace': semitones(-3),
   'Shift':     semitones(-4),
}

export const Board = ({ setPressed, realTimeKeys, setRealTimeKeys, persistentKeys, setPersistentKeys, sound, colors }) => {
   const audioContextRef = useRef(null)
   const audioBufferRef = useRef(null)

   const getContext = () => {
      if (!audioContextRef.current) {
         audioContextRef.current = new AudioContext()
      }
      return audioContextRef.current
   }

   const getColumnPitch = (key) => {
   // Find which row this key is in and its column index
      for (const row of KEYBOARD_LAYOUT) {
         const colIndex = row.indexOf(key)
         if (colIndex === -1) continue
         const numCols = row.length
         // Normalize position: 0 (edges) → 1 (center)
         const normalized = 1 - Math.abs((colIndex / (numCols - 1)) * 2 - 1)
         // Arch: center gets +2 semitones, edges get 0
         return semitones(normalized * 2)
      }
      return semitones(0) // fallback
   }


   // Load sound into buffer when sound changes
   useEffect(() => {
      if (!sound?.sound) {
         audioBufferRef.current = null
         toast.success("No sound selected.")
         return
      }

      const load = async () => {
         const ctx = getContext()
         const response = await fetch(sound.sound)
         const arrayBuffer = await response.arrayBuffer()
         audioBufferRef.current = await ctx.decodeAudioData(arrayBuffer)
      }

      load()
   }, [sound])

   const playSound = (key) => {
      const ctx = getContext()
      if (ctx.state === 'suspended') ctx.resume()
      if (!audioBufferRef.current) return

      const rowIndex = KEY_ROW[key] ?? 2
      const rowPitch = KEY_PITCH_OVERRIDES[key] ?? ROW_PITCH[rowIndex]
      const colPitch = getColumnPitch(key)  // ← new

      const source = ctx.createBufferSource()
      source.buffer = audioBufferRef.current
      source.playbackRate.value = rowPitch * colPitch  // ← multiply
      source.connect(ctx.destination)
      source.start(0)
   }

   useEffect(() => {
      const handleKeyDown = (event) => {
         const normalizedKey = normalizeKey(event.key)

         playSound(normalizedKey)
         setPressed(normalizedKey.toLowerCase())

         if (normalizedKey.startsWith('F') || normalizedKey === 'Alt') {
         event.preventDefault()
         event.stopPropagation()
         }

         setRealTimeKeys((prevKeys) => ({ ...prevKeys, [normalizedKey]: true }))

         setTimeout(() => {
         setPersistentKeys((prevKeys) => ({ ...prevKeys, [normalizedKey]: true }))
         setRealTimeKeys((prevKeys) => {
            const updatedKeys = { ...prevKeys }
            delete updatedKeys[normalizedKey]
            return updatedKeys
         })
         }, 200)
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
   }, [])

   return (
      <div className="keyboard" 
         style={{
            '--board-bg':             colors.boardBg,
            '--key-bg':               colors.keyBg,
            '--key-shadow':           colors.keyShadow,
            '--key-text':             colors.keyText,
            '--active-highlight':     colors.activeHighlight,
            '--clicked-key-bg':       colors.clickedKeyBg,
            '--clicked-key-text':     colors.clickedKeyText,
         }}>
         {KEYBOARD_LAYOUT.map((row, rowIndex) => (
         <div className="keyboard-row" key={rowIndex}>
            {row.map((key, keyIndex) => (
               <div
               className={`key-${key.replace('\\', 'Slash').replace('`', 'Quote')} key ${realTimeKeys[key] ? 'active' : persistentKeys[key] ? 'persistent' : ''}`}
               key={keyIndex}
               >
               {key.replace('Circle', '')}
               </div>
            ))}
         </div>
         ))}
      </div>
   )
}