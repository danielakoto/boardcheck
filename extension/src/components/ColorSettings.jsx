import React, { useState } from 'react'
import { FaTimes, FaPalette } from "react-icons/fa";

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
            borderRadius: '5px',
            padding: '4px',
            cursor: 'pointer',
            fontSize: '18px',
            transition: 'background 0.3s ease',
            writingMode: 'vertical-rl',
            letterSpacing: '2px',
            // boxShadow: open ? 'none' : 'var(--box-shadow)'
            height: '25px',
            width: '25px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
         }}
      >
        <FaPalette />
      </div>
      <div onClick={() => setOpen(o => !o)} style={{ 
        width:'100vw', 
        height:'100%', 
        padding:'12px',
        position: 'fixed',
        top:'0px',
        right: open ? '0px' : '-100vw',
        zIndex: 999,
        transition: 'right 0.3s ease',
        boxSizing: 'border-box',
        display:'flex',
        alignItems:'end',
        justifyContent:'end'
      }}>
        <div onClick={(e) => e.stopPropagation()} style={{
          position: 'fixed',
          width: '220px',
          height: 'fit-content',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(5px)',
          color: 'var(--text)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2x',
          borderRadius: '5px',
          boxShadow: 'var(--box-shadow)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',  width: '100%' }}>
            <h3 style={{ margin: 0, fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.6 }}>
              Colors
            </h3>
            <FaTimes onClick={() => setOpen(o => !o)} className='icon-button' />
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
                    borderRadius: '5px',
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
              padding: '7px',
              background: colors.keyBg,
              color: colors.keyText,
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px',
              margin: '8px 0 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            Reset to defaults
          </div>
        </div>
      </div>
    </>
  )
}