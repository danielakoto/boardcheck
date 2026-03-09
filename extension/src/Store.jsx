import React, { useState } from 'react'
import { FaTimes } from "react-icons/fa";

export const Store = ({ colors }) => {
  const [open, setOpen] = useState(false)

  return (
    <div>
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
         }}
      >
        🏪
      </div>

      {/* Sidebar panel */}
      <div style={{
        position: 'fixed',
        bottom: open ? '12px' : '-290px',
        left: '12px',
        width: '709px',
        height: '273px',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(5px)',
        color: 'var(--text)',
        padding: '8px',
        zIndex: 999,
        transition: 'bottom 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '2x',
        borderRadius: '5px',
        boxShadow: 'var(--box-shadow)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',  width: '100%' }}>
          <h3 style={{ margin: 0, fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Store
          </h3>
          <FaTimes onClick={() => setOpen(o => !o)} className='icon-button' />
        </div>
      </div>
    </div>
  )
}