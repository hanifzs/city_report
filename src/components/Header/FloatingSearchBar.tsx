import React from 'react';
import { Search, X, LogIn, ShieldCheck, MapPin } from 'lucide-react';
import { CATEGORIES } from '../../types/incident';
import type { IncidentCategory, UserProfile } from '../../types/incident';

interface FloatingSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: IncidentCategory | 'all';
  onSelectCategory: (category: IncidentCategory | 'all') => void;
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
  totalIncidentsCount: number;
}

export const FloatingSearchBar: React.FC<FloatingSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  currentUser,
  onOpenAuthModal,
  totalIncidentsCount,
}) => {
  const categoryKeys = Object.keys(CATEGORIES) as IncidentCategory[];

  return (
    <div className="floating-top-container">
      {/* Main Search Bar */}
      <div className="floating-search-bar">
        {/* Brand */}
        <div className="search-brand">
          <div className="brand-dot" />
          <span className="brand-title">CityReport</span>
        </div>

        {/* Input */}
        <div className="search-input-wrapper">
          <Search size={16} color="#64748b" />
          <input
            type="text"
            className="search-input"
            placeholder="Cari jalan, area, atau gangguan..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              title="Hapus pencarian"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* User Auth indicator */}
        <button
          className="user-auth-btn"
          onClick={onOpenAuthModal}
          title={currentUser ? `Akun: ${currentUser.full_name}` : 'Login dengan Google'}
        >
          {currentUser ? (
            <>
              <img
                src={currentUser.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                alt={currentUser.full_name}
                className="user-avatar-img"
              />
              <ShieldCheck size={14} color="#10b981" />
            </>
          ) : (
            <div className="login-pill-badge">
              <LogIn size={13} />
              <span>Login</span>
            </div>
          )}
        </button>
      </div>

      {/* Category Filter Chips Bar */}
      <div className="category-filter-strip">
        <button
          className={`filter-chip ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => onSelectCategory('all')}
        >
          <MapPin size={13} />
          <span>Semua ({totalIncidentsCount})</span>
        </button>

        {categoryKeys.map((catKey) => {
          const cat = CATEGORIES[catKey];
          const isActive = selectedCategory === catKey;
          return (
            <button
              key={catKey}
              className={`filter-chip ${isActive ? 'active' : ''}`}
              style={{
                borderColor: isActive ? cat.color : undefined,
                backgroundColor: isActive ? cat.color : undefined,
              }}
              onClick={() => onSelectCategory(catKey)}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: isActive ? '#fff' : cat.color,
                }}
              />
              <span>{cat.label.split(' / ')[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
