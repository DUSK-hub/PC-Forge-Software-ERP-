import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from './Auth';
import { Package, ShoppingCart, LayoutDashboard, LogOut, Cpu } from 'lucide-react';

export default function Layout() {
  const { user, logOut } = useAuth();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1 ${
      isActive 
        ? 'bg-blue-50 text-blue-600' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
    }`;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans text-gray-900">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-[240px] bg-white border-r border-gray-200 flex flex-col p-6">
        <div className="mb-10 flex items-center gap-2 text-blue-600 font-extrabold text-[20px] tracking-tight">
          PC FORGE
        </div>

        <nav className="flex-1 space-y-0">
          <NavLink to="/" className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/products" className={navLinkClass}>
            Inventory
          </NavLink>
          <NavLink to="/orders" className={navLinkClass}>
            Orders
          </NavLink>
        </nav>

        <div className="mt-auto p-4 bg-gray-50 rounded-xl">
          <p className="text-[11px] text-gray-500 font-semibold mb-1 uppercase">System Status</p>
          <p className="text-xs font-medium">Syncing Active</p>
        </div>
        
        <div className="mt-4 border-t border-gray-100 pt-4 flex items-center justify-between">
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-gray-900 truncate">{user?.displayName}</span>
            <span className="text-xs text-gray-500 truncate">{user?.email}</span>
          </div>
          <button 
            onClick={logOut}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 flex flex-col gap-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
