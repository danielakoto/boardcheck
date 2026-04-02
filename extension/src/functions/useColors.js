/* eslint-disable no-undef */
import { useState, useEffect } from 'react'

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
   const sendMessage = (msg) =>
      new Promise((resolve) => chrome.runtime.sendMessage(msg, resolve));

   const [colors, setColors] = useState(DEFAULTS)

   // Load colors from storage on mount
   useEffect(() => {
      const loadColors = async () => {
         try {
            const { colors, user } = await chrome.storage.local.get(["colors", "user"])
            let saved = colors

            if (user?.settings?.activeTheme) {
               saved = user.settings.activeTheme
               console.log("has preset colors")
            }

            setColors(saved ? { ...DEFAULTS, ...saved } : DEFAULTS)
         } catch (error) {
            console.log("Returning defaults: " + error)
            setColors(DEFAULTS)
         }
      }

      loadColors()
   }, [])

   const updateColor = async (key, value) => {
      setColors(prev => {
         const next = { ...prev, [key]: value }
         chrome.storage.local.set({ colors: next })  // store as object, not stringified
         return next
      })
      console.log("changed")
      await sendMessage({ action: "saveSettings" })
   }

   const resetColors = async () => {
      chrome.storage.local.remove("colors")
      setColors(DEFAULTS)
      console.log("changed")
      await sendMessage({ action: "saveSettings" })
   }

   return { colors, updateColor, resetColors }
}