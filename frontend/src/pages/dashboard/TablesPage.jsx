import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, ListPlus } from 'lucide-react';

import QRCard from '../../components/dashboard/QRCard';

const TablesPage = () => {
  const queryClient = useQueryClient();
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [bulkCount, setBulkCount] = useState(5);
  const [singleTableNumber, setSingleTableNumber] = useState('');

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['dashboardTables'],
    queryFn: async () => {
      const res = await api.get('/dashboard/tables');
      return res.data;
    }
  });

  const createTableMutation = useMutation({
    mutationFn: async (num) => api.post('/dashboard/tables', { tableNumber: num }),
    onSuccess: () => {
      queryClient.invalidateQueries(['dashboardTables']);
      toast.success('Mesa creada');
      setSingleTableNumber('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Error al crear mesa')
  });

  const handleBulkCreate = async () => {
    if(bulkCount < 1 || bulkCount > 50) return toast.error('Máximo 50 mesas');
    setIsBulkLoading(true);
    try {
      await api.post('/dashboard/tables/bulk', { count: bulkCount });
      queryClient.invalidateQueries(['dashboardTables']);
      toast.success(`${bulkCount} mesas creadas`);
    } catch (err) {
      toast.error('Error al generar mesas masivas');
    } finally {
      setIsBulkLoading(false);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/dashboard/tables/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['dashboardTables']);
      toast.success('Mesa eliminada');
    }
  });

  return (
    <div className="max-w-7xl mx-auto h-full pb-20">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Mesas y QR</h1>
          <p className="text-gray-500 text-sm mt-1">Genera y descarga códigos QR para tus mesas</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              placeholder="N° Mesa"
              value={singleTableNumber}
              onChange={(e) => setSingleTableNumber(e.target.value)}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <button 
              onClick={() => {
                if(singleTableNumber) createTableMutation.mutate(parseInt(singleTableNumber, 10));
              }}
              disabled={createTableMutation.isPending}
              className="bg-brand-red text-white p-2 text-sm font-medium rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center disabled:opacity-50"
              title="Crear Mesa Específica"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="w-px bg-gray-200 hidden sm:block"></div>

          <div className="flex items-center gap-2 border-t pt-4 sm:border-t-0 sm:pt-0 border-gray-100">
             <input 
              type="number" 
              min="1" max="50"
              value={bulkCount}
              onChange={(e) => setBulkCount(e.target.value)}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <button 
              onClick={handleBulkCreate}
              disabled={isBulkLoading}
              className="bg-black text-white px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isBulkLoading ? <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"/> : <ListPlus size={16} />}
              <span className="hidden lg:inline">Secuencial</span>
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
         <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-red/30 border-t-brand-red rounded-full animate-spin" />
        </div>
      ) : tables.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <QrCode className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-sm font-medium text-gray-900">No hay mesas</h3>
          <p className="mt-1 text-sm text-gray-500">Crea mesas usando el panel superior para generar códigos QR.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables.map(t => (
            <QRCard 
              key={t.id} 
              table={t} 
              onDelete={() => {
                if(confirm(`¿Eliminar mesa ${t.table_number}?`)) deleteMutation.mutate(t.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
  // small hack to import qrcode icon for placeholder
  import { QrCode } from 'lucide-react';

export default TablesPage;
