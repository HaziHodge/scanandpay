import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { formatCLP } from '../../utils/formatCLP';
import { DollarSign, ShoppingBag, Receipt, Trophy } from 'lucide-react';

import StatsCard from '../../components/dashboard/StatsCard';
import OrdersChart from '../../components/dashboard/OrdersChart';

const StatsPage = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats');
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-red/30 border-t-brand-red rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="max-w-6xl mx-auto h-full pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Estadísticas</h1>
        <p className="text-gray-500 text-sm mt-1">Visión general de tu local</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard 
          title="Pedidos Hoy" 
          value={stats.ordersToday} 
          icon={<ShoppingBag size={24} />} 
        />
        <StatsCard 
          title="Ingresos Hoy" 
          value={formatCLP(stats.revenueToday)} 
          icon={<DollarSign size={24} />} 
        />
        <StatsCard 
          title="Ticket Promedio" 
          value={formatCLP(stats.avgTicket)} 
          icon={<Receipt size={24} />} 
        />
        <StatsCard 
          title="Ítem Más Pedido" 
          value={stats.topItems[0]?.name || '-'} 
          secondary={stats.topItems[0] ? `${stats.topItems[0].quantity} unid.` : ''}
          icon={<Trophy size={24} />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OrdersChart data={stats.ordersByHour} />
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-base font-bold text-gray-900 mb-4">Top 5 Ítems (7 días)</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
                <tr>
                  <th className="px-3 py-2 rounded-l-lg">Pos</th>
                  <th className="px-3 py-2">Ítem</th>
                  <th className="px-3 py-2 rounded-r-lg text-right">Cant</th>
                </tr>
              </thead>
              <tbody>
                {stats.topItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-3 py-3 font-medium text-gray-900">{idx + 1}</td>
                    <td className="px-3 py-3 text-gray-700">{item.name}</td>
                    <td className="px-3 py-3 text-right font-bold text-gray-900">{item.quantity}</td>
                  </tr>
                ))}
                {stats.topItems.length === 0 && (
                 <tr>
                   <td colSpan="3" className="px-3 py-6 text-center text-gray-500 italic">No hay datos suficientes.</td>
                 </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
