import React, { useState } from 'react';
import { useCartStore } from '../../../store/cartStore';
import { formatCLP } from '../../../utils/formatCLP';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const CartDrawer = ({ venueSlug, tableId, onClose }) => {
  const { items, getTotal, removeItem, updateQuantity, updateNotes } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePay = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        venueSlug,
        tableId,
        items: items.map(i => ({
          menuItemId: i.id,
          quantity: i.quantity,
          notes: i.notes
        }))
      };
      
      const res = await api.post('/orders', payload);
      // Redirect to flow payment URL
      window.location.href = res.data.paymentUrl;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al procesar el pedido');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-none">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity"
        onClick={onClose}
      />
      
      <div className="bg-[#111] w-full max-h-[90vh] rounded-t-2xl flex flex-col pointer-events-auto relative shadow-2xl safe-m-bottom animate-slide-up pb-8">
        
        {/* Handle bar */}
        <div className="w-full flex justify-center pt-3 pb-2 cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
        </div>

        <div className="px-5 pb-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Tu pedido</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-full bg-white/5">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-6">
          {items.map(item => (
            <div key={item.id} className="flex flex-col gap-2">
              <div className="flex justify-between items-start gap-3">
                
                <div className="flex-1">
                  <h4 className="text-white font-medium">{item.name}</h4>
                  <div className="text-gray-400 text-sm mt-0.5">{formatCLP(item.price)}</div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-white font-medium min-w-[60px] text-right">
                    {formatCLP(item.price * item.quantity)}
                  </span>
                  
                  <div className="flex items-center bg-[#222] rounded-full p-1 border border-white/5">
                    <button 
                      onClick={() => item.quantity === 1 ? removeItem(item.id) : updateQuantity(item.id, -1)}
                      className="w-7 h-7 flex items-center justify-center rounded-full text-gray-300 hover:bg-white/10"
                    >
                      {item.quantity === 1 ? <Trash2 size={14} className="text-red-400" /> : <Minus size={14} />}
                    </button>
                    <span className="text-white text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-full text-white hover:bg-white/10"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

              </div>

              <input 
                type="text"
                placeholder="Alguna indicación... sin sal, etc."
                value={item.notes}
                onChange={(e) => updateNotes(item.id, e.target.value)}
                className="w-full bg-[#1A1A1A] border border-white/5 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              Tu pedido está vacío
            </div>
          )}
        </div>

        <div className="p-5 bg-[#0a0a0a] border-t border-white/10 mt-auto">
          <div className="flex justify-between items-center mb-5">
            <span className="text-gray-300 font-medium text-lg">Total</span>
            <span className="text-white font-bold text-2xl">{formatCLP(getTotal())}</span>
          </div>

          <button 
            onClick={handlePay}
            disabled={items.length === 0 || isSubmitting}
            className="w-full bg-brand-red text-white py-4 rounded-xl font-semibold text-lg hover:bg-red-600 active:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-brand-red/20"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            Pagar con WebPay →
          </button>
        </div>

      </div>
    </div>
  );
};

export default CartDrawer;
