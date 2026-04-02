/* eslint-disable no-undef */
import { useState } from 'react'

export const useSounds = (user, soundOptions) => {
   const sendMessage = (msg) =>
      new Promise((resolve) => chrome.runtime.sendMessage(msg, resolve));

   const [sound, setSound] = useState( async () => {
      try {
         const { sound } = await chrome.storage.local.get("sound")
         let saved = sound
         if(user?.settings.activeSound) {
            saved = user.settings.activeSound
         }
         if (!saved) return soundOptions[0]
         const parsed = JSON.parse(saved)
         // Re-match against soundOptions in case URLs changed
         return soundOptions.find(s => s.name === parsed.name) ?? soundOptions[0]
      } catch {
         return soundOptions[0]
      }
   })

   const updateSound = async (newSound) => {
      await chrome.storage.local.set({ sound: JSON.stringify({ name: newSound.name })})
      setSound(newSound)
      await sendMessage({ action: "saveSettings" })
   }

  return { sound, updateSound }
}