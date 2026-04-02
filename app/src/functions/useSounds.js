import { useState } from 'react'

import { saveSettings } from '../background'

const STORAGE_KEY = 'sound'

export const useSounds = (user, soundOptions) => {
   const [sound, setSound] = useState(() => {
      try {
         let saved = localStorage.getItem(STORAGE_KEY)
         if(user.settings.activeSound) {
            saved = user.settings.activeSound
         } else {
            saveSettings()
         }
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
      saveSettings()
   }

  return { sound, updateSound }
}