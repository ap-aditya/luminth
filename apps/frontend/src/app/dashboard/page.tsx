'use client'; 

import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useFirebaseAuth';
import { useRouter } from 'next/navigation';

interface ProtectedDataResponse {
  message: string;
  user_id: string;
  email: string;
  source: string;
}

export default function DashboardPage() {
  const { user, loading, signUserOut } = useAuth(); 
  const router = useRouter(); 
  const [protectedData, setProtectedData] = useState<ProtectedDataResponse | null>(null);
  const [dataError, setDataError] = useState<string | null>(null); 


  useEffect(() => {
    if (!loading && !user) {
      router.push('/login'); 
    }
  }, [user, loading, router]); 

 
  const fetchProtectedData = async () => {
    if (!user) {
      setDataError("User not authenticated. Please log in.");
      return;
    }
    setDataError(null); 

    try {
     
      const idToken = await user.getIdToken();
      
     
      const response = await fetch('/api/protected-data', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
       
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch protected data');
      }

      const data: ProtectedDataResponse = await response.json();
      setProtectedData(data); 
    } catch (error: any) {
      console.error('Error fetching protected data:', error);
      setDataError(error.message); 
    }
  };


  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-gray-700">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 bg-white rounded-lg shadow-lg mt-8">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Welcome, {user.email}!</h1>
      <p className="text-gray-600 mb-6">This is your protected dashboard. You're logged in with Firebase Authentication.</p>

    
      <button
        onClick={signUserOut}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-4"
      >
        Sign Out
      </button>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Backend Data</h2>
        <button
          onClick={fetchProtectedData}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Fetch Protected Data from FastAPI
        </button>
        {dataError && <p className="text-red-500 text-sm mt-3">{dataError}</p>}
        {protectedData && (
          <div className="bg-gray-50 p-4 rounded-md mt-4 border border-gray-200">
            <h4 className="text-lg font-medium text-gray-700">Data from FastAPI:</h4>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-auto max-h-48">
              {JSON.stringify(protectedData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}