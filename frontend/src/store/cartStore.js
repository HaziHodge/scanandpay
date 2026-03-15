import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  venue: null,
  tableId: null,
  items: [],
  
  initCart: (venue, tableId) => {
    const currentQueue = get();
    if (currentQueue.venue?.id !== venue.id || currentQueue.tableId !== tableId) {
      set({ venue, tableId, items: [] });
    }
  },

  addItem: (product) => set((state) => {
    const existingIndex = state.items.findIndex(i => i.id === product.id);
    if (existingIndex > -1) {
      const updated = [...state.items];
      updated[existingIndex].quantity += 1;
      return { items: updated };
    }
    return { items: [...state.items, { ...product, quantity: 1, notes: '' }] };
  }),

  removeItem: (id) => set((state) => ({
    items: state.items.filter(i => i.id !== id)
  })),

  updateQuantity: (id, change) => set((state) => {
    return {
      items: state.items.map(item => {
        if (item.id === id) {
          const newQ = item.quantity + change;
          return { ...item, quantity: Math.max(0, newQ) }; // Allows removing if <1 handled in UI
        }
        return item;
      }).filter(item => item.quantity > 0)
    }
  }),

  updateNotes: (id, notes) => set((state) => ({
    items: state.items.map(item => item.id === id ? { ...item, notes } : item)
  })),

  clearCart: () => set({ items: [] }),

  getTotal: () => {
    return get().items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  },

  getTotalItems: () => {
    return get().items.reduce((acc, item) => acc + item.quantity, 0);
  }
}));
