import { useState } from 'react'

const DEFAULTS = {
  boardBg:          '#262626',
  keyBg:            '#424242',
  keyShadow:        '#1a1a1a',
  keyText:          '#bdbdbd',
  activeHighlight:  '#0a0a0a',
  clickedKeyBg:     '#1c1c1c',
  clickedKeyText:   '#454545',
}

const STORAGE_KEY = 'boardcheck-colors'

export const useColors = () => {
   const [colors, setColors] = useState(() => {
      try {
         const saved = localStorage.getItem(STORAGE_KEY)
         return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS
      } catch {
         return DEFAULTS
      }
   })

   const updateColor = (key, value) => {
      setColors(prev => {
         const next = { ...prev, [key]: value }
         localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
         return next
      })
   }

   const resetColors = () => {
      localStorage.removeItem(STORAGE_KEY)
      setColors(DEFAULTS)
   }

   return { colors, updateColor, resetColors }
}