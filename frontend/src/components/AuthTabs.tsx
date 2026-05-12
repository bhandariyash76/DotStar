'use client'

import { motion } from 'framer-motion'
import { clsx } from 'clsx'

type AuthMode = 'retail' | 'wholesale'

interface AuthTabsProps {
  mode: AuthMode
  onChange: (mode: AuthMode) => void
}

export default function AuthTabs({ mode, onChange }: AuthTabsProps) {
  return (
    <div className="relative flex items-center bg-zinc-900/50 backdrop-blur-md rounded-lg p-1 border border-zinc-800/50 mb-8 w-full max-w-sm mx-auto">
      <button
        type="button"
        onClick={() => onChange('retail')}
        className={clsx(
          "relative z-10 flex-1 py-2 text-sm font-medium transition-colors duration-300",
          mode === 'retail' ? "text-white" : "text-zinc-400 hover:text-zinc-200"
        )}
      >
        Retail
      </button>
      <button
        type="button"
        onClick={() => onChange('wholesale')}
        className={clsx(
          "relative z-10 flex-1 py-2 text-sm font-medium transition-colors duration-300",
          mode === 'wholesale' ? "text-white" : "text-zinc-400 hover:text-zinc-200"
        )}
      >
        Wholesale
      </button>

      {/* Animated Background Pill */}
      <div className="absolute inset-0 p-1 pointer-events-none flex">
        <motion.div
          className="h-full bg-zinc-800 rounded-md shadow-sm border border-zinc-700/50 w-1/2"
          initial={false}
          animate={{
            x: mode === 'retail' ? 0 : '100%',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      </div>
    </div>
  )
}



