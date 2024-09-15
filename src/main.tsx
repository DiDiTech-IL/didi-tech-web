import { Toaster } from "@/components/ui/sonner"
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import App from './App.tsx'
import './index.css'
import Error from "./pages/Error.tsx"
import Learning from "./pages/learning-page.tsx"
import Services from "./pages/service-page.tsx"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error />,
    children: [
      {
        path: "/learn",
        element: <Learning />,
      },
      {
        path: "/services",
        element: <Services />
      }
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster />
  </StrictMode>,
)