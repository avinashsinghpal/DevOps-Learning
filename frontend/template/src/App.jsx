import { useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:3000/api/items';

function App() {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [response, setResponse] = useState(null);

  async function sendRequest(method, url, body) {
    try {
      const options = { method };

      if (body) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(body);
      }

      const res = await fetch(url, options);
      const data = await res.json();

      setResponse({ method, status: res.status, data });
    } catch (err) {
      setResponse({
        method,
        status: 'Network error',
        data: { error: err.message },
      });
    }
  }

  return (
    <div className="container">
      <h1>CRUD Playground</h1>

      <div className="inputs">
        <input
          type="text"
          placeholder="Name (for POST / PUT)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
        type="text"
        placeholder="_id (for PUT / DELETE)"
        value={id}
        onChange={(e) => setId(e.target.value.trim())}
        />
      </div>

      <div className="buttons">
        <button onClick={() => sendRequest('GET', API_URL)}>GET</button>
        <button onClick={() => sendRequest('POST', API_URL, { name })}>POST</button>
        <button onClick={() => sendRequest('PUT', `${API_URL}/${id}`, { name })}>PUT</button>
        <button onClick={() => sendRequest('DELETE', `${API_URL}/${id}`)}>DELETE</button>
      </div>

      <h2>Response</h2>
      <pre className="output">
        {response
          ? `${response.method} → Status: ${response.status}\n\n${JSON.stringify(response.data, null, 2)}`
          : 'Click a button to send a request'}
      </pre>
    </div>
  );
}

export default App;