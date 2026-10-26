import { useRouteError, isRouteErrorResponse } from 'react-router-dom'
import { RotateCcw, Home, Terminal, ShieldAlert } from 'lucide-react'

export default function RouteErrorBoundary() {
  const error = useRouteError()

  let errorMessage = 'An unexpected runtime anomaly occurred.'
  let errorStatus: string | number = '500'

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status
    errorMessage = error.statusText || error.data?.message || 'Route not found or inaccessible'
  } else if (error instanceof Error) {
    errorMessage = error.message
  } else if (typeof error === 'string') {
    errorMessage = error
  }

  const handleReload = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-xl bg-[#090e1a] border border-red-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="font-bold text-red-400">SYSTEM DIAGNOSTIC FAULT</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-300">
            ERR_CODE: {errorStatus}
          </span>
        </div>

        {/* Content */}
        <div className="pt-6 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-tight">
              Runtime Exception Intercepted
            </h1>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              The application encountered an unexpected condition while rendering this view. State boundaries have contained the error to preserve system integrity.
            </p>
          </div>

          {/* Diagnostic Console Box */}
          <div className="p-3.5 rounded-xl bg-[#050811] border border-slate-800 font-mono text-xs text-red-300 overflow-x-auto space-y-1">
            <div className="flex items-center gap-2 text-slate-500 text-[11px]">
              <Terminal className="w-3.5 h-3.5 text-slate-500" />
              <span>Fault Trace Details</span>
            </div>
            <div className="text-red-400 break-words pt-1 font-semibold">
              {errorMessage}
            </div>
          </div>

          {/* Recovery Actions */}
          <div className="pt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={handleReload}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart System (Reload)</span>
            </button>

            <button
              onClick={handleGoHome}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-slate-500 transition-all cursor-pointer active:scale-95"
            >
              <Home className="w-4 h-4 text-cyan-400" />
              <span>Return to Core</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Meena Kannan Enterprise Architecture</span>
          <a
            href="mailto:meenakannan.dev@gmail.com"
            className="text-cyan-400 hover:underline"
          >
            Report Anomaly
          </a>
        </div>
      </div>
    </div>
  )
}
