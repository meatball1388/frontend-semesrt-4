import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    stock: '',
    rating: '',
    image: '',
  });

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const { data } = await api.get(`/products/${id}`);
          setFormData({
            title: data.title || '',
            category: data.category || '',
            description: data.description || '',
            price: data.price || '',
            stock: data.stock || '',
            rating: data.rating || '',
            image: data.image || '',
          });
        } catch (err) {
          alert('Failed to fetch product');
        }
      };
      fetchProduct();
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await api.put(`/products/${id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      navigate('/');
    } catch (err) {
      alert('Operation failed');
    }
  };

  return (
    <div className="form-container">
      <h2>{id ? 'Edit Product' : 'New Product'}</h2>
      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <input name="title" value={formData.title} placeholder="iPhone 15" onChange={handleChange} required />
        
        <label>Category</label>
        <input name="category" value={formData.category} placeholder="Electronics" onChange={handleChange} required />
        
        <label>Description</label>
        <textarea name="description" value={formData.description} placeholder="Product description..." onChange={handleChange} />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label>Price ($)</label>
            <input name="price" type="number" value={formData.price} placeholder="999" onChange={handleChange} required />
          </div>
          <div>
            <label>Stock</label>
            <input name="stock" type="number" value={formData.stock} placeholder="10" onChange={handleChange} required />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label>Rating (0-5)</label>
            <input name="rating" type="number" step="0.1" value={formData.rating} placeholder="4.5" onChange={handleChange} />
          </div>
          <div>
            <label>Image URL</label>
            <input name="image" value={formData.image} placeholder="/img/iphone.jpg" onChange={handleChange} />
          </div>
        </div>

        <button type="submit" className="save-btn">Save Product</button>
      </form>
    </div>
  );
};

export default ProductForm;
