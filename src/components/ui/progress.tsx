import React from 'react'

export function Progress({ 
  value = 0, 
  className = '', 
  barClassName = 'bg-gradient-to-r from-green-600 to-green-400' 
}: { 
  value?: number
  className?: string
  barClassName?: string 
}){
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className={`w-full bg-[#0a1b0e] rounded-full overflow-hidden border border-green-500/20 ${className}`}>
      <div 
        className={`h-2 transition-all duration-700 ease-out rounded-full ${barClassName}`} 
        style={{ width: `${clamped}%` }} 
      />
    </div>
  )
}
