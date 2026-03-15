import React from 'react';
import { formatCLP } from '../../utils/formatCLP';
import { Clock } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  paid: { label: 'Nuevo', color: 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse' },
  confirmed: { label: 'Confirmado', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  preparing: { label: 'En Prep.', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  ready: { label: 'Listo', color: 'bg-green-100 text-green-800 border-green-200' },
  delivered: { label: 'Entregado', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-200' },
};

const NEXT_ACTION = {
  paid: { label: 'Confirmar Pedido', next: 'confirmed', style: 'bg-blue-600 hover:bg-blue-700 text-white' },
  confirmed: { label: 'Marcar Preparando', next: 'preparing', style: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
  preparing: { label: 'Marcar Listo', next: 'ready', style: 'bg-orange-600 hover:bg-orange-700 text-white' },
  ready: { label: 'Marcar Entregado', next: 'delivered', style: 'bg-green-600 hover:bg-green-700 text-white' },
};

const formatTimeAgo = (dateStr) => {
  const diff = Math.floor((new Date() - new Date(dateStr)) / 60000); // in mins
  if (diff < 1) return 'ahora';
  if (diff < 60) return `hace ${diff}m`;
  return `hace ${Math.floor(diff/60)}h`;
};

const OrderCard = ({ order, onUpdateStatus, onClick }) => {
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const action = NEXT_ACTION[order.status];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden hover:shadow-md transition-shadow relative z-10 animate-slide-up">
      <div 
        className="p-4 flex-1 cursor-pointer"
        onClick={onClick}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="bg-gray-900 text-white w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl shadow-sm">
            {order.table_number}
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${config.color}`}>
              {config.label}
            </span>
            <span className="text-gray-400 text-xs flex items-center gap-1 font-medium">
              <Clock size={12} />
              {formatTimeAgo(order.created_at)}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Resumen</h3>
          <div className="text-gray-900 font-bold text-xl">
            {formatCLP(order.total)}
          </div>
        </div>
      </div>

      {action && (
        <div className="p-3 bg-gray-50 border-t border-gray-100">
          <button 
            onClick={(e) => { e.stopPropagation(); onUpdateStatus(order.id, action.next); }}
            className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm ${action.style}`}
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
