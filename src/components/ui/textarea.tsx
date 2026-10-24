import React from 'react'

export function Textarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>){
  return (
    <textarea 
      {...props} 
      className={`w-full bg-[#040c06] border border-green-500/30 text-green-100 placeholder-green-800/80 px-4 py-2.5 rounded-lg focus:border-green-400 focus:ring-1 focus:ring-green-400 focus:outline-none transition-all font-mono text-base md:text-sm resize-y ${className}`} 
    />
  )
}
