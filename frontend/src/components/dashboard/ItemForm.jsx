import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { X, Image as ImageIcon } from 'lucide-react';

const ItemForm = ({ item, categories, onClose }) => {
  const isEditing = !!item?.id;
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || '',
    image_url: item?.image_url || '',
    categoryId: item?.category_id || item?.defaultCategoryId || categories[0]?.id || '',
    available: item?.available ?? true
  });

  const [previewError, setPreviewError] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        ...data,
        price: parseInt(data.price, 10),
      };
      if (isEditing) {
        return await api.put(`/dashboard/menu/items/${item.id}`, payload);
      } else {
        return await api.post('/dashboard/menu/items', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['dashboardMenu']);
      toast.success(isEditing ? 'Ítem actualizado' : 'Ítem creado');
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Error al guardar');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error('Debes seleccionar una categoría');
      return;
    }
    saveMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-in zoom-in-95">
        
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Editar Ítem' : 'Nuevo Ítem'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          <form id="item-form" onSubmit={handleSubmit} className="space-y-5">
            
            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 bg-gray-50 shrink-0 overflow-hidden relative group">
                {formData.image_url && !previewError ? (
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={() => setPreviewError(true)}
                  />
                ) : (
                  <>
                    <ImageIcon size={24} className="mb-1 opacity-50" />
                    <span className="text-[10px] font-medium text-center leading-tight">Image<br/>Preview</span>
                  </>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">URL de Imagen (Opcional)</label>
                <input 
                  type="url" 
                  value={formData.image_url}
                  onChange={(e) => {
                    setFormData({...formData, image_url: e.target.value});
                    setPreviewError(false);
                  }}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-brand-red sm:text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-brand-red sm:text-sm"
                placeholder="Ej: Hamburguesa Clásica"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Precio (CLP)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-brand-red sm:text-sm"
                    placeholder="5000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría</label>
                <select 
                  required
                  value={formData.categoryId}
                  onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full px-3 py-2 text-black bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-brand-red sm:text-sm"
                >
                  <option value="" disabled>Seleccione...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
              <textarea 
                rows={3}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-brand-red sm:text-sm resize-none"
                placeholder="Ingredientes o descripción breve..."
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer bg-gray-50 p-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
              <input 
                type="checkbox" 
                checked={formData.available}
                onChange={e => setFormData({...formData, available: e.target.checked})}
                className="w-5 h-5 rounded border-gray-300 text-brand-red focus:ring-brand-red"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">Disponible para Pedir</div>
                <div className="text-xs text-gray-500">Si desmarcas, se mostrará como "Agotado".</div>
              </div>
            </label>

          </form>
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-auto">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="item-form"
            disabled={saveMutation.isPending}
            className="px-6 py-2.5 bg-brand-red text-white font-semibold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Guardando...' : 'Guardar Ítem'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ItemForm;
