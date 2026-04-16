import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'cashier' });

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const openModal = (user = null) => {
        if (user) {
            setEditing(user);
            setForm({ name: user.name, email: user.email, password: '', role: user.role });
        } else {
            setEditing(null);
            setForm({ name: '', email: '', password: '', role: 'cashier' });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.put(`/users/${editing.id}`, form);
                toast.success('User updated!');
            } else {
                await api.post('/users', form);
                toast.success('User created!');
            }
            closeModal();
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Something went wrong');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this user?')) return;
        try {
            await api.delete(`/users/${id}`);
            toast.success('User deleted!');
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to delete');
        }
    };

    if (loading) return <div style={styles.loading}>Loading...</div>;

    return (
        <div style={styles.container}>
            <Toaster />
            <div style={styles.header}>
                <h1 style={styles.title}>👥 Users</h1>
                <button style={styles.addBtn} onClick={() => openModal()}>+ Add User</button>
            </div>

            <div style={styles.tableBox}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            {['Name', 'Email', 'Role', 'Created', 'Actions'].map(h => (
                                <th key={h} style={styles.th}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={styles.tr}>
                                <td style={styles.td}>{u.name}</td>
                                <td style={styles.td}>{u.email}</td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.roleBadge,
                                        background: u.role === 'admin' ? '#6366f120' : '#22c55e20',
                                        color: u.role === 'admin' ? '#6366f1' : '#22c55e',
                                    }}>
                                        {u.role}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    {new Date(u.created_at).toLocaleDateString()}
                                </td>
                                <td style={styles.td}>
                                    <button style={styles.editBtn} onClick={() => openModal(u)}>Edit</button>
                                    <button style={styles.deleteBtn} onClick={() => handleDelete(u.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ ...styles.td, textAlign: 'center', color: '#94a3b8' }}>
                                    No users yet!
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
                        <h2 style={styles.modalTitle}>{editing ? 'Edit User' : 'Add User'}</h2>
                        <form onSubmit={handleSubmit} style={styles.form}>
                            {[
                                { name: 'name', label: 'Name', type: 'text' },
                                { name: 'email', label: 'Email', type: 'email' },
                                { name: 'password', label: editing ? 'New Password (leave blank to keep)' : 'Password', type: 'password' },
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
                                        required={field.name !== 'password' || !editing}
                                    />
                                </div>
                            ))}

                            <div style={styles.field}>
                                <label style={styles.label}>Role</label>
                                <select name="role" value={form.role} onChange={handleChange}
                                    onFocus={(e) => e.target.style.outline = '2px solid #ff5922'}
                                    onBlur={(e) => e.target.style.outline = ''}
                                    style={styles.input}>
                                    <option value="cashier">Cashier</option>
                                    <option value="admin">Admin</option>
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
    container: { padding: '2rem', maxWidth: '1000px', margin: '0 auto' },
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
    roleBadge: { padding: '0.25rem 0.6rem', borderRadius: '20px', fontWeight: '700', fontSize: '0.8rem' },
    editBtn: {
        padding: '0.3rem 0.7rem', borderRadius: '6px', border: 'none',
        background: '#6366f1', color: '#fff', cursor: 'pointer', fontWeight: '600', marginRight: '0.5rem',
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

export default Users;