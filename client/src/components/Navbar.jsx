import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: '📊 Dashboard' },
    { path: '/pos', label: '🛒 POS' },
    { path: '/products', label: '📦 Products' },
    { path: '/categories', label: '🗂️ Categories' },
    { path: '/users', label: '👥 Users'}
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>🛒 SmartPOS</div>

      <div style={styles.links}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              ...styles.link,
              ...(location.pathname === item.path ? styles.activeLink : {}),
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div style={styles.user}>
        <span style={styles.role}>{user?.role}</span>
        <span style={styles.name}>{user?.name}</span>
        <button onClick={handleLogout} style={styles.logout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    background: '#fff',
    borderBottom: '1px solid #e7e7e7',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  brand: {
    fontSize: '1.3rem',
    fontWeight: '800',
    color: '#ff5922',
  },
  links: {
    display: 'flex',
    gap: '0.5rem',
  },
  link: {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    color: '#94a3b8',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  activeLink: {
    background: '#ff5922',
    color: '#fff',
  },
  user: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  role: {
    background: '#ff5922',
    color: '#ffffff',
    padding: '0.25rem 0.6rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  name: {
    color: '#343434',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  logout: {
    padding: '0.4rem 0.9rem',
    borderRadius: '8px',
    border: '1px solid #ef4444',
    background: 'transparent',
    color: '#ef4444',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
  },
};

export default Navbar;
