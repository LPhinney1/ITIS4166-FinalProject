import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
    const [count, setCount] = useState(0)
    const [healthData, setHealthData] = useState<null | Record<string, any>>(null)

    const checkHealth = async () => {
        try {
            const res = await fetch('https://itis4166-finalproject.onrender.com/health')
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
            <h2>Vite + React + MaterialUI</h2>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
            </div>
            <div>
                <button onClick={checkHealth} style={{ marginTop: '1rem' }}>
                    Run Health Check
                </button>
                {healthData && (
                    <pre style={{ textAlign: 'left', marginTop: '1rem', background: '#242424', padding: '1rem', border: '1pt solid black' }}>
                        {JSON.stringify(healthData, null, 2)}
                    </pre>
                )}
            </div>
        </>
    )
}

export default App

