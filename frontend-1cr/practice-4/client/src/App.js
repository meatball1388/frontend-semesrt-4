import { useState, useEffect } from 'react';
import { productsAPI } from './api';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import './App.scss';

function App() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [editingProduct, setEditingProduct] = useState(null);

    // Загрузка товаров при монтировании
    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await productsAPI.getAll();
            setProducts(response.data);
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setModalMode('create');
        setEditingProduct(null);
        setModalOpen(true);
    };

    const openEditModal = (product) => {
        setModalMode('edit');
        setEditingProduct(product);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingProduct(null);
    };

    const handleCreate = async (data) => {
        try {
            await productsAPI.create(data);
            loadProducts();
            closeModal();
        } catch (error) {
            console.error('Ошибка создания:', error);
        }
    };

    const handleUpdate = async (data) => {
        try {
            await productsAPI.update(editingProduct.id, data);
            loadProducts();
            closeModal();
        } catch (error) {
            console.error('Ошибка обновления:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) return;
        try {
            await productsAPI.delete(id);
            loadProducts();
        } catch (error) {
            console.error('Ошибка удаления:', error);
        }
    };

    return (
        <div className="app">
            <header className="header">
                <div className="header__brand">🛒 Store</div>
                <div className="header__actions">
                    <button className="btn btn--add-compact" onClick={openCreateModal} title="Добавить товар">
                        <span>+</span>
                    </button>
                </div>
            </header>

            <main className="container">
                {loading ? (
                    <div className="loading">Загрузка товаров...</div>
                ) : products.length === 0 ? (
                    <div className="empty">Товары не найдены</div>
                ) : (
                    <div className="products">
                        {products.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onEdit={openEditModal}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </main>

            <ProductModal
                open={modalOpen}
                mode={modalMode}
                initialProduct={editingProduct}
                onClose={closeModal}
                onCreate={handleCreate}
                onUpdate={handleUpdate}
            />

            <footer className="footer">
                <p>&copy; {new Date().getFullYear()} Online Store. Practice 4</p>
            </footer>
        </div>
    );
}

export default App;
