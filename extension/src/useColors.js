import { useState } from 'react'

const DEFAULTS = {
  boardBg:          '#d3d3d3',
  keyBg:            '#ffffff',
  keyShadow:        '#666666',
  keyText:          '#202020',
  activeHighlight:  '#d7d7d7',
  clickedKeyBg:     '#b0b0b0',
  clickedKeyText:   '#7a7a7a',
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