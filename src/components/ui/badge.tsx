import React from 'react'

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & { 
  variant?: 'default' | 'outline' | 'cyan' | 'purple' | 'amber' 
}

export function Badge({ className = '', variant = 'default', ...props }: BadgeProps){
  const base = 'inline-flex items-center gap-1.5 text-xs font-mono font-medium px-2.5 py-1 rounded-md transition-colors'
  let styles = 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
  
  if (variant === 'outline') {
    styles = 'border border-emerald-400/50 text-emerald-400 bg-transparent'
  } else if (variant === 'cyan') {
    styles = 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
  } else if (variant === 'purple') {
    styles = 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
  } else if (variant === 'amber') {
    styles = 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
  }

  return <span className={`${base} ${styles} ${className}`} {...props} />
}
