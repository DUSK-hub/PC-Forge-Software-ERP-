import React from 'react';
import { Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { useProducts, useOrders } from '../lib/data';

export default function Dashboard() {
  const { products, loading: pLoading } = useProducts();
  const { orders, loading: oLoading } = useOrders();

  if (pLoading || oLoading) {
    return <div className="text-gray-500">Loading dashboard...</div>;
  }

  const lowStockCount = products.filter(p => p.quantity < 5).length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

  const stats = [
    { label: 'Total Products', value: products.length, icon: Package, color: 'bg-blue-500' },
    { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'bg-green-500' },
    { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'bg-emerald-500' },
    { label: 'Low Stock Alerts', value: lowStockCount, icon: TrendingUp, color: 'bg-red-500' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <header className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-[24px] font-bold tracking-[-0.5px]">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time inventory and sales summary</p>
        </div>
      </header>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2 font-medium">{stat.label}</div>
            <div className="text-[24px] font-bold text-gray-900">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 min-h-0 items-start">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden lg:col-span-3">
          <div className="p-4 px-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-[15px] font-semibold text-gray-900">Recent Inventory Updates</h2>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="bg-gray-50 text-gray-500 font-medium">
                  <th className="p-3 px-5 border-b border-gray-200 font-medium w-1/3">Part Name</th>
                  <th className="p-3 px-5 border-b border-gray-200 font-medium">Category</th>
                  <th className="p-3 px-5 border-b border-gray-200 font-medium">Price</th>
                  <th className="p-3 px-5 border-b border-gray-200 font-medium">Stock</th>
                  <th className="p-3 px-5 border-b border-gray-200 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={5} className="p-5 text-gray-500 text-center">No inventory.</td></tr>
                ) : (
                  products.slice(0,5).map(product => (
                    <tr key={product.id}>
                      <td className="p-3 px-5 border-b border-gray-200 text-gray-900">{product.name}</td>
                      <td className="p-3 px-5 border-b border-gray-200 text-gray-600">{product.category}</td>
                      <td className="p-3 px-5 border-b border-gray-200 text-gray-900">${product.price.toFixed(2)}</td>
                      <td className="p-3 px-5 border-b border-gray-200 text-gray-900">{product.quantity}</td>
                      <td className="p-3 px-5 border-b border-gray-200">
                        {product.quantity === 0 ? (
                          <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-[11px] font-semibold">Out of Stock</span>
                        ) : product.quantity < 5 ? (
                          <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-[11px] font-semibold">Low Stock</span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[11px] font-semibold">In Stock</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden lg:col-span-2">
          <div className="p-4 px-5 border-b border-gray-200">
            <h2 className="text-[15px] font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <div className="flex flex-col">
            {orders.length === 0 ? (
              <div className="p-5 text-gray-500 text-center text-sm">No orders.</div>
            ) : (
              orders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center gap-3 p-3 px-5 border-b border-gray-200 last:border-0">
                  <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-sm text-gray-500 font-medium">#</div>
                  <div className="flex-1">
                    <div className="font-semibold text-[13px] text-gray-900">ORD-{order.id.slice(0, 4).toUpperCase()}</div>
                    <div className="text-[11px] text-gray-500">{new Date(order.date).toLocaleDateString()} • {order.items.reduce((s, i) => s + i.quantity, 0)} Items</div>
                  </div>
                  <div className="font-bold text-[13px] text-gray-900">${order.totalPrice.toFixed(2)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
