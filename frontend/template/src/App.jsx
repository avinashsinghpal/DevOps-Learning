
import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:3000/api/items';
const AUTH_URL = 'http://localhost:3000/api/auth';

function App() {
  // Existing CRUD states
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [response, setResponse] = useState(null);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [activePage, setActivePage] = useState('dashboard');

  // Dark / Light Mode
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
);

  // Authentication states
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  useEffect(() => {
  if (!token) return;

  async function fetchItems() {
    try {
      const res = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to load items:', error);
    }
  }

  fetchItems();
}, [token]);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isSignup, setIsSignup] = useState(false);

  const [authData, setAuthData] = useState({
    username: '',
    email: '',
    identifier: '',
    password: '',
  });

  // Signup and Login function
  async function handleAuth() {
    try {
      const endpoint = isSignup ? 'signup' : 'login';

      const body = isSignup
        ? {
            username: authData.username,
            email: authData.email,
            password: authData.password,
          }
        : {
            identifier: authData.identifier,
            password: authData.password,
          };

      const res = await fetch(`${AUTH_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      setResponse({
        method: endpoint.toUpperCase(),
        status: res.status,
        data,
      });

      if (res.ok && !isSignup) {
        setToken(data.token);
        setUser(data.user);

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

    } catch (err) {
      setResponse({
        method: 'AUTH',
        status: 'Network error',
        data: { error: err.message },
      });
    }
  }

  // CRUD request function with JWT authentication
  async function sendRequest(method, url, body) {
    try {
      const options = {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (body) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
      }

      const res = await fetch(url, options);
      const data = await res.json();
      if (res.ok && method === 'GET') {
        setItems(data);
      }

      if (res.ok && method === 'POST') {
        setName('');
      }

      if (res.ok && method === 'DELETE') {
        setId('');
      }
      // Refresh item list after any successful change
      if (res.ok && ['POST', 'PUT', 'DELETE'].includes(method)) {
        const listRes = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const listData = await listRes.json();

        if (listRes.ok) {
          setItems(listData);
        }
      }
      setResponse({
        method,
        status: res.status,
        data,
      });

    } catch (err) {
      setResponse({
        method,
        status: 'Network error',
        data: { error: err.message },
      });
    }
  }

  // Logout function
  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setToken('');
    setUser(null);
    setName('');
    setId('');
    setResponse(null);
  }
  
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
      <div className={`app-layout ${darkMode ? 'dark-mode' : ''}`}>

    {!token ? (
      <div className="auth-page">
        <div className="auth-card">
          <div className="brand-icon">C</div>

          <h1>{isSignup ? 'Create your account' : 'Welcome back!'}</h1>
          <p className="auth-subtitle">
            {isSignup
              ? 'Sign up to manage your inventory.'
              : 'Login to access your dashboard.'}
          </p>

          <div className="auth-form">
            {isSignup && (
              <>
                <label>Username</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={authData.username}
                  onChange={(e) =>
                    setAuthData({ ...authData, username: e.target.value })
                  }
                />

                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  value={authData.email}
                  onChange={(e) =>
                    setAuthData({ ...authData, email: e.target.value })
                  }
                />
              </>
            )}

            {!isSignup && (
              <>
                <label>Username or Email</label>
                <input
                  type="text"
                  placeholder="Enter username or email"
                  value={authData.identifier}
                  onChange={(e) =>
                    setAuthData({ ...authData, identifier: e.target.value })
                  }
                />
              </>
            )}

            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={authData.password}
              onChange={(e) =>
                setAuthData({ ...authData, password: e.target.value })
              }
            />

            <button className="primary-btn" onClick={handleAuth}>
              {isSignup ? 'Create Account' : 'Login'}
            </button>
          </div>

          <p className="auth-switch">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            <button onClick={() => setIsSignup(!isSignup)}>
              {isSignup ? 'Login' : 'Sign up'}
            </button>
          </p>

          {response && (
            <p className="auth-message">
              {response.data?.message || response.status}
            </p>
          )}
        </div>
      </div>
    ) : (
      <div className="dashboard">

        <aside className="sidebar">
          <div className="sidebar-brand">
            <span className="brand-icon">C</span>
            <span>CRUD Panel</span>
          </div>

          <p className="sidebar-label">MENU</p>

          <button
          className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActivePage('dashboard')}
        >
          <span>▦</span> Dashboard
        </button>

        <button
          className={`nav-item ${activePage === 'items' ? 'active' : ''}`}
          onClick={() => setActivePage('items')}
        >
          <span>▤</span> My Items
        </button>

          <div className="sidebar-bottom">
            <div className="user-profile">
              <div className="avatar">
                {(user?.username || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <strong>{user?.username || 'User'}</strong>
                <small>Account</small>
              </div>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              ↪ Logout
            </button>
          </div>
        </aside>

        <main className="main-content">

          <header className="topbar">
            <div>
              <h1>{activePage === 'dashboard' ? 'Dashboard' : 'My Items'}</h1>
              <p>Manage and organize your items.</p>
            </div>
            <div className="topbar-actions">
              <button
                  className="theme-toggle"
                  onClick={() => {
                    const newMode = !darkMode;
                    setDarkMode(newMode);
                    localStorage.setItem('theme', newMode ? 'dark' : 'light');
                  }}
                >
                  {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>

                <div className="topbar-user">
                  Welcome, {user?.username || 'User'}!
                </div>
              </div>
          </header>
          
          {activePage === 'dashboard' && (
            <section className="stats-grid">
              <div className="stat-card">
                <span>Total Items</span>
                <h2>{items.length}</h2>
                <small>Items in your collection</small>
              </div>

              <div className="stat-card">
                <span>Account Status</span>
                <h2 className="status-text">Active</h2>
                <small>Authenticated session</small>
              </div>

              <div className="stat-card">
                <span>Data Management</span>
                <h2>CRUD</h2>
                <small>Create, read, update and delete</small>
              </div>
            </section>
          )}
          {activePage === 'items' && (
          <section className="content-card">
            <div className="section-heading">
              <div>
                <h2>My Items</h2>
                <p>View and manage your saved items.</p>
              </div>

              <button
                className="primary-btn add-btn"
                onClick={() => {
                setId('');
                setName('');
                document.querySelector('.item-form input')?.focus();
              }}
              >
                + Add New Item
              </button>
            </div>

            <div className="toolbar">
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button
                className="secondary-btn"
                onClick={() => sendRequest('GET', API_URL)}
              >
                ↻ Refresh
              </button>
            </div>

            <div className="item-form">
              <div className="form-field">
                <label>Item Name</label>
                <input
                  type="text"
                  placeholder="Enter item name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Item ID (for editing)</label>
                <input
                  type="text"
                  placeholder="Select an item or enter ID"
                  value={id}
                  onChange={(e) => setId(e.target.value.trim())}
                />
              </div>

              <button
                className="primary-btn"
                onClick={() =>
                  id
                    ? sendRequest('PUT', `${API_URL}/${id}`, { name })
                    : sendRequest('POST', API_URL, { name })
                }
                disabled={!name.trim()}
              >
                {id ? 'Save Changes' : 'Create Item'}
              </button>
            </div>

            <div className="table-wrapper">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Item ID</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <tr key={item._id}>
                        <td><strong>{item.name}</strong></td>
                        <td className="item-id">{item._id}</td>
                        <td>
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString()
                            : '—'}
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="edit-btn"
                              onClick={() => {
                                setId(item._id);
                                setName(item.name);
                              }}
                            >
                              Edit
                            </button>

                            <button
                              className="delete-btn"
                              onClick={() =>
                                sendRequest('DELETE', `${API_URL}/${item._id}`)
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="empty-state">
                        {search
                          ? 'No matching items found.'
                          : 'No items yet. Create your first item!'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
          )}

          {activePage === 'items' && response && (
 
            <section className="response-card">
              <h3>Latest API Response</h3>
              <p>{response.method} — Status: {response.status}</p>
              <pre>{JSON.stringify(response.data, null, 2)}</pre>
            </section>
          )}

          <footer className="dashboard-footer">
            CRUD Playground · Built with React, Express and MongoDB
          </footer>

        </main>
      </div>
    )}
   </div>
  );
}

export default App;
