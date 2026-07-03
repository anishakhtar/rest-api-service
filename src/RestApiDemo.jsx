import React, { useState } from 'react';
import { FiArrowLeft, FiSend, FiCopy, FiCheck, FiClock, FiCode, FiExternalLink } from 'react-icons/fi';

const endpoints = [
  { id: 'get-users',    method: 'GET',    path: '/api/users',    desc: 'List all users' },
  { id: 'get-user',     method: 'GET',    path: '/api/users/1',  desc: 'Get user by ID' },
  { id: 'create-user',  method: 'POST',   path: '/api/users',    desc: 'Create a user' },
  { id: 'update-user',  method: 'PUT',    path: '/api/users/1',  desc: 'Update a user' },
  { id: 'delete-user',  method: 'DELETE',  path: '/api/users/1',  desc: 'Delete a user' },
  { id: 'get-posts',    method: 'GET',    path: '/api/posts',    desc: 'List all posts' },
  { id: 'get-post',     method: 'GET',    path: '/api/posts/1',  desc: 'Get post by ID' },
  { id: 'create-post',  method: 'POST',   path: '/api/posts',    desc: 'Create a post' },
  { id: 'update-post',  method: 'PUT',    path: '/api/posts/1',  desc: 'Update a post' },
  { id: 'delete-post',  method: 'DELETE',  path: '/api/posts/1',  desc: 'Delete a post' },
];

const methodColors = { GET: '#10b981', POST: '#3b82f6', PUT: '#f59e0b', DELETE: '#ef4444' };

let mockDb = {
  users: [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', createdAt: '2024-01-15T10:30:00Z' },
    { id: 2, name: 'Bob Smith',     email: 'bob@example.com',   role: 'editor', createdAt: '2024-02-20T14:00:00Z' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'viewer', createdAt: '2024-03-10T09:15:00Z' },
  ],
  posts: [
    { id: 1, title: 'Getting Started with React',  body: 'React is a JavaScript library for building user interfaces...', userId: 1, published: true, createdAt: '2024-03-01T08:00:00Z' },
    { id: 2, title: 'Understanding Node.js Streams', body: 'Streams are one of the core concepts in Node.js...', userId: 2, published: true, createdAt: '2024-03-15T12:30:00Z' },
    { id: 3, title: 'CSS Grid vs Flexbox',         body: 'Both CSS Grid and Flexbox are powerful layout tools...', userId: 1, published: false, createdAt: '2024-04-01T16:45:00Z' },
  ],
};

let nextIds = { users: 4, posts: 4 };

