import { useState } from 'react'

const STORAGE_KEY = 'boardcheck-sound'

export const useSounds = (soundOptions) => {
   const [sound, setSound] = useState(() => {
      try {
         const saved = localStorage.getItem(STORAGE_KEY)
         if (!saved) return soundOptions[0]
         const parsed = JSON.parse(saved)
         // Re-match against soundOptions in case URLs changed
         return soundOptions.find(s => s.name === parsed.name) ?? soundOptions[0]
      } catch {
         return soundOptions[0]
      }
   })

   const updateSound = (newSound) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: newSound.name }))
      setSound(newSound)
   }

  return { sound, updateSound }
}