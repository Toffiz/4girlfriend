import React, { useState, useEffect } from 'react';
import { galleryService } from './supabaseClient';
import './Debug.css';

const Debug = ({ onLogout }) => {
  const [logs, setLogs] = useState([]);
  const [config, setConfig] = useState({});
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    // Check configuration
    const cfg = {
      hasToken: !!process.env.REACT_APP_GITHUB_TOKEN,
      tokenLength: process.env.REACT_APP_GITHUB_TOKEN?.length || 0,
      tokenPreview: process.env.REACT_APP_GITHUB_TOKEN?.substring(0, 10) + '...',
      hasGistId: !!process.env.REACT_APP_GIST_ID,
      gistId: process.env.REACT_APP_GIST_ID || 'Not set',
      env: process.env.NODE_ENV
    };
    setConfig(cfg);
    addLog('Configuration loaded', cfg);
  }, []);

  const addLog = (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, data }]);
  };

  const testGistConnection = async () => {
    addLog('Testing GitHub Gist connection...');
    setTestResult(null);

    try {
      if (!process.env.REACT_APP_GITHUB_TOKEN) {
        throw new Error('No GitHub token configured');
      }

      // Test authentication
      addLog('Testing GitHub authentication...');
      const authResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${process.env.REACT_APP_GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!authResponse.ok) {
        throw new Error(`Auth failed: ${authResponse.status} ${authResponse.statusText}`);
      }

      const user = await authResponse.json();
      addLog('✅ Authentication successful', { username: user.login });

      // Test fetching photos
      addLog('Fetching photos from Gist...');
      const photos = await galleryService.getPhotos();
      addLog('✅ Photos fetched', { count: photos.length });

      setTestResult({ success: true, message: 'All tests passed!' });
    } catch (error) {
      addLog('❌ Test failed', { error: error.message });
      setTestResult({ success: false, message: error.message });
    }
  };

  const testCreateGist = async () => {
    addLog('Testing Gist creation...');
    
    try {
      const testData = [{
        id: Date.now(),
        title: 'Test Photo',
        date: '2025-01-01',
        time: '12:00',
        imageUrl: 'data:image/png;base64,test',
        uploadedAt: new Date().toISOString()
      }];

      await galleryService.syncToGist(testData);
      addLog('✅ Gist sync successful');
    } catch (error) {
      addLog('❌ Gist sync failed', { error: error.message, stack: error.stack });
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const navigateHome = () => {
    window.history.pushState({}, '', '/4girlfriend');
    window.location.reload();
  };

  return (
    <div className="debug-container">
      <div className="debug-header">
        <h1>🔍 Debug Console</h1>
        <div className="debug-actions">
          <button onClick={navigateHome}>← Home</button>
          <button onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div className="debug-section">
        <h2>Configuration</h2>
        <div className="config-grid">
          <div className="config-item">
            <span className="config-label">Token:</span>
            <span className={config.hasToken ? 'status-ok' : 'status-error'}>
              {config.hasToken ? `✅ Present (${config.tokenLength} chars)` : '❌ Missing'}
            </span>
          </div>
          {config.hasToken && (
            <div className="config-item">
              <span className="config-label">Token Preview:</span>
              <code>{config.tokenPreview}</code>
            </div>
          )}
          <div className="config-item">
            <span className="config-label">Gist ID:</span>
            <span className={config.hasGistId ? 'status-ok' : 'status-warning'}>
              {config.hasGistId ? `✅ ${config.gistId}` : '⚠️ Not set (will auto-create)'}
            </span>
          </div>
          <div className="config-item">
            <span className="config-label">Environment:</span>
            <code>{config.env}</code>
          </div>
        </div>
      </div>

      <div className="debug-section">
        <h2>Tests</h2>
        <div className="test-buttons">
          <button onClick={testGistConnection} className="test-btn">
            Test Connection
          </button>
          <button onClick={testCreateGist} className="test-btn">
            Test Gist Sync
          </button>
          <button onClick={clearLogs} className="clear-btn">
            Clear Logs
          </button>
        </div>
        {testResult && (
          <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
            {testResult.message}
          </div>
        )}
      </div>

      <div className="debug-section">
        <h2>Logs ({logs.length})</h2>
        <div className="logs-container">
          {logs.length === 0 ? (
            <p className="no-logs">No logs yet. Run a test to see output.</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="log-entry">
                <span className="log-timestamp">[{log.timestamp}]</span>
                <span className="log-message">{log.message}</span>
                {log.data && (
                  <pre className="log-data">{JSON.stringify(log.data, null, 2)}</pre>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Debug;
