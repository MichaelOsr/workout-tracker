import { useEffect, useState } from "react";

interface HealthResponse {
  status: string;
  timestamp: string;
  database: {
    connected:boolean;
    totalRecords:number;
  }
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/health')
      .then(res => {
        if(!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json();
      })
      .then(data => {
        setHealth(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex item-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          💪 Workout Tracker
        </h1>

        {loading && (
          <p className="text-gray-500">Checking backend...</p>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-800 font-medium">Connection Error</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <p className="text-gray-600 text-sm mt-2"> Make sure backend is running on port 3000</p>
          </div>
        )}

        {health && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Backend:</span>
              <span className="font-medium text-green-600">{health.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Database:</span>
              <span className="font-medium text-green-600">{health.database.connected ? 'connected' : 'disconnected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Records:</span>
              <span className="font-medium text-green-600">{health.database.totalRecords}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App;