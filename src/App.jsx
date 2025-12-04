import React from 'react'
import './App.css'
import PremiumHeader from './components/custom/PremiumHeader'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import PageTransition from './components/custom/PageTransition'

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-blue-50/30 via-white to-purple-50/30">
      <PremiumHeader />
      <main className="grow">
        <PageTransition>
          <div className="w-full h-full">
            <Outlet />
          </div>
        </PageTransition>
      </main>
      <Toaster />
    </div>
  )
}

export default App