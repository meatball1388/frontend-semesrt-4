import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const { user } = useAuth();

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  return (
    <div>
      <h2>Catalog</h2>
      <div className="product-grid">
        {products.map((p) => (
          <div key={p.id} className="product-card">
            <img 
              src={p.image || 'https://via.placeholder.com/200'} 
              alt={p.title} 
              style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/200'; }}
            />
            <h3>{p.title}</h3>
            <p className="category">{p.category}</p>
            <p className="price"><strong>{p.price.toLocaleString()} $</strong></p>
            <div className="info-row">
              <span>Stock: {p.stock}</span>
              <span>Rating: {p.rating} ⭐</span>
            </div>
            <div className="actions">
              <Link to={`/products/${p.id}`}>Details</Link>
              {user && (user.role === 'seller' || user.role === 'admin') && (
                <Link to={`/products/edit/${p.id}`} className="edit-btn">Edit</Link>
              )}
              {user && user.role === 'admin' && (
                <button onClick={() => handleDelete(p.id)} className="delete-btn">Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
