'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TabsProps {
  defaultValue: string
  className?: string
  children: React.ReactNode
  dir?: 'rtl' | 'ltr'
}

interface TabsContextType {
  value: string
  setValue: (value: string) => void
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined)

const Tabs = ({ defaultValue, className, children, dir = 'rtl' }: TabsProps) => {
  const [value, setValue] = React.useState(defaultValue)
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn('w-full', className)} dir={dir}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

const TabsList = ({ className, children }: { className?: string, children: React.ReactNode }) => {
  return (
    <div className={cn('inline-flex items-center justify-center rounded-xl bg-slate-100 p-1 text-slate-500', className)}>
      {children}
    </div>
  )
}

const TabsTrigger = ({ value, className, children }: { value: string, className?: string, children: React.ReactNode }) => {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within Tabs')
  
  const isActive = context.value === value
  
  return (
    <button
      onClick={() => context.setValue(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isActive ? 'bg-white text-primary shadow-sm' : 'hover:bg-white/50 hover:text-slate-900',
        className
      )}
    >
      {children}
    </button>
  )
}

const TabsContent = ({ value, className, children }: { value: string, className?: string, children: React.ReactNode }) => {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used within Tabs')
  
  if (context.value !== value) return null
  
  return (
    <div className={cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', className)}>
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
