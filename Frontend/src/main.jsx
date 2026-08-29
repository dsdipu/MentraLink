import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './components/Home'
import About from './components/about'


import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import NotFound from './components/NotFound';


const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
   
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
