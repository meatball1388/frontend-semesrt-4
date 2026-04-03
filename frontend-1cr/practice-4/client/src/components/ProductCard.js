import './ProductCard.scss';

function ProductCard({ product, onEdit, onDelete }) {
    return (
        <div className="product-card">
            <img
                src={product.image}
                alt={product.name}
                className="product-card__image"
                onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200';
                }}
            />
            <div className="product-card__content">
                <h3 className="product-card__name">{product.name}</h3>
                <p className="product-card__category">{product.category}</p>
                <div className="product-card__price">{product.price.toLocaleString()} ₽</div>
                <div className="product-card__info">
                    <span className="product-card__stock">
                        📦 {product.stock > 0 ? `В наличии: ${product.stock}` : 'Нет в наличии'}
                    </span>
                    <span className="product-card__rating">
                        ⭐ {product.rating.toFixed(1)}
                    </span>
                </div>
                <div className="product-card__actions">
                    <button
                        className="btn btn--small"
                        onClick={() => onEdit(product)}
                    >
                        ✏️ Изменить
                    </button>
                    <button
                        className="btn btn--small btn--danger"
                        onClick={() => onDelete(product.id)}
                    >
                        🗑️ Удалить
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
