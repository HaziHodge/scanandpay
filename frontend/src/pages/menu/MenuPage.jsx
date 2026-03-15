import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import { formatCLP } from '../../utils/formatCLP';
import { ShoppingBag } from 'lucide-react';

import CategoryTabs from '../../components/menu/CategoryTabs';
import ItemCard from '../../components/menu/ItemCard';
import CartDrawer from '../../components/menu/CartDrawer';
import toast from 'react-hot-toast';

const MenuPage = () => {
  const { venueSlug, tableId } = useParams();
  const { initCart, getTotalItems, getTotal } = useCartStore();
  const [activeCategory, setActiveCategory] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const scrollContainerRef = useRef(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['menu', venueSlug, tableId],
    queryFn: async () => {
      const res = await api.get(`/menu/${venueSlug}/table/${tableId}`);
      return res.data;
    }
  });

  useEffect(() => {
    if (data?.venue) {
      initCart(data.venue, tableId);
      if (data.categories.length > 0) {
        setActiveCategory(data.categories[0].id);
      }
    }
  }, [data, initCart, tableId]);

  // Intersection Observer to update active tab based on scroll
  useEffect(() => {
    if (!data?.categories.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);
          }
        });
      },
      { rootMargin: '-120px 0px -60% 0px' }
    );

    const elements = document.querySelectorAll('.category-section');
    elements.forEach((el) => observer.observe(el));

    return () => elements.forEach((el) => observer.unobserve(el));
  }, [data]);

  const scrollToCategory = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-red/30 border-t-brand-red rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
        <p className="text-gray-400">{error?.response?.data?.message || 'No se pudo cargar el menú'}</p>
      </div>
    );
  }

  const { venue, categories, tableNumber } = data;
  const totalItems = getTotalItems();

  return (
    <div className="min-h-screen pb-24" ref={scrollContainerRef}>
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/80 backdrop-blur-lg border-b border-white/5 px-4 h-[72px] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {venue.logo_url ? (
            <img src={venue.logo_url} alt={venue.name} className="w-10 h-10 rounded-full object-cover bg-[#1A1A1A]" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand-red flex items-center justify-center text-white font-bold text-lg">
              {venue.name.charAt(0)}
            </div>
          )}
          <h1 className="text-white font-bold text-lg truncate max-w-[160px]">{venue.name}</h1>
        </div>
        
        <div className="bg-[#1A1A1A] px-3 py-1.5 rounded-full border border-white/10 text-sm font-medium text-gray-200">
          Mesa N°{tableNumber}
        </div>
      </header>

      <CategoryTabs 
        categories={categories} 
        activeCategory={activeCategory} 
        onTabClick={scrollToCategory} 
      />

      <main className="px-4 py-6 space-y-10">
        {categories.map((category) => (
          <section key={category.id} id={category.id} className="category-section scroll-mt-[130px]">
            <h2 className="text-gray-400 text-sm font-bold tracking-[2px] uppercase mb-4">
              {category.name}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {category.items.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
              {category.items.length === 0 && (
                <div className="text-gray-500 text-sm italic">Sin ítems en esta categoría</div>
              )}
            </div>
          </section>
        ))}
      </main>

      {/* FLOATING CART BUTTON */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-40 flex justify-center animate-bounce-in">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="bg-brand-red text-white px-7 py-4 rounded-full font-semibold shadow-lg shadow-brand-red/30 flex items-center gap-3 active:scale-95 transition-transform"
          >
            <div className="relative">
              <ShoppingBag size={20} />
              <div className="absolute -top-2 -right-2 bg-white text-brand-red text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </div>
            </div>
            <span>Ver pedido · {formatCLP(getTotal())}</span>
          </button>
        </div>
      )}

      {isCartOpen && (
        <CartDrawer 
          venueSlug={venueSlug}
          tableId={tableId}
          onClose={() => setIsCartOpen(false)}
        />
      )}

      {/* Bounce-in animation class */}
      <style dangerouslySetInnerHTML={{__html: `
        .animate-bounce-in {
          animation: bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }
        @keyframes bounce-in {
          0% { transform: translateY(100px) scale(0.9); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes slide-up {
          0% { transform: translateY(100%); }
          100% { transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

export default MenuPage;
