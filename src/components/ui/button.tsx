import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'default' | 'outline' | 'ghost' | 'cyan'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ 
  className = '', 
  variant = 'default', 
  size = 'md',
  ...props 
}: ButtonProps){
  const base = 'inline-flex items-center justify-center font-mono font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06090e]'
  
  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5 font-semibold',
  }[size]

  let variantStyles = 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20 glow-border'
  
  if (variant === 'outline') {
    variantStyles = 'border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/15 hover:border-emerald-400 glow-border'
  } else if (variant === 'cyan') {
    variantStyles = 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-lg shadow-cyan-500/20 glow-border-cyan'
  } else if (variant === 'ghost') {
    variantStyles = 'text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10'
  }

  return <button className={`${base} ${sizeStyles} ${variantStyles} ${className}`} {...props} />
}