const RestApiDemo = ({ onBack }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState(endpoints[0]);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requestBody, setRequestBody] = useState('');
  const [showBody, setShowBody] = useState(false);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const [showAuth, setShowAuth] = useState(false);

  const parsePath = (path) => {
    const parts = path.split('/');
    const resource = parts[2];
    const id = parts[3] ? parseInt(parts[3]) : null;
    return { resource, id };
  };

  const simulateDelay = (ms) => new Promise((r) => setTimeout(r, ms));

  const executeRequest = async () => {
    setLoading(true);
    setResponse(null);
    const startTime = performance.now();

    await simulateDelay(400 + Math.random() * 600);

    const { method, path } = selectedEndpoint;
    const { resource, id } = parsePath(path);
    let data, status, statusText;

    try {
      switch (method) {
        case 'GET': {
          if (id) {
            const item = mockDb[resource]?.find((u) => u.id === id);
            if (!item) { data = { error: 'Not found' }; status = 404; statusText = 'Not Found'; }
            else { data = item; status = 200; statusText = 'OK'; }
          } else {
            data = mockDb[resource] || []; status = 200; statusText = 'OK';
          }
          break;
        }
        case 'POST': {
          const body = requestBody ? JSON.parse(requestBody) : {};
          const newItem = { id: nextIds[resource]++, ...body, createdAt: new Date().toISOString() };
          mockDb[resource] = mockDb[resource] || [];
          mockDb[resource].push(newItem);
          data = newItem; status = 201; statusText = 'Created';
          break;
        }
        case 'PUT': {
          const putBody = requestBody ? JSON.parse(requestBody) : {};
          const idx = mockDb[resource]?.findIndex((u) => u.id === id);
          if (idx === -1 || idx === undefined) { data = { error: 'Not found' }; status = 404; statusText = 'Not Found'; }
          else {
            mockDb[resource][idx] = { ...mockDb[resource][idx], ...putBody, id };
            data = mockDb[resource][idx]; status = 200; statusText = 'OK';
          }
          break;
        }
        case 'DELETE': {
          const delIdx = mockDb[resource]?.findIndex((u) => u.id === id);
          if (delIdx === -1 || delIdx === undefined) { data = { error: 'Not found' }; status = 404; statusText = 'Not Found'; }
          else {
            const deleted = mockDb[resource].splice(delIdx, 1)[0];
            data = { message: 'Deleted successfully', item: deleted }; status = 200; statusText = 'OK';
          }
          break;
        }
        default: data = { error: 'Method not allowed' }; status = 405; statusText = 'Method Not Allowed';
      }
    } catch (e) {
      data = { error: 'Invalid JSON body' }; status = 400; statusText = 'Bad Request';
    }

    const elapsed = Math.round(performance.now() - startTime);
    const result = { data, status, statusText, elapsed };
    setResponse(result);
    setHistory((prev) => [{ method, path, status, timestamp: Date.now() }, ...prev].slice(0, 20));
    setLoading(false);
  };

  const selectEndpoint = (ep) => {
    setSelectedEndpoint(ep);
    setResponse(null);
    setRequestBody('');
    setShowBody(ep.method === 'POST' || ep.method === 'PUT');
  };

  const copyResponse = () => {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="api-demo">
      <div className="container">
        <div className="demo-header">
          <button className="btn-back" onClick={onBack}>
            <FiArrowLeft size={20} /> Back to Portfolio
          </button>
          <h2 className="section-title">REST API Service Demo</h2>
          <p className="section-subtitle">A fully functional REST API with mock CRUD operations</p>
        </div>

        <div className="api-layout">
          <div className="api-sidebar">
            <div className="api-sidebar-header">
              <h3>Endpoints</h3>
            </div>
            <div className="api-endpoint-list">
              {endpoints.map((ep) => (
                <button
                  key={ep.id}
                  className={`api-endpoint ${selectedEndpoint.id === ep.id ? 'active' : ''}`}
                  onClick={() => selectEndpoint(ep)}
                >
                  <span className="api-method-badge" style={{ background: methodColors[ep.method] }}>
                    {ep.method}
                  </span>
                  <div className="api-endpoint-info">
                    <span className="api-path">{ep.path}</span>
                    <span className="api-desc">{ep.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="api-main">
            <div className="api-request-panel">
              <div className="api-request-bar">
                <span className="api-method-badge large" style={{ background: methodColors[selectedEndpoint.method] }}>
                  {selectedEndpoint.method}
                </span>
                <span className="api-url">https://api.example.com{selectedEndpoint.path}</span>
              </div>

              <div className="api-toolbar">
                <button className="api-tool-btn" onClick={() => setShowAuth(!showAuth)}>
                  <FiCode size={16} /> Auth
                </button>
                {(selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PUT') && (
                  <button className={`api-tool-btn ${showBody ? 'active' : ''}`} onClick={() => setShowBody(!showBody)}>
                    <FiExternalLink size={16} /> Body
                  </button>
                )}
              </div>

              {showAuth && (
                <div className="api-auth-box">
                  <label>Authorization: Bearer</label>
                  <input
                    type="text"
                    placeholder="Enter your token..."
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                  />
                </div>
              )}

              {showBody && (
                <div className="api-body-box">
                  <label>Request Body (JSON)</label>
                  <textarea
                    placeholder='{"name": "John Doe", "email": "john@example.com"}'
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    rows={6}
                  />
                </div>
              )}

              <button className="btn btn-primary api-send-btn" onClick={executeRequest} disabled={loading}>
                <FiSend size={16} /> {loading ? 'Sending...' : 'Send Request'}
              </button>
            </div>

            <div className="api-response-panel">
              <div className="api-response-header">
                <h3>Response</h3>
                <div className="api-response-actions">
                  {history.length > 0 && (
                    <button className="api-tool-btn" onClick={() => setResponse(history[0]?.status ? response : null)}>
                      <FiClock size={16} /> History
                    </button>
                  )}
                  {response && (
                    <button className="api-tool-btn" onClick={copyResponse}>
                      {copied ? <FiCheck size={16} /> : <FiCopy size={16} />} {copied ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>

              {!response && !loading && (
                <div className="api-response-empty">
                  <FiCode size={48} />
                  <p>Select an endpoint and send a request to see the response</p>
                </div>
              )}

              {loading && (
                <div className="api-response-loading">
                  <div className="loading-spinner"></div>
                  <p>Sending request...</p>
                </div>
              )}

              {response && !loading && (
                <div className="api-response-content">
                  <div className="api-response-meta">
                    <span className={`api-status-badge ${response.status < 300 ? 'success' : response.status < 500 ? 'warning' : 'error'}`}>
                      {response.status} {response.statusText}
                    </span>
                    <span className="api-timing">
                      <FiClock size={14} /> {response.elapsed}ms
                    </span>
                  </div>
                  <pre className="api-response-json">
                    <code>{JSON.stringify(response.data, null, 2)}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RestApiDemo;

