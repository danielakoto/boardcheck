import React, { useEffect, useRef } from "react";
import "../styles/Numpad.scss";

// All keys as a flat array — layout is handled entirely by CSS Grid
const NUMPAD_KEYS = [
  "NumLock", "N/", "N*", "N-",
  "N7", "N8", "N9", "N+",
  "N4", "N5", "N6",
  "N1", "N2", "N3", "NEnter",
  "N0", "N.",
];

// Map event.code → our internal numpad key name
const NUMPAD_CODE_MAP = {
  NumLock:        "NumLock",
  NumpadDivide:   "N/",
  NumpadMultiply: "N*",
  NumpadSubtract: "N-",
  Numpad7:        "N7",
  Numpad8:        "N8",
  Numpad9:        "N9",
  NumpadAdd:      "N+",
  Numpad4:        "N4",
  Numpad5:        "N5",
  Numpad6:        "N6",
  Numpad1:        "N1",
  Numpad2:        "N2",
  Numpad3:        "N3",
  NumpadEnter:    "NEnter",
  Numpad0:        "N0",
  NumpadDecimal:  "N.",
};

// Display label for each key (what the user sees on the keycap)
const KEY_LABELS = {
  NumLock: "Num\nLock",
  "N/":    "/",
  "N*":    "*",
  "N-":    "−",
  N7:      "7",
  N8:      "8",
  N9:      "9",
  "N+":    "+",
  N4:      "4",
  N5:      "5",
  N6:      "6",
  N1:      "1",
  N2:      "2",
  N3:      "3",
  NEnter:  "Enter",
  N0:      "0",
  "N.":    ".",
};

// Pitch helpers — mirrors Board.jsx logic
const semitones = (n) => Math.pow(2, n / 12);

const KEY_PITCH = {
  NumLock: semitones(2),
  "N/":    semitones(2),
  "N*":    semitones(2),
  "N-":    semitones(2),
  N7:      semitones(1),
  N8:      semitones(1),
  N9:      semitones(1),
  "N+":    semitones(-1), // tall key, deeper
  N4:      semitones(0),
  N5:      semitones(0),
  N6:      semitones(0),
  N1:      semitones(-1),
  N2:      semitones(-1),
  N3:      semitones(-1),
  NEnter:  semitones(-3), // tall key, deeper
  N0:      semitones(-2), // wide key, deeper
  "N.":    semitones(-2),
};

// Safe CSS class suffix from key string
const keyClass = (key) =>
  key
    .replace("/", "Slash")
    .replace("*", "Star")
    .replace("+", "Plus")
    .replace(".", "Dot")
    .replace("-", "Minus");

export const Numpad = ({
  realTimeKeys,
  setRealTimeKeys,
  persistentKeys,
  setPersistentKeys,
  sound,
}) => {
  const audioContextRef = useRef(null);
  const audioBufferRef  = useRef(null);

  const getContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  };

  useEffect(() => {
    if (!sound?.sound) {
      audioBufferRef.current = null;
      return;
    }
    const load = async () => {
      const ctx      = getContext();
      const response = await fetch(sound.sound);
      const arrayBuf = await response.arrayBuffer();
      audioBufferRef.current = await ctx.decodeAudioData(arrayBuf);
    };
    load();
  }, [sound]);

  const playSound = (key) => {
    const ctx = getContext();
    if (ctx.state === "suspended") ctx.resume();
    if (!audioBufferRef.current) return;

    const source = ctx.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.playbackRate.value = KEY_PITCH[key] ?? semitones(0);
    source.connect(ctx.destination);
    source.start(0);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!event.code?.startsWith("Numpad") && event.code !== "NumLock") return;

      const normalizedKey = NUMPAD_CODE_MAP[event.code];
      if (!normalizedKey) return;

      event.preventDefault();
      playSound(normalizedKey);

      setRealTimeKeys((prev) => ({ ...prev, [normalizedKey]: true }));

      setTimeout(() => {
        setPersistentKeys((prev) => ({ ...prev, [normalizedKey]: true }));
        setRealTimeKeys((prev) => {
          const updated = { ...prev };
          delete updated[normalizedKey];
          return updated;
        });
      }, 200);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="numpad">
      <div className="numpad-grid">
        {NUMPAD_KEYS.map((key) => (
          <div
            key={key}
            className={`numpad-key numpad-key--${keyClass(key)} ${
              realTimeKeys[key]   ? "active"     :
              persistentKeys[key] ? "persistent" : ""
            }`}
          >
            {KEY_LABELS[key] ?? key}
          </div>
        ))}
      </div>
    </div>
  );
};