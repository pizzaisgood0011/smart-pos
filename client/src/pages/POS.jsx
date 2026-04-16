import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import Receipt from '../components/Receipt';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [receipt, setReceipt] = useState(null);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories'),
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter products
  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search));
    const matchCategory = selectedCategory === '' || p.category_id === parseInt(selectedCategory);
    return matchSearch && matchCategory;
  });

  // Add to cart
  const addToCart = (product) => {
    if (product.stock <= 0) return toast.error('Out of stock!');
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error('Not enough stock!');
          return prev;
        }
        return prev.map(i => i.id === product.id
          ? { ...i, quantity: i.quantity + 1 }
          : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Update quantity
  const updateQty = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    const product = products.find(p => p.id === id);
    if (qty > product.stock) return toast.error('Not enough stock!');
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  // Remove from cart
  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  // Totals
  const subtotal = cart.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  // Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error('Cart is empty!');
    setCheckingOut(true);
    try {
      const res = await api.post('/orders', {
        payment_method: paymentMethod,
        items: cart.map(i => ({
          product_id: i.id,
          quantity: i.quantity,
          price: i.price,
        })),
      });
      setReceipt(res.data);
      toast.success('Order placed! 🎉');
      const productsRes = await api.get('/products');
      setProducts(productsRes.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Checkout failed');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <Toaster />
      <div style={styles.left}>
        {/* Search + Filter */}
        <div style={styles.searchRow}>
          <input
            type="text"
            placeholder="🔍 Search by name or barcode..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={(e) => e.target.style.outline = '2px solid #ff5922'}
            onBlur={(e) => e.target.style.outline = ''}
            style={styles.searchInput}
          />
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            style={styles.select}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        <div style={styles.grid}>
          {filtered.map(p => (
            <div
              key={p.id}
              style={{
                ...styles.productCard,
                opacity: p.stock <= 0 ? 0.4 : 1,
                cursor: p.stock <= 0 ? 'not-allowed' : 'pointer',
              }}
              onClick={() => addToCart(p)}
            >
              <div style={styles.productName}>{p.name}</div>
              <div style={styles.productCategory}>{p.category_name || 'No category'}</div>
              <div style={styles.productBottom}>
                <span style={styles.productPrice}>${parseFloat(p.price).toFixed(2)}</span>
                <span style={{
                  ...styles.stockLabel,
                  color: p.stock < 10 ? '#ef4444' : '#22c55e',
                }}>
                  {p.stock} left
                </span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p style={styles.empty}>No products found</p>
          )}
        </div>
      </div>

      {/* Cart */}
      <div style={styles.right}>
        <h2 style={styles.cartTitle}>🛒 Cart</h2>

        {cart.length === 0 ? (
          <p style={styles.emptyCart}>Tap a product to add it</p>
        ) : (
          <div style={styles.cartItems}>
            {cart.map(item => (
              <div key={item.id} style={styles.cartItem}>
                <div style={styles.cartItemName}>{item.name}</div>
                <div style={styles.cartItemControls}>
                  <button style={styles.qtyBtn} onClick={() => updateQty(item.id, item.quantity - 1)}>−</button>
                  <span style={styles.qtyValue}>{item.quantity}</span>
                  <button style={styles.qtyBtn} onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                </div>
                <div style={styles.cartItemPrice}>
                  ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                </div>
                <button style={styles.removeBtn} onClick={() => removeFromCart(item.id)}>✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Totals */}
        <div style={styles.totals}>
          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>Subtotal</span>
            <span style={styles.totalValue}>${subtotal.toFixed(2)}</span>
          </div>
          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>Tax (10%)</span>
            <span style={styles.totalValue}>${tax.toFixed(2)}</span>
          </div>
          <div style={{ ...styles.totalRow, borderTop: '1px solid #334155', paddingTop: '0.75rem' }}>
            <span style={{ ...styles.totalLabel, color: '#f1f5f9', fontWeight: '800' }}>Total</span>
            <span style={{ ...styles.totalValue, color: '#ff5922', fontSize: '1.3rem', fontWeight: '800' }}>
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Method */}
        <div style={styles.paymentRow}>
          {['cash', 'card', 'qr'].map(method => (
            <button
              key={method}
              style={{
                ...styles.paymentBtn,
                background: paymentMethod === method ? '#ff5922' : '#e6e6e6',
                color: paymentMethod === method ? '#fff' : '#94a3b8',
              }}
              onClick={() => setPaymentMethod(method)}
            >
              {method === 'cash' ? '💵 Cash' : method === 'card' ? '💳 Card' : '📱 QR'}
            </button>
          ))}
        </div>

        {/* Checkout Button */}
        <button
          style={{
            ...styles.checkoutBtn,
            opacity: cart.length === 0 ? 0.5 : 1,
          }}
          onClick={handleCheckout}
          disabled={checkingOut || cart.length === 0}
        >
          {checkingOut ? 'Processing...' : `Checkout $${total.toFixed(2)}`}
        </button>

        {/* Clear Cart */}
        {cart.length > 0 && (
          <button style={styles.clearBtn} onClick={() => setCart([])}>
            Clear Cart
          </button>
        )}
      </div>
      {receipt && (
        <Receipt
          order={receipt}
          cart={cart}
          subtotal={subtotal}
          tax={tax}
          total={total}
          paymentMethod={paymentMethod}
          onClose={() => { setReceipt(null); setCart([]); }}
        />
      )}
    </div>
  );
};

const styles = {
  container: { display: 'flex', height: 'calc(100vh - 65px)', overflow: 'hidden' },
  loading: { color: '#94a3b8', padding: '2rem', textAlign: 'center' },

  // Left - Products
  left: { flex: 1, padding: '1.5rem', overflowY: 'auto' },
  searchRow: { display: 'flex', gap: '1rem', marginBottom: '1.5rem' },
  searchInput: {
    flex: 1, padding: '0.75rem 1rem', borderRadius: '8px',
    border: '1px solid #b6b6b6', background: '#ffffff', color: '#6d6d6d', fontSize: '0.95rem',
  },
  select: {
    padding: '0.75rem 1rem', borderRadius: '8px',
    border: '1px solid #334155', background: '#ffffff', color: '#343434',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' },
  productCard: {
    background: '#fff8f3a7', borderRadius: '12px', padding: '1rem',
    transition: 'all 0.2s', boxShadow: 'rgba(99, 99, 99, 0.37) 0px 2px 8px 0px'
  },
  productName: { color: '#343434', fontWeight: '700', marginBottom: '0.3rem', fontSize: '0.95rem' },
  productCategory: { color: '#949494', fontSize: '0.75rem', marginBottom: '0.75rem' },
  productBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { color: '#ff5922', fontWeight: '800', fontSize: '1rem' },
  stockLabel: { fontSize: '0.75rem', fontWeight: '600' },
  empty: { color: '#94a3b8', gridColumn: '1/-1', textAlign: 'center', padding: '2rem' },

  // Right - Cart
  right: {
    width: '360px', padding: '1.5rem', display: 'flex', boxShadow: '-1.95px 1.95px 2.6px rgba(0, 0, 0, 0.15)',
    flexDirection: 'column', background: '#f7f7f7', overflowY: 'auto', borderRadius: '20px'
  },
  cartTitle: { color: '#ff5922', fontWeight: '800', fontSize: '1.3rem', marginBottom: '1rem' },
  emptyCart: { color: '#b1b1b1', textAlign: 'center', padding: '2rem 0', flex: 1 },
  cartItems: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' },
  cartItem: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: '#0f172a', padding: '0.75rem', borderRadius: '8px',
  },
  cartItemName: { flex: 1, color: '#f1f5f9', fontSize: '0.85rem', fontWeight: '600' },
  cartItemControls: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  qtyBtn: {
    width: '26px', height: '26px', borderRadius: '6px', border: 'none',
    background: '#334155', color: '#f1f5f9', cursor: 'pointer', fontWeight: '700',
  },
  qtyValue: { color: '#f1f5f9', fontWeight: '700', minWidth: '20px', textAlign: 'center' },
  cartItemPrice: { color: '#ff5922', fontWeight: '700', fontSize: '0.9rem', minWidth: '55px', textAlign: 'right' },
  removeBtn: {
    background: 'none', border: 'none', color: '#ef4444',
    cursor: 'pointer', fontSize: '0.85rem', padding: '0.2rem',
  },
  totals: { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' },
  totalRow: { display: 'flex', justifyContent: 'space-between' },
  totalLabel: { color: '#94a3b8', fontSize: '0.9rem' },
  totalValue: { color: '#f1f5f9', fontWeight: '600' },
  paymentRow: { display: 'flex', gap: '0.5rem', marginBottom: '1rem' },
  paymentBtn: {
    flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none',
    cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem',
  },
  checkoutBtn: {
    width: '100%', padding: '1rem', borderRadius: '10px', border: 'none',
    background: '#ff5922', color: '#fff', fontWeight: '800', fontSize: '1rem',
    cursor: 'pointer', marginBottom: '0.5rem',
  },
  clearBtn: {
    width: '100%', padding: '0.75rem', borderRadius: '10px',
    border: '1px solid #c3c3c3', background: 'transparent',
    color: '#343434', cursor: 'pointer', fontWeight: '600',
  },
};

export default POS;
