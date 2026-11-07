import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import SiteAnalytics from './components/SiteAnalytics.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <SiteAnalytics />
  </React.StrictMode>,
)
