import React from 'react'

export function Card({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>){
  return (
    <div 
      className={`bg-[#0b1120]/90 border border-slate-800 rounded-xl shadow-xl backdrop-blur-md transition-all duration-300 hover:border-slate-700 ${className}`} 
      {...props} 
    />
  )
}

export function CardHeader({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>){
  return <div className={`p-6 pb-3 ${className}`} {...props} />
}

export function CardTitle({ className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>){
  return <h3 className={`text-xl font-bold font-editorial text-white ${className}`} {...props} />
}

export function CardDescription({ className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>){
  return <p className={`text-sm text-slate-400 mt-1 ${className}`} {...props} />
}

export function CardContent({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>){
  return <div className={`p-6 pt-2 ${className}`} {...props} />
}

export function CardFooter({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>){
  return <div className={`p-6 pt-0 flex items-center ${className}`} {...props} />
}
