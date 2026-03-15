import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { formatCLP } from '../../../utils/formatCLP';
import { X, ExternalLink, AlertTriangle } from 'lucide-react';

const NEXT_ACTION = {
  paid: { label: 'Confirmar Pedido', next: 'confirmed', style: 'bg-blue-600 hover:bg-blue-700 text-white' },
  confirmed: { label: 'A Preparación', next: 'preparing', style: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
  preparing: { label: 'Listo para Retiro', next: 'ready', style: 'bg-orange-600 hover:bg-orange-700 text-white' },
  ready: { label: 'Entregado', next: 'delivered', style: 'bg-green-600 hover:bg-green-700 text-white' },
};

const OrderDetail = ({ orderId, onClose, onUpdateStatus }) => {
  const { data: order, isLoading } = useQuery({
    queryKey: ['orderDetail', orderId],
    queryFn: async () => {
      const res = await api.get(`/dashboard/orders/${orderId}`);
      return res.data;
    }
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-end sm:justify-center p-0 sm:p-4 pointer-events-none">
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm pointer-events-auto transition-opacity"
        onClick={onClose}
      />
      
      {/* Mobile: slide up, Desktop: centered modal */}
      <div className="bg-white w-full sm:w-[500px] sm:max-w-lg h-[90vh] sm:h-auto max-h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-2xl pointer-events-auto flex flex-col relative animate-slide-up sm:animate-in sm:zoom-in-95 mt-auto sm:mt-0">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
             <div className="bg-gray-900 text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg">
              {order?.table_number || '-'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Pedido #{orderId.substring(0,6).toUpperCase()}
              </h2>
              <span className="text-gray-500 text-xs">
                Mesa N°{order?.table_number}
              </span>
            </div>
          </div>
          
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading || !order ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-brand-red/30 border-t-brand-red rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                  Ítems del Pedido
                </h3>
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded bg-gray-100 text-gray-700 font-bold flex items-center justify-center shrink-0">
                        {item.quantity}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-gray-900">{item.item_name}</span>
                          <span className="font-semibold text-gray-700 ml-4">{formatCLP(item.subtotal)}</span>
                        </div>
                        {item.notes && (
                          <div className="mt-1.5 p-2.5 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-100 inline-flex gap-2">
                            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                            <span>{item.notes}</span>
                          </div>
                        )}
                        <span className="text-xs text-gray-400 block mt-1">{formatCLP(item.unit_price)} c/u</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        {order && (
          <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <div className="flex justify-between items-center mb-5">
              <span className="text-gray-600 font-semibold">Total</span>
              <span className="text-2xl font-bold text-gray-900">{formatCLP(order.total)}</span>
            </div>
            
            <div className="flex flex-col gap-3">
              {NEXT_ACTION[order.status] && (
                <button 
                  onClick={() => {
                    onUpdateStatus(order.id, NEXT_ACTION[order.status].next);
                  }}
                  className={`w-full py-3 rounded-xl font-bold transition-all shadow-sm ${NEXT_ACTION[order.status].style}`}
                >
                  {NEXT_ACTION[order.status].label}
                </button>
              )}

              {['paid', 'confirmed', 'preparing'].includes(order.status) && (
                <button 
                  onClick={() => {
                     if (confirm('¿Estás seguro de cancelar este pedido?')) {
                       onUpdateStatus(order.id, 'cancelled');
                       onClose();
                     }
                  }}
                  className="w-full py-2.5 text-red-600 font-medium hover:bg-red-50 rounded-xl transition-colors"
                >
                  Cancelar Pedido
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OrderDetail;
