import React from 'react';
import { formatCLP } from '../../../utils/formatCLP';
import { useCartStore } from '../../../store/cartStore';
import { Plus, Minus } from 'lucide-react';

const ItemCard = ({ item }) => {
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  
  const cartItem = items.find(i => i.id === item.id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => addItem(item);
  
  const handleIncrease = () => updateQuantity(item.id, 1);
  const handleDecrease = () => {
    if (qtyInCart === 1) {
      removeItem(item.id);
    } else {
      updateQuantity(item.id, -1);
    }
  };

  return (
    <div className={`flex flex-col bg-brand-card rounded-xl overflow-hidden border border-white/5 transition-opacity ${!item.available ? 'opacity-50' : 'opacity-100'}`}>
      <div className="relative aspect-video w-full bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A]">
        {item.image_url && (
          <img 
            src={item.image_url} 
            alt={item.name} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
        {!item.available && (
          <div className="absolute top-2 right-2 bg-black/70 text-gray-300 text-xs font-semibold px-2 py-1 rounded">
            Agotado
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-white font-semibold text-base mb-1">{item.name}</h3>
        {item.description && (
          <p className="text-gray-400 text-sm line-clamp-2 mb-3 flex-1">{item.description}</p>
        )}
        
        <div className="flex items-end justify-between mt-auto pt-2">
          <span className="text-white font-bold text-lg">{formatCLP(item.price)}</span>
          
          {item.available && (
            qtyInCart > 0 ? (
              <div className="flex items-center space-x-3 bg-[#2A2A2A] rounded-full p-1">
                <button 
                  onClick={handleDecrease}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="text-white font-medium text-sm min-w-[12px] text-center">{qtyInCart}</span>
                <button 
                  onClick={handleIncrease}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-brand-red text-white hover:bg-red-600 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleAdd}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-red text-white hover:bg-red-600 transition-colors"
              >
                <Plus size={16} />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
