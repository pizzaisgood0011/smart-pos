const Receipt = ({ order, cart, total, subtotal, tax, paymentMethod, onClose }) => {
    const handlePrint = () => window.print();

    return (
        <div style={styles.overlay}>
            <div style={styles.receipt} id="receipt">
                <div style={styles.header}>
                    <h2 style={styles.brand}>🛒 SmartPOS</h2>
                    <p style={styles.meta}>Order #{order?.id}</p>
                    <p style={styles.meta}>{new Date().toLocaleString()}</p>
                </div>

                <div style={styles.divider} />

                <div style={styles.items}>
                    {cart.map(item => (
                        <div key={item.id} style={styles.item}>
                            <span style={styles.itemName}>{item.name} x{item.quantity}</span>
                            <span style={styles.itemPrice}>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                <div style={styles.divider} />

                <div style={styles.totals}>
                    <div style={styles.row}>
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div style={styles.row}>
                        <span>Tax (10%)</span>
                        <span>${tax.toFixed(2)}</span>
                    </div>
                    <div style={{ ...styles.row, ...styles.totalRow }}>
                        <span>TOTAL</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <div style={styles.row}>
                        <span>Payment</span>
                        <span style={{ textTransform: 'uppercase' }}>{paymentMethod}</span>
                    </div>
                </div>

                <div style={styles.divider} />
                <p style={styles.footer}>អរគុណសម្រាប់ការមកកាន់​ SmartPOS 🙏</p>
                <p style={styles.footer}>Thank you for your purchase! 🙏</p>

                <div style={styles.actions} className="no-print">
                    <button style={styles.printBtn} onClick={handlePrint}>🖨️ Print</button>
                    <button style={styles.closeBtn} onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300,
    },
    receipt: {
        background: '#fff', color: '#000', padding: '2rem', borderRadius: '12px',
        width: '320px', fontFamily: 'monospace',
    },
    header: { textAlign: 'center', marginBottom: '1rem' },
    brand: { fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.3rem' },
    meta: { fontSize: '0.8rem', color: '#666' },
    divider: { borderTop: '1px dashed #ccc', margin: '1rem 0' },
    items: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    item: { display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' },
    itemName: { flex: 1 },
    itemPrice: { fontWeight: '700' },
    totals: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
    row: { display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' },
    totalRow: { fontWeight: '800', fontSize: '1.1rem', marginTop: '0.5rem' },
    footer: { textAlign: 'center', fontSize: '0.85rem', color: '#666', margin: '1rem 0' },
    actions: { display: 'flex', gap: '0.5rem' },
    printBtn: {
        flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none',
        background: '#6366f1', color: '#fff', fontWeight: '700', cursor: 'pointer',
    },
    closeBtn: {
        flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #ccc',
        background: 'transparent', cursor: 'pointer', fontWeight: '600',
    },
};

export default Receipt;