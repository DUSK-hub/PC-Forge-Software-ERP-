import React, { useState } from 'react';
import { useProducts, addProduct, updateProduct, deleteProduct } from '../lib/data';
import { Plus, Edit2, Trash2, X, PlusCircle, Package, Search } from 'lucide-react';
import { Product } from '../lib/types';

export default function Products() {
  const { products, loading } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: 0,
    quantity: 0
  });

  const categoryOptions = ["CPU", "GPU", "RAM", "Motherboard", "Storage", "Power Supply", "Case", "Cooling", "Peripherals"];

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ name: product.name, category: product.category, price: product.price, quantity: product.quantity });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', category: categoryOptions[0], price: 0, quantity: 0 });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
      } else {
        await addProduct(formData);
      }
      closeModal();
    } catch (err: any) {
      alert("Error saving product: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
      } catch (err: any) {
        alert("Delete failed: " + err.message);
      }
    }
  };

  if (loading) return <div className="text-gray-500">Loading products...</div>;

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-[24px] font-bold tracking-[-0.5px]">Inventory Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track your PC components</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            />
          </div>
          <button 
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shrink-0 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </header>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                <th className="p-3 px-5 font-medium">Part Name</th>
                <th className="p-3 px-5 font-medium">Category</th>
                <th className="p-3 px-5 font-medium">Price</th>
                <th className="p-3 px-5 font-medium">Stock</th>
                <th className="p-3 px-5 font-medium">Status</th>
                <th className="p-3 px-5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                     <div className="flex flex-col items-center justify-center">
                       <Package className="w-12 h-12 text-gray-300 mb-3" />
                       <p>{searchQuery ? 'No products match your search.' : 'Inventory is empty. Add some products.'}</p>
                     </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 px-5 text-gray-900">{product.name}</td>
                    <td className="p-3 px-5 text-gray-600">{product.category}</td>
                    <td className="p-3 px-5 text-gray-900">${product.price.toFixed(2)}</td>
                    <td className="p-3 px-5 text-gray-900">{product.quantity}</td>
                    <td className="p-3 px-5">
                      {product.quantity === 0 ? (
                        <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-[11px] font-semibold">Out of Stock</span>
                      ) : product.quantity < 5 ? (
                        <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-[11px] font-semibold">Low Stock</span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[11px] font-semibold">In Stock</span>
                      )}
                    </td>
                    <td className="p-3 px-5 text-right flex items-center justify-end gap-2">
                      <button onClick={() => openModal(product)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-md transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add / Edit (Instead of using dialog, we create an overlay) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  maxLength={100}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})} 
                >
                  {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    step="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                    value={formData.quantity} 
                    onChange={e => setFormData({...formData, quantity: parseInt(e.target.value, 10) || 0})} 
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


