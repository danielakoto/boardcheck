import React, { useState } from 'react'
import { FaTimes } from "react-icons/fa";

const LABELS = {
  boardBg:             'Board Color',
  keyBg:               'Key Color',
  keyShadow:           'Key Shadow',
  keyText:             'Key Text',
  activeHighlight:     'Active Highlight',
  clickedKeyBg:        'Clicked Key Color',
  clickedKeyText:      'Clicked Key Text',
}

export const ColorSettings = ({ colors, updateColor, resetColors }) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Toggle button */}
      <div
         onClick={() => setOpen(o => !o)}
         style={{
            background: open ? colors.keyBg : 'var(--bg)',
            color: 'var(--text)',
            borderRadius: '6px',
            padding: '4px',
            cursor: 'pointer',
            fontSize: '18px',
            transition: 'background 0.3s ease',
            writingMode: 'vertical-rl',
            letterSpacing: '2px',
            // boxShadow: open ? 'none' : 'var(--box-shadow)'
         }}
      >
        🎨
      </div>

      {/* Sidebar panel */}
      <div style={{
        position: 'fixed',
        bottom: '11px',
        right: open ? '12px' : '-255px',
        width: '220px',
        height: 'fit-content',
        background: 'var(--bg)',
        color: 'var(--text)',
        padding: '16px',
        zIndex: 999,
        transition: 'right 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '2x',
        borderRadius: '5px',
        boxShadow: 'var(--box-shadow)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',  width: '100%' }}>
          <h3 style={{ margin: 0, fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Colors
          </h3>
          <FaTimes onClick={() => setOpen(o => !o)}  style={{ margin: 0, fontSize: '14px', cursor: 'pointer' }} />
        </div>

        {Object.entries(LABELS).map(([key, label]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ fontSize: '12px', flex: 1 }}>
              {label}
            </label>
            <input
              type="color"
              value={colors[key]}
              onChange={e => updateColor(key, e.target.value)}
               style={{
                  width: '36px',
                  height: '28px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  background: 'transparent',
                  padding: '0',
               }}
            />
          </div>
        ))}

        <div
          onClick={resetColors}
          style={{
            padding: '8px',
            background: colors.keyBg,
            color: colors.keyText,
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            margin: '8px 0 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          Reset to defaults
        </div>
      </div>
    </>
  )
}