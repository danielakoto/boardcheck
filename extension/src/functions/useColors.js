/* eslint-disable no-undef */
import { useState, useEffect, useRef } from 'react'

import { sendMessage } from './sendMessage.js'

const DEFAULTS = {
  boardBg:          '#262626',
  keyBg:            '#424242',
  keyShadow:        '#1a1a1a',
  keyText:          '#bdbdbd',
  activeHighlight:  '#0a0a0a',
  clickedKeyBg:     '#1c1c1c',
  clickedKeyText:   '#454545',
}

export const useColors = () => {
   const saveDebounceRef = useRef(null)
   const [colors, setColors] = useState(DEFAULTS)

   // Load colors from storage on mount
   useEffect(() => {
      const loadColors = async () => {
         try {
            const { colors, user } = await chrome.storage.local.get(["colors", "user"])
            let saved = colors

            if (user?.settings?.activeTheme) {
               saved = user.settings.activeTheme
            }

            setColors(saved ? { ...DEFAULTS, ...saved } : DEFAULTS)
         } catch {
            setColors(DEFAULTS)
         }
      }

      loadColors()
   }, [])

   const updateColor = (key, value) => {
      setColors(prev => {
         const next = { ...prev, [key]: value }
         chrome.storage.local.set({ colors: next })  // store as object, not stringified
         return next
      })

      // Clear any pending save, then schedule a new one
      if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current)
      saveDebounceRef.current = setTimeout( async () => {
         await sendMessage({ action: "saveSettings" })
      }, 1000) // waits 1s after the last change
   }

   const resetColors = async () => {
      chrome.storage.local.set({ colors: DEFAULTS })
      setColors(DEFAULTS)
      await sendMessage({ action: "saveSettings" })
   }

   return { colors, updateColor, resetColors }
}