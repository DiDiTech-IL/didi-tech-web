import { Toaster } from "@/components/ui/sonner"
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import Blog from "./pages/blog.tsx"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/blog" element={<Blog />} />
      </Routes>
      <Toaster />
    </Router>
  </StrictMode>
)
