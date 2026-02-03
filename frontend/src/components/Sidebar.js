import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  CreditCard,
  Boxes,
  Truck,
  FileText,
  BarChart3,
  Users,
  LogOut,
} from 'lucide-react';

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['Admin', 'Purchase', 'Approver', 'Accounts', 'Stores', 'Logistics', 'Sales'] },
    { path: '/purchase-orders', icon: ShoppingCart, label: 'Purchase Orders', roles: ['Admin', 'Purchase', 'Approver'] },
    { path: '/payments', icon: CreditCard, label: 'Payments', roles: ['Admin', 'Accounts'] },
    { path: '/procurement', icon: Package, label: 'Procurement', roles: ['Admin', 'Stores'] },
    { path: '/logistics', icon: Truck, label: 'Logistics', roles: ['Admin', 'Logistics'] },
    { path: '/inventory', icon: Boxes, label: 'Inventory', roles: ['Admin', 'Stores', 'Logistics'] },
    { path: '/invoices', icon: FileText, label: 'Invoices', roles: ['Admin', 'Accounts'] },
    { path: '/reports', icon: BarChart3, label: 'Reports', roles: ['Admin', 'Approver'] },
    { path: '/users', icon: Users, label: 'Users', roles: ['Admin'] },
  ];

  const filteredMenu = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <div className="sidebar" data-testid="sidebar">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-black text-white tracking-tight">
          MAGNOVA-NOVA
        </h1>
        <p className="text-xs text-slate-400 mt-1">ERP System</p>
      </div>

      <div className="p-4">
        <div className="mb-4 p-3 bg-slate-800 rounded-md">
          <p className="text-xs text-slate-400">Logged in as</p>
          <p className="text-sm font-medium text-white mt-1">{user?.name}</p>
          <p className="text-xs text-slate-400">{user?.organization}</p>
          <p className="text-xs text-blue-400">{user?.role}</p>
        </div>

        <nav className="space-y-1">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                className={`nav-item flex items-center px-3 py-2.5 rounded-md text-sm ${
                  isActive
                    ? 'active text-white bg-blue-600/20'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 mr-3" strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          data-testid="logout-button"
          className="flex items-center w-full px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-all duration-200"
        >
          <LogOut className="w-4 h-4 mr-3" strokeWidth={1.5} />
          Logout
        </button>
      </div>
    </div>
  );
};
