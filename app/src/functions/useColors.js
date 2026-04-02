import { useState } from 'react'

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

const STORAGE_KEY = 'colors'

export const useColors = () => {
   const [colors, setColors] = useState(() => {
      try {
         let saved = localStorage.getItem(STORAGE_KEY)
         let user = localStorage.getItem("user")
         console.log(saved)
         console.log(user)
         console.log(JSON.parse(user))
         user = JSON.parse(user)
         if(user.settings.activeTheme) {
            saved = user.settings.activeTheme
            console.log("has preset colors")
            console.log(saved)
            return saved ? { ...DEFAULTS, ...saved } : DEFAULTS
         }
         return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS
      } catch (error) {
         console.log("Returning defaults: " + error)
         return DEFAULTS
      }
   })

   const updateColor = (key, value) => {
      setColors(prev => {
         const next = { ...prev, [key]: value }
         localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
         return next
      })
      saveSettings()
   }

   const resetColors = () => {
      localStorage.removeItem(STORAGE_KEY)
      setColors(DEFAULTS)
   }

   return { colors, updateColor, resetColors }
}