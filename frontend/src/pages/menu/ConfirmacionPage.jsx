import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { formatCLP } from '../../utils/formatCLP';
import { CheckCircle2, ChefHat, PackageCheck, CheckCircle } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';

const STATUS_MAP = {
  pending: { label: 'Esperando Pago', index: 0 },
  paid: { label: 'Pago Confirmado', index: 1 },
  confirmed: { label: 'Recibido', index: 1 }, // Same step logically for customer
  preparing: { label: 'En Preparación', index: 2 },
  ready: { label: 'Listo para Retirar', index: 3 },
  delivered: { label: 'Entregado', index: 4 },
  cancelled: { label: 'Cancelado', index: -1 }
};

const ConfirmacionPage = () => {
  const { venueSlug, orderId } = useParams();
  const { clearCart } = useCartStore();
  const [shouldPoll, setShouldPoll] = useState(true);

  // Clear cart upon successful payment
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const res = await api.get(`/orders/${orderId}/status`);
      return res.data;
    },
    refetchInterval: shouldPoll ? 4000 : false,
    refetchIntervalInBackground: true
  });

  useEffect(() => {
    if (order?.status === 'delivered' || order?.status === 'cancelled') {
      setShouldPoll(false);
    }
  }, [order?.status]);

  if (isLoading && !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="w-8 h-8 border-4 border-brand-red/30 border-t-brand-red rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#0A0A0A]">
        <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
        <p className="text-gray-400 mb-6">No se pudo cargar la información del pedido</p>
        <Link to={`/menu/${venueSlug}/no-table`} className="text-brand-red hover:underline">
          ← Volver
        </Link>
      </div>
    );
  }

  const currentStatusIndex = STATUS_MAP[order.status]?.index || 0;
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-10">
      
      <div className="bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] pt-12 pb-8 px-6 flex flex-col items-center text-center border-b border-white/5">
        {isCancelled ? (
          <div className="w-20 h-20 bg-red-900/40 text-red-500 rounded-full flex items-center justify-center mb-5 animate-scale-in">
             <span className="text-4xl">✕</span>
          </div>
        ) : (
          <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-5 animate-scale-in relative">
            <CheckCircle2 size={40} className="absolute z-10" />
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping-slow mix-blend-screen" />
          </div>
        )}
        
        <h1 className="text-2xl font-bold text-white mb-2">
          {isCancelled ? 'Pedido Cancelado' : '¡Pedido recibido!'}
        </h1>
        <p className="text-gray-400 font-medium">#{order.orderId.substring(0,8).toUpperCase()}</p>
        
        <div className="mt-4 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 text-sm text-gray-300">
          Mesa N°{order.tableNumber}
        </div>
      </div>

      <div className="px-5 mt-8 max-w-md mx-auto">
        {!isCancelled && (
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6 mb-6">
            <h3 className="text-white font-medium mb-5">Estado del Pedido</h3>
            
            <div className="relative pl-6 space-y-8">
              {/* Vertical line connecting steps */}
              <div className="absolute left-1.5 top-2 bottom-2 w-px bg-white/10" />
              
              <StepItem 
                active={currentStatusIndex >= 1} 
                current={currentStatusIndex === 1}
                icon={<CheckCircle size={16} />}
                label="Pago Confirmado"
              />
              <StepItem 
                active={currentStatusIndex >= 2} 
                current={currentStatusIndex === 2}
                icon={<ChefHat size={16} />}
                label="En Preparación"
              />
              <StepItem 
                active={currentStatusIndex >= 3} 
                current={currentStatusIndex === 3}
                icon={<PackageCheck size={16} />}
                label="Listo para Retirar / Entregar"
              />
              <StepItem 
                active={currentStatusIndex >= 4} 
                current={currentStatusIndex === 4}
                icon={<CheckCircle2 size={16} />}
                label="Entregado"
              />
            </div>
          </div>
        )}

        <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h3 className="text-white font-medium">Resumen</h3>
          </div>
          <div className="px-5 py-4 space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-sm">
                <div className="flex gap-3">
                  <span className="text-brand-red font-medium">{item.quantity}x</span>
                  <div>
                    <span className="text-gray-300 block">{item.item_name}</span>
                    {item.notes && <span className="text-gray-500 text-xs block mt-0.5">{item.notes}</span>}
                  </div>
                </div>
                <span className="text-gray-300">{formatCLP(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="p-5 bg-black/20 flex justify-between items-center border-t border-white/5">
            <span className="text-gray-400 font-medium">Total Pagado</span>
            <span className="text-white font-bold">{formatCLP(order.total)}</span>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }
        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes ping-slow {
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
      `}} />
    </div>
  );
};

const StepItem = ({ active, current, icon, label }) => {
  return (
    <div className={`relative flex items-center gap-4 ${active ? 'opacity-100' : 'opacity-40'}`}>
      <div className={`w-3 h-3 rounded-full absolute -left-[22px] border-2 transition-colors ${
        active 
          ? (current ? 'border-brand-red bg-brand-red ring-4 ring-brand-red/20' : 'border-green-500 bg-green-500') 
          : 'border-gray-600 bg-[#111]'
      }`} />
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
         active 
         ? (current ? 'bg-brand-red' : 'bg-green-500') 
         : 'bg-white/5 text-gray-500'
      }`}>
        {icon}
      </div>
      <span className={`text-sm font-medium ${current ? 'text-white' : 'text-gray-300'}`}>
        {label}
      </span>
    </div>
  );
};

export default ConfirmacionPage;
