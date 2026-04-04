import { useState, useRef } from 'react'

import { saveSettings } from '../background'

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
   
   const [colors, setColors] = useState(() => {
      try {
         let saved = JSON.parse(localStorage.getItem("colors"))
         let user = JSON.parse(localStorage.getItem("user"))
         
         if(user?.settings?.activeTheme) {
            saved = user.settings.activeTheme
            return saved ? { ...DEFAULTS, ...saved } : DEFAULTS
         }

         return saved ? { ...DEFAULTS, ...saved } : DEFAULTS
      } catch {
         return DEFAULTS
      }
   })

   const updateColor = (key, value) => {
      setColors(prev => {
         const next = { ...prev, [key]: value }
         localStorage.setItem("colors", JSON.stringify(next))
         return next
      })

      // Clear any pending save, then schedule a new one
      if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current)
      saveDebounceRef.current = setTimeout(() => {
         saveSettings()
      }, 1000) // waits 1s after the last change
   }
   
   const resetColors = () => {
      localStorage.setItem("colors", JSON.stringify(DEFAULTS))
      setColors(DEFAULTS)
      saveSettings()
   }

   return { colors, updateColor, resetColors }
}