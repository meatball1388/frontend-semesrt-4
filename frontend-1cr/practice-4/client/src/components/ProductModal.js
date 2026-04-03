import { useState, useEffect } from 'react';
import './ProductModal.scss';

function ProductModal({ open, mode, initialProduct, onClose, onCreate, onUpdate }) {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        stock: '',
        rating: '',
        image: ''
    });

    // Заполнение формы при редактировании
    useEffect(() => {
        if (initialProduct) {
            setFormData({
                name: initialProduct.name || '',
                category: initialProduct.category || '',
                price: initialProduct.price || '',
                stock: initialProduct.stock || '',
                rating: initialProduct.rating || '',
                image: initialProduct.image || ''
            });
        } else {
            setFormData({
                name: '',
                category: '',
                price: '',
                stock: '',
                rating: '',
                image: ''
            });
        }
    }, [initialProduct, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Валидация
        if (!formData.name.trim() || !formData.category.trim()) {
            alert('Введите название и категорию');
            return;
        }
        
        const price = parseFloat(formData.price);
        const stock = parseInt(formData.stock);
        const rating = parseFloat(formData.rating) || 0;
        
        if (isNaN(price) || price <= 0) {
            alert('Введите корректную цену');
            return;
        }
        
        if (isNaN(stock) || stock < 0) {
            alert('Введите корректное количество');
            return;
        }

        const data = {
            name: formData.name.trim(),
            category: formData.category.trim(),
            price,
            stock,
            rating,
            image: formData.image.trim() || 'https://via.placeholder.com/200'
        };

        if (mode === 'create') {
            onCreate(data);
        } else {
            onUpdate(data);
        }
    };

    if (!open) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal__close" onClick={onClose}>×</button>
                <h2 className="modal__title">
                    {mode === 'create' ? '➕ Новый товар' : '✏️ Редактирование товара'}
                </h2>
                
                <form className="form" onSubmit={handleSubmit}>
                    <div className="form__group">
                        <label>Название *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Например: Ноутбук ASUS"
                            required
                        />
                    </div>

                    <div className="form__group">
                        <label>Категория *</label>
                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            placeholder="Например: Ноутбуки"
                            required
                        />
                    </div>

                    <div className="form__group">
                        <label>Цена (₽) *</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className="form__group">
                        <label>Количество на складе *</label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            required
                        />
                    </div>

                    <div className="form__group">
                        <label>Рейтинг (0-5)</label>
                        <input
                            type="number"
                            name="rating"
                            value={formData.rating}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            max="5"
                            step="0.1"
                        />
                    </div>

                    <div className="form__group">
                        <label>URL изображения</label>
                        <input
                            type="url"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="form__actions">
                        <button type="button" className="btn" onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit" className="btn btn--success">
                            {mode === 'create' ? 'Создать' : 'Сохранить'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProductModal;
