import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search } from 'lucide-react';

export const Header = () => {
  const { user } = useAuth();

  return (
    <div className="header bg-white px-12 py-3" data-testid="app-header">
      <div className="flex items-center justify-between gap-12 mt-3">
        <div className="flex-1 max-w-3xl">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search across all modules..."
              data-testid="global-search"
              className="w-full pl-14 pr-6 py-3.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-8">
          <button
            data-testid="notifications-button"
            className="p-3.5 hover:bg-neutral-100 rounded-lg transition-colors duration-200 relative"
          >
            <Bell className="w-6 h-6 text-neutral-600" strokeWidth={2} />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-teal-500 rounded-full animate-pulse"></span>
          </button>

          <div className="flex items-center gap-5 pl-8 border-l-2 border-neutral-200">
            <div className="text-right">
              <p className="text-base font-bold text-neutral-900">{user?.name}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{user?.role}</p>
            </div>
            <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center text-neutral-700 font-bold text-lg shadow-sm border-2 border-neutral-300">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
