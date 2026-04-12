/* eslint-disable no-undef */
import { useState, useEffect } from 'react'

import { sendMessage } from './sendMessage.js'

export const useSounds = (soundOptions) => {
   const [sound, setSound] = useState(soundOptions[0])

   useEffect(() => {
      const loadSound = async () => {
         try {
            const { sound, user } = await chrome.storage.local.get(["sound", "user"])
            let saved = JSON.parse(sound)

            if (user?.settings?.activeSound) {
               saved = user.settings.activeSound
            }

            if (!saved) return setSound(soundOptions[0])

            // Re-match against soundOptions in case URLs changed
            setSound(soundOptions.find(s => s.name === saved.name) ?? soundOptions[0])
         } catch {
            setSound(soundOptions[0])
         }
      }

      loadSound()
   }, []) // soundOptions is defined at module level so it's stable — no need to include it

   const updateSound = async (newSound) => {
      const sound = soundOptions.find(s => s.name === newSound.name)
      const { user } = await chrome.storage.local.get(["user"])

      if (user?.stats?.level?.level < sound?.level || (sound?.level > 1 && !user?.email)) {
         toast.error(`Unlocks at level ${sound.level}`)
         return
      } 

      await chrome.storage.local.set({ sound: JSON.stringify({ name: newSound.name }) })
      setSound(newSound)
      await sendMessage({ action: "saveSettings" })
   }

   return { sound, updateSound }
}