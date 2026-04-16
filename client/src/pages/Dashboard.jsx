import { useEffect, useState } from 'react';
import api from '../api/axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const [summary, setSummary] = useState([]);
  const [products, setProducts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, productsRes] = await Promise.all([
          api.get('/orders/summary'),
          api.get('/products'),
        ]);
        setSummary(summaryRes.data);
        setProducts(productsRes.data);
        const topRes = await api.get('/orders/top-products');
        setTopProducts(topRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = summary.reduce((sum, s) => sum + parseFloat(s.total_revenue || 0), 0);
  const totalOrders = summary.reduce((sum, s) => sum + parseInt(s.total_orders || 0), 0);
  const lowStock = products.filter(p => p.stock < 10);

  const chartData = summary.slice(0, 7).reverse().map(s => ({
    date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: parseFloat(s.total_revenue).toFixed(2),
  }));

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dashboard</h1>

      {/* Stats Cards */}
      <div style={styles.cards}>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Total Revenue</p>
          <p style={styles.cardRevenueValue}>${totalRevenue.toFixed(2)}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Total Orders</p>
          <p style={styles.cardValue}>{totalOrders}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Total Products</p>
          <p style={styles.cardValue}>{products.length}</p>
        </div>
        <div style={{ ...styles.card, borderColor: lowStock.length > 0 ? '#ef4444' : '#22c55e' }}>
          <p style={styles.cardLabel}>Low Stock Items</p>
          <p style={{ ...styles.cardValue, color: lowStock.length > 0 ? '#ef4444' : '#22c55e' }}>
            {lowStock.length}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div style={styles.chartBox}>
        <h2 style={styles.sectionTitle}>Revenue (Last 7 Days)</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#ff5922" strokeWidth={3} dot={{ fill: '#f19e63' }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p style={styles.empty}>No sales data yet — make some orders in POS! 🛒</p>
        )}
      </div>

      {/* Top Products */}
      <div style={styles.chartBox}>
        <h2 style={styles.sectionTitle}>Top Selling Products</h2>
        {topProducts.length > 0 ? (
          <div style={styles.table}>
            {topProducts.map((p, i) => (
              <div key={i} style={styles.tableRow}>
                <span style={{ color: '#ff5922', fontWeight: '700' }}>#{i + 1}</span>
                <span style={{ flex: 1, marginLeft: '1rem', color: '#ffffff' }}>{p.name}</span>
                <span style={{ color: '#94a3b8' }}>{p.total_sold} sold</span>
                <span style={{ color: '#22c55e', marginLeft: '1rem', fontWeight: '700' }}>
                  ${parseFloat(p.total_revenue).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={styles.empty}>No sales data yet!</p>
        )}
      </div>

      {/* Low Stock Warning */}
      {lowStock.length > 0 && (
        <div style={styles.alertBox}>
          <h2 style={styles.sectionTitle}>⚠️ Low Stock Alert</h2>
          <div style={styles.table}>
            {lowStock.map(p => (
              <div key={p.id} style={styles.tableRow}>
                <span style={{color: 'white'}}>{p.name}</span>
                <span style={{ color: '#ef4444', fontWeight: '700' }}>{p.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#343434',
    marginBottom: '1.5rem'
  },
  loading: {
    color: '#94a3b8',
    padding: '2rem',
    textAlign: 'center'
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  },
  card: {
    background: '#141f28', padding: '1.5rem', borderRadius: '12px',
    border: '1px solid #212934',
  },
  cardLabel: {
    color: '#94a3b8',
    fontSize: '0.85rem',
    marginBottom: '0.5rem'
  },
  cardValue: {
    color: '#f1f5f9', fontSize: '2rem', fontWeight: '800'
  },
  cardRevenueValue: {
    color: '#22c55e', fontSize: '2rem', fontWeight: '800'
  },
  chartBox: {
    background: '#141f28', padding: '1.5rem',
    borderRadius: '12px', border: '1px solid #212934',
    marginBottom: '2rem'
  },
  alertBox: {
    background: '#141f28', padding: '1.5rem',
    borderRadius: '12px', border: '1px solid #ef4444'
  },
  sectionTitle: {
    color: '#f1f5f9', fontWeight: '700', marginBottom: '1rem'
  },
  empty: {
    color: '#94a3b8', textAlign: 'center', padding: '2rem'
  },
  table: {
    display: 'flex', flexDirection: 'column', gap: '0.5rem'
  },
  tableRow: {
    display: 'flex', justifyContent: 'space-between',
    padding: '0.75rem 1rem', background: '#0f172a',
    borderRadius: '8px',
  },
};

export default Dashboard;
