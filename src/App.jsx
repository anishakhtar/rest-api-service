import React from 'react'
import RestApiDemo from './RestApiDemo'
import './styles/index.css'
import './styles/App.css'
function App() { return <RestApiDemo onBack={() => window.history.back()} /> }
export default App
