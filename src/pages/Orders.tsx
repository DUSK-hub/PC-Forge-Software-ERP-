import React, { useState } from 'react';
import { useOrders, useProducts, placeOrder } from '../lib/data';
import { Plus, X, ShoppingBag } from 'lucide-react';
import { Product } from '../lib/types';

export default function Orders() {
  const { orders, loading: oLoading } = useOrders();
  const { products, loading: pLoading } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Create Order Form State
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const availableProducts = products.filter(p => !cart.find(c => c.product.id === p.id) && p.quantity > 0);

  const handleAddToCart = () => {
    setError(null);
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;
    
    if (quantity <= 0) {
      setError("Quantity must be at least 1.");
      return;
    }

    if (quantity > product.quantity) {
      setError(`Insufficient stock. Only ${product.quantity} units of "${product.name}" available.`);
      return;
    }

    setCart([...cart, { product, quantity }]);
    setSelectedProductId('');
    setQuantity(1);
    setError(null);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    
    setPlacingOrder(true);
    try {
      const orderItems = cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price, // Lock in price at time of order
      }));

      // create a faster lookup dict
      const productsDict = products.reduce((acc, p) => ({ ...acc, [p.id]: p }), {} as Record<string, Product>);

      await placeOrder(orderItems, productsDict);
      setIsModalOpen(false);
      setCart([]);
    } catch (err: any) {
      alert("Failed to place order: " + err.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (pLoading || oLoading) return <div className="text-gray-500">Loading orders...</div>;

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <header className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-[24px] font-bold tracking-[-0.5px]">Orders List</h1>
          <p className="text-sm text-gray-500 mt-1">Review active orders and create new ones</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Order
        </button>
      </header>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
        <div className="flex flex-col w-full">
          {orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
               <ShoppingBag className="w-12 h-12 text-gray-300 mb-3" />
               <p>No orders yet. Place an order to get started.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="flex items-center gap-3 p-3 px-5 border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-sm text-gray-500 font-medium shrink-0">#</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[13px] text-gray-900 truncate">ORD-{order.id.slice(0, 8).toUpperCase()}</div>
                  <div className="text-[11px] text-gray-500 truncate">{new Date(order.date).toLocaleDateString()} • {order.items.reduce((s, i) => s + i.quantity, 0)} Items ({order.items.map(i => i.name).join(', ')})</div>
                </div>
                <div className="font-bold text-[13px] text-gray-900 whitespace-nowrap pl-4">
                  ${order.totalPrice.toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-semibold text-gray-900">Create New Order</h2>
              <button disabled={placingOrder} onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                  <X className="w-4 h-4 cursor-pointer" onClick={() => setError(null)} />
                  {error}
                </div>
              )}

              {/* Product Selection */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Product</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={selectedProductId}
                    onChange={(e) => {
                      setSelectedProductId(e.target.value);
                      setError(null);
                    }}
                  >
                    <option value="">-- Choose a product --</option>
                    {availableProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - ${p.price} ({p.quantity} in stock)</option>
                    ))}
                  </select>
                </div>
                <div className="w-full md:w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input 
                    type="number" 
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={quantity} 
                    onChange={e => setQuantity(parseInt(e.target.value, 10) || 1)} 
                  />
                </div>
                <button 
                  onClick={handleAddToCart}
                  disabled={!selectedProductId}
                  className="w-full md:w-auto px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
                >
                  Add
                </button>
              </div>

              {/* Cart Review */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Order Items</h3>
                <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                  {cart.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">Cart is empty. Add products above.</div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between p-4 bg-white hover:bg-gray-50">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-sm text-gray-500">{item.quantity} units @ ${item.product.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-medium text-gray-900">${(item.quantity * item.product.price).toFixed(2)}</span>
                          <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:text-red-700">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer with totals */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)}
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  disabled={placingOrder}
                  className="px-6 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePlaceOrder}
                  disabled={cart.length === 0 || placingOrder}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition flex items-center gap-2"
                >
                  {placingOrder ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
