import { useState } from "react";
import toast from "react-hot-toast";

import { saveSettings } from "../background";

const STORAGE_KEY = "sound";

export const useSounds = (soundOptions) => {
  const [sound, setSound] = useState(() => {
    try {
      let saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      let user = JSON.parse(localStorage.getItem("user"));

      if (user?.settings?.activeSound) {
        saved = user.settings.activeSound;
      }

      if (!saved) return soundOptions[1];

      return soundOptions.find((s) => s.name === saved.name) ?? soundOptions[1];
    } catch {
      return soundOptions[1];
    }
  });

  const updateSound = (newSound) => {
    const sound = soundOptions.find((s) => s.name === newSound.name);
    let user = JSON.parse(localStorage.getItem("user"));

    if (user?.stats?.level?.level < sound?.level || (sound?.level > 1 && !user?.email)) {
      toast.error(`Unlocks at level ${sound.level}`);
      return;
    }

    setSound(newSound);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: newSound.name }));
    saveSettings();
  };

  return { sound, updateSound };
};
