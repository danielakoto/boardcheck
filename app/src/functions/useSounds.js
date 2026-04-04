import { useState } from 'react'

import { saveSettings } from '../background'

const STORAGE_KEY = 'sound'

export const useSounds = (soundOptions) => {
   const [sound, setSound] = useState(() => {
      try {
         let saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
         let user = JSON.parse(localStorage.getItem("user"))
         
         if (user?.settings?.activeSound) {
            saved = user.settings.activeSound
         }
         
         if (!saved) return soundOptions[0]

         return soundOptions.find(s => s.name === saved.name) ?? soundOptions[0]
      } catch {
         return soundOptions[0]
      }
   })

   const updateSound = (newSound) => {
      setSound(newSound)
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: newSound.name }))
      saveSettings()
   }

   return { sound, updateSound }
}