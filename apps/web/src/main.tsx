import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Docs from './Docs.tsx'

const Page = /^\/docs\/?$/.test(window.location.pathname) ? Docs : App
const root = document.getElementById('root')!
const page = <StrictMode><Page /></StrictMode>

// Built pages arrive prerendered (scripts/prerender.mjs); the dev server sends an empty root.
if (root.hasChildNodes()) hydrateRoot(root, page)
else createRoot(root).render(page)
