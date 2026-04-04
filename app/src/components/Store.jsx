import React, { useState } from 'react'
import { FaTimes, FaStore } from "react-icons/fa";

export const Store = ({ colors }) => {
  const [open, setOpen] = useState(false)

  return (
    <div>
      {/* Toggle button */}
      <div
         onClick={() => setOpen(o => !o)}
         style={{
            background: open ? colors.keyBg : 'var(--bg)',
            color: open ? colors.keyText : 'var(--text)',
            borderRadius: '5px',
            padding: '4px',
            cursor: 'pointer',
            fontSize: '18px',
            transition: 'background 0.3s ease, color 0.3s ease',
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
        <FaStore />
      </div>

      <div onClick={() => setOpen(o => !o)} style={{ 
        width:'100vw', 
        height:'100vh', 
        padding:'12px',
        position: 'fixed',
        bottom: open ? '0px' : '-100vh',
        left: '0px',
        zIndex: 999,
        transition: 'bottom 0.3s ease',
        boxSizing: 'border-box',
        display:'flex',
        alignItems:'end',
        justifyContent:'center'
      }}>
        <div style={{
          width: '975px',
          height: '250px',
          padding: '16px',
          background: 'var(--overlay-bg)',
          backdropFilter: 'blur(5px)',
          color: 'var(--text)',
          display: 'flex',
          borderRadius: '5px',
          boxShadow: 'var(--box-shadow)',
          flexDirection: 'column',
          gap: '2x',
          boxSizing: 'border-box'
        }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',  width: '100%' }}>
            <h3 style={{ margin: 0, fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.6 }}>
              Store
            </h3>
            <FaTimes onClick={() => setOpen(o => !o)} className='icon-button' />
          </div>
        </div>
      </div>
    </div>
  )
}