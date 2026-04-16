import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.put(`/categories/${editing.id}`, { name });
                toast.success('Category updated!');
                setEditing(null);
            } else {
                await api.post('/categories', { name });
                toast.success('Category created!');
            }
            setName('');
            fetchCategories();
        } catch {
            toast.error('Something went wrong');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this category?')) return;
        try {
            await api.delete(`/categories/${id}`);
            toast.success('Category deleted!');
            fetchCategories();
        } catch {
            toast.error('Failed to delete');
        }
    };

    if (loading) return <div style={styles.loading}>Loading...</div>;

    return (
        <div style={styles.container}>
            <Toaster />
            <h1 style={styles.title}>🗂️ Categories</h1>

            {/* Form */}
            <div style={styles.formBox}>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input
                        type="text"
                        placeholder="Category name..."
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onFocus={(e) => e.target.style.outline = '2px solid #ff5922'}
                        onBlur={(e) => e.target.style.outline = ''}
                        style={styles.input}
                        required
                    />
                    <button type="submit" style={styles.submitBtn}>
                        {editing ? 'Update' : 'Add Category'}
                    </button>
                    {editing && (
                        <button
                            type="button"
                            style={styles.cancelBtn}
                            onClick={() => { setEditing(null); setName(''); }}
                        >
                            Cancel
                        </button>
                    )}
                </form>
            </div>

            {/* List */}
            <div style={styles.list}>
                {categories.map(c => (
                    <div key={c.id} style={styles.item}>
                        <span style={styles.itemName}>{c.name}</span>
                        <div style={styles.actions}>
                            <button
                                style={styles.editBtn}
                                onClick={() => { setEditing(c); setName(c.name); }}
                            >
                                Edit
                            </button>
                            <button style={styles.deleteBtn} onClick={() => handleDelete(c.id)}>
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
                {categories.length === 0 && (
                    <p style={styles.empty}>No categories yet!</p>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '2rem', maxWidth: '600px', margin: '0 auto' },
    title: { fontSize: '1.8rem', fontWeight: '800', color: '#343434', marginBottom: '1.5rem' },
    loading: { color: '#94a3b8', padding: '2rem', textAlign: 'center' },
    formBox: { 
        background: '#ff5922', padding: '1.5rem', borderRadius: '12px', border: 'none', marginBottom: '1.5rem',
        boxShadow: 'rgba(0, 0, 0, 0.15) 0px 4px 10px'
    },
    form: { display: 'flex', gap: '0.75rem' },
    input: {
        flex: 1, padding: '0.75rem 1rem', borderRadius: '8px',
        border: '1px solid #b6b6b6', background: '#ffffff', color: '#6d6d6d', fontSize: '1rem',
    },
    submitBtn: {
        padding: '0.75rem 1.2rem', borderRadius: '8px', border: 'none',
        background: '#ffffff', color: '#ff5922', fontWeight: '700', cursor: 'pointer',
    },
    cancelBtn: {
        padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #334155',
        background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontWeight: '600',
    },
    list: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
    item: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#ff5922', padding: '1rem 1.5rem', borderRadius: '10px', border: 'none',
    },
    itemName: { color: '#f1f5f9', fontWeight: '600' },
    actions: { display: 'flex', gap: '0.5rem' },
    editBtn: {
        padding: '0.3rem 0.7rem', borderRadius: '6px', border: 'none',
        background: '#6366f1', color: '#fff', cursor: 'pointer', fontWeight: '600',
    },
    deleteBtn: {
        padding: '0.3rem 0.7rem', borderRadius: '6px', border: 'none',
        background: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: '600',
    },
    empty: { color: '#94a3b8', textAlign: 'center', padding: '2rem' },
};

export default Categories;