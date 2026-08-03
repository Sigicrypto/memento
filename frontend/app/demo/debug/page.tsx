"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugPage() {
  const [demoId, setDemoId] = useState('');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const fetchPhotos = async () => {
    try {
      const { data: rows, error: fetchErr } = await supabase
        .from('demo_uploads')
        .select('*')
        .eq('demo_id', demoId)
        .order('created_at', { ascending: false });
      
      if (fetchErr) setError(fetchErr);
      else setData(rows);
    } catch (err: any) {
      setError(err.message || err);
    }
  };

  return (
    <div style={{ padding: '2rem', color: 'white', fontFamily: 'monospace' }}>
      <h2>Database Debugger</h2>
      <div style={{ marginBottom: '1rem' }}>
        <input 
          type="text" 
          value={demoId} 
          onChange={(e) => setDemoId(e.target.value)} 
          placeholder="Enter Session ID" 
          style={{ padding: '0.5rem', color: 'black' }}
        />
        <button onClick={fetchPhotos} style={{ marginLeft: '1rem', padding: '0.5rem 1rem', background: 'white', color: 'black' }}>
          Fetch
        </button>
      </div>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          <strong>Error:</strong> <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}
      
      {data && (
        <div>
          <strong>Found {data.length} photos:</strong>
          <pre style={{ background: '#222', padding: '1rem', marginTop: '1rem', overflow: 'auto' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
