import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
    const [healthData, setHealthData] = useState<null | Record<string, any>>(null)
    const baseUrl = import.meta.env.VITE_URL

    const checkHealth = async () => {
        try {
            const res = await fetch(`${baseUrl}/health`)
            const data = await res.json()
            console.log('Health Check Data:', data)
            setHealthData(data)
        } catch (error) {
            console.error('Health check failed:', error)
            setHealthData({ error: 'Failed to fetch health data' })
        }
    }

    return (
        <>
            <div>
                <a href="https://vite.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <h1>ITIS4166 Final Project</h1>
            <h2>Frontend: React + Vite</h2>
            <h2>Backend: Express + PostgreSQL + Kysely</h2>
            <h3>Deployed on Render</h3>
            <div className="card">
                <button onClick={checkHealth} style={{ backgroundColor: 'olivedrab' }}>
                    Run Health Check
                </button>
                {healthData && (
                    <pre style={{ textAlign: 'left', marginTop: '12px', background: '#242424', padding: '1rem', border: '1pt solid #e2e2e2', borderRadius: '9px' }}>
                        {JSON.stringify(healthData, null, 2)}
                    </pre>
                )}
            </div>
        </>
    )
}

export default App

