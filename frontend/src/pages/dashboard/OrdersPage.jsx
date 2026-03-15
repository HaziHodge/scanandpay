import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { useSocket } from '../../hooks/useSocket';
import { formatCLP } from '../../utils/formatCLP';
import toast from 'react-hot-toast';

import OrderCard from '../../components/dashboard/OrderCard';
import OrderDetail from '../../components/dashboard/OrderDetail';

const TABS = [
  { id: 'all', label: 'Todos' },
  { id: 'paid', label: 'Nuevo' },
  { id: 'confirmed', label: 'Confirmado' },
  { id: 'preparing', label: 'En Preparación' },
  { id: 'ready', label: 'Listo' }
];

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const queryClient = useQueryClient();
  const socket = useSocket();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['dashboardOrders'],
    queryFn: async () => {
      const res = await api.get('/dashboard/orders');
      return res.data;
    }
  });

  // Socket listener
  useEffect(() => {
    if (!socket) return;

    socket.on('new_order', (order) => {
      // Play a beep
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
      } catch (e) {
         // ignore auto-play policies
      }
      
      toast.success(`NUEVO PEDIDO: Mesa N°${order.table_number}`, {
        duration: 8000,
        icon: '🔔'
      });

      queryClient.setQueryData(['dashboardOrders'], (old) => {
        if (!old) return [order];
        // add to top
        return [order, ...old.filter(o => o.id !== order.id)];
      });
    });

    socket.on('order_updated', ({ orderId, status }) => {
      queryClient.setQueryData(['dashboardOrders'], (old) => {
        if (!old) return old;
        return old.map(o => o.id === orderId ? { ...o, status, updated_at: new Date().toISOString() } : o);
      });
    });

    return () => {
      socket.off('new_order');
      socket.off('order_updated');
    };
  }, [socket, queryClient]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await api.patch(`/dashboard/orders/${id}/status`, { status });
      return res.data;
    },
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(['dashboardOrders'], (old) => {
        if (!old) return old;
        return old.map(o => o.id === updatedOrder.id ? { ...o, status: updatedOrder.status } : o);
      });
      if (selectedOrderId === updatedOrder.id && updatedOrder.status === 'delivered') {
         setSelectedOrderId(null);
      }
    },
    onError: () => {
      toast.error('Error al actualizar estado');
    }
  });

  const handleUpdateStatus = (id, newStatus) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(o => o.status === activeTab);

  const stats = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    acc['all'] = acc['all'] + 1;
    return acc;
  }, { all: 0, pending: 0, paid: 0, confirmed: 0, preparing: 0, ready: 0, delivered: 0, cancelled: 0 });

  return (
    <div className="h-full flex flex-col pt-[72px] sm:pt-0">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos en Vivo</h1>
          <p className="text-gray-500 text-sm mt-1">
            Recepción y gestión de órdenes al instante
          </p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex overflow-x-auto no-scrollbar mb-6 gap-2 pb-2">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
              activeTab === tab.id
                ? 'bg-brand-red text-white border-brand-red'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {stats[tab.id] || 0}
            </span>
          </button>
        ))}
      </div>

      <div className="flex-1 rounded-xl bg-gray-100/50 p-4 border border-gray-200 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-brand-red/30 border-t-brand-red rounded-full animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No hay pedidos en esta categoría
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onUpdateStatus={handleUpdateStatus}
                onClick={() => setSelectedOrderId(order.id)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedOrderId && (
        <OrderDetail 
          orderId={selectedOrderId} 
          onClose={() => setSelectedOrderId(null)} 
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};

export default OrdersPage;
