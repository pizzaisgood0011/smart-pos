import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', price: '', stock: '', barcode: '', category_id: ''
  });

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (product = null) => {
    if (product) {
      setEditing(product);
      setForm({
        name: product.name,
        price: product.price,
        stock: product.stock,
        barcode: product.barcode || '',
        category_id: product.category_id || '',
      });
    } else {
      setEditing(null);
      setForm({ name: '', price: '', stock: '', barcode: '', category_id: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, form);
        toast.success('Product updated!');
      } else {
        await api.post('/products', form);
        toast.success('Product created!');
      }
      closeModal();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted!');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <Toaster />
      <div style={styles.header}>
        <h1 style={styles.title}>Products</h1>
        <button style={styles.addBtn} onClick={() => openModal()}>+ Add Product</button>
      </div>

      {/* Products Table */}
      <div style={styles.tableBox}>
        <table style={styles.table}>
          <thead>
            <tr>
              {['Name', 'Category', 'Price', 'Stock', 'Barcode', 'Actions'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={styles.tr}>
                <td style={styles.td}>{p.name}</td>
                <td style={styles.td}>{p.category_name || '—'}</td>
                <td style={styles.td}>${parseFloat(p.price).toFixed(2)}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.stockBadge,
                    background: p.stock < 10 ? '#ef444420' : '#22c55e20',
                    color: p.stock < 10 ? '#ef4444' : '#22c55e',
                  }}>
                    {p.stock}
                  </span>
                </td>
                <td style={styles.td}>{p.barcode || '—'}</td>
                <td style={styles.td}>
                  <button style={styles.editBtn} onClick={() => openModal(p)}>Edit</button>
                  <button
                    style={styles.restockBtn}
                    onClick={async () => {
                      const amount = prompt('How many units to restock?');
                      if (!amount || isNaN(amount)) return;
                      await api.patch(`/products/${p.id}/restock`, { amount: parseInt(amount) });
                      toast.success(`Restocked ${amount} units!`);
                      fetchData();
                    }}
                  >
                    Restock
                  </button>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: '#94a3b8' }}>
                  No products yet - add one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>{editing ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              {[
                { name: 'name', label: 'Name', type: 'text' },
                { name: 'price', label: 'Price', type: 'number' },
                { name: 'stock', label: 'Stock', type: 'number' },
                { name: 'barcode', label: 'Barcode', type: 'text' }
              ].map(field => (
                <div key={field.name} style={styles.field}>
                  <label style={styles.label}>{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    onFocus={(e) => e.target.style.outline = '2px solid #ff5922'}
                    onBlur={(e) => e.target.style.outline = ''}
                    style={styles.input}
                    required={field.name !== 'barcode'}
                  />
                </div>
              ))}

              <div style={styles.field}>
                <label style={styles.label}>Category</label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  onFocus={(e) => e.target.style.outline = '2px solid #ff5922'}
                  onBlur={(e) => e.target.style.outline = ''}
                  style={styles.input}
                >
                  <option value="">No Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={closeModal} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.submitBtn}>
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.8rem', fontWeight: '800', color: '#343434' },
  loading: { color: '#94a3b8', padding: '2rem', textAlign: 'center' },
  addBtn: {
    padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none',
    background: '#6366f1', color: '#fff', fontWeight: '700', cursor: 'pointer',
  },
  tableBox: { background: '#ffffff', borderRadius: '12px', boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '1rem', textAlign: 'left', background: '#ff5922', color: '#ffffff', fontSize: '0.85rem', fontWeight: '600', borderBottom: '1px solid #ff5922' },
  tr: { borderBottom: '1px solid #dddddd' },
  td: { padding: '1rem', color: '#000000', fontSize: '0.9rem' },
  stockBadge: { padding: '0.25rem 0.6rem', borderRadius: '20px', fontWeight: '700', fontSize: '0.8rem' },
  editBtn: {
    padding: '0.3rem 0.7rem', borderRadius: '6px', border: 'none',
    background: '#6366f1', color: '#fff', cursor: 'pointer', fontWeight: '600', marginRight: '0.5rem',
  },
  restockBtn: {
    padding: '0.3rem 0.7rem', borderRadius: '6px', border: 'none',
    background: '#22c55e', color: '#fff', cursor: 'pointer',
    fontWeight: '600', marginRight: '0.5rem',
  },
  deleteBtn: {
    padding: '0.3rem 0.7rem', borderRadius: '6px', border: 'none',
    background: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: '600',
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
  },
  modal: {
    background: '#fff', padding: '2rem', borderRadius: '16px',
    width: '100%', maxWidth: '450px'
  },
  modalTitle: { color: '#ff5922', fontWeight: '800', marginBottom: '1.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { color: '#343434', fontSize: '0.85rem', fontWeight: '600' },
  input: {
    padding: '0.75rem 1rem', borderRadius: '8px', border: 'none',
    background: '#ebebeb', color: '#343434', fontSize: '1rem',
  },
  modalActions: { display: 'flex', gap: '1rem', marginTop: '0.5rem' },
  cancelBtn: {
    flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none',
    background: '#fff', color: '#343434', cursor: 'pointer', fontWeight: '600',
  },
  submitBtn: {
    flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none',
    background: '#ff5922', color: '#fff', cursor: 'pointer', fontWeight: '700',
  },
};

export default Products;
