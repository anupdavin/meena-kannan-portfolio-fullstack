import React from 'react'

export function Card({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>){
  return (
    <div 
      className={`bg-[#050f08]/90 border border-green-500/25 rounded-xl shadow-xl backdrop-blur-md transition-all duration-300 hover:border-green-500/50 ${className}`} 
      {...props} 
    />
  )
}

export function CardHeader({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>){
  return <div className={`p-6 pb-3 ${className}`} {...props} />
}

export function CardTitle({ className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>){
  return <h3 className={`text-xl font-bold font-mono text-white ${className}`} {...props} />
}

export function CardDescription({ className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>){
  return <p className={`text-sm text-gray-400 mt-1 ${className}`} {...props} />
}

export function CardContent({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>){
  return <div className={`p-6 pt-2 ${className}`} {...props} />
}

export function CardFooter({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>){
  return <div className={`p-6 pt-0 flex items-center ${className}`} {...props} />
}
