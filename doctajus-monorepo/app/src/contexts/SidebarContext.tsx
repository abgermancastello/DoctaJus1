import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Definir la estructura de un ítem del menú para favoritos
export interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  favorites: MenuItem[];
  addToFavorites: (item: MenuItem) => void;
  removeFromFavorites: (key: string) => void;
  isFavorite: (key: string) => boolean;
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [favorites, setFavorites] = useState<MenuItem[]>(() => {
    // Obtener favoritos guardados en localStorage al iniciar
    const savedFavorites = localStorage.getItem('doctajus-favorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Guardar favoritos en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem('doctajus-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const addToFavorites = (item: MenuItem) => {
    // Solo añadir si no existe ya
    if (!favorites.some(fav => fav.key === item.key)) {
      setFavorites([...favorites, item]);
    }
  };

  const removeFromFavorites = (key: string) => {
    setFavorites(favorites.filter(item => item.key !== key));
  };

  const isFavorite = (key: string) => {
    return favorites.some(item => item.key === key);
  };

  return (
    <SidebarContext.Provider value={{
      collapsed,
      setCollapsed,
      toggleCollapsed,
      favorites,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      activeCategory,
      setActiveCategory
    }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
