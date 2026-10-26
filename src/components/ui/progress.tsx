import React from 'react'

export function Progress({ 
  value = 0, 
  className = '', 
  barClassName = 'bg-gradient-to-r from-emerald-600 to-emerald-400' 
}: { 
  value?: number
  className?: string
  barClassName?: string 
}){
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className={`w-full bg-[#0b1120] rounded-full overflow-hidden border border-slate-800 ${className}`}>
      <div 
        className={`h-2 transition-all duration-700 ease-out rounded-full ${barClassName}`} 
        style={{ width: `${clamped}%` }} 
      />
    </div>
  )
}
