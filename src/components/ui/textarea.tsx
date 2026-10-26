import React from 'react'

export function Textarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>){
  return (
    <textarea 
      {...props} 
      className={`w-full bg-[#070c18] border border-slate-700/80 text-slate-100 placeholder:text-slate-500 px-4 py-2.5 rounded-lg focus:border-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 transition-all font-mono text-base md:text-sm resize-y ${className}`} 
    />
  )
}
