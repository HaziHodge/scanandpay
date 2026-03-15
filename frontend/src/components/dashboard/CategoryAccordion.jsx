import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit2, Trash2, Plus, GripHorizontal } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatCLP } from '../../utils/formatCLP';

const CategoryAccordion = ({ category, onEditItem }) => {
  const [isOpen, setIsOpen] = useState(true);
  const queryClient = useQueryClient();

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: category.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const deleteCategoryMutation = useMutation({
    mutationFn: async () => api.delete(`/dashboard/menu/categories/${category.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['dashboardMenu']);
      toast.success('Categoría eliminada');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Error al eliminar categoría');
    }
  });

  const toggleItemAvailability = useMutation({
    mutationFn: async (itemId) => api.patch(`/dashboard/menu/items/${itemId}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries(['dashboardMenu']);
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId) => api.delete(`/dashboard/menu/items/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['dashboardMenu']);
      toast.success('Ítem eliminado');
    }
  });

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* Category Header */}
      <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab p-1 text-gray-400 hover:text-gray-600 hidden sm:block">
          <GripVertical size={20} />
        </div>
        <div {...attributes} {...listeners} className="cursor-grab p-1 text-gray-400 hover:text-gray-600 sm:hidden">
           <GripHorizontal size={20} />
        </div>
        
        <div 
          className="flex-1 font-bold text-gray-900 cursor-pointer flex justify-between select-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{category.name}</span>
          <span className="text-gray-500 font-normal text-sm bg-gray-200 px-2 rounded-full">{category.items.length}</span>
        </div>

        <div className="flex gap-2 relative z-10">
          <button 
            onClick={() => onEditItem(null, category.id)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
            title="Añadir ítem aquí"
          >
            <Plus size={18} />
          </button>
          <button 
            onClick={() => {
              if(confirm('¿Seguro que quieres eliminar esta categoría?')) {
                deleteCategoryMutation.mutate();
              }
            }}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
            title="Eliminar categoría"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Items List */}
      {isOpen && (
        <div className="divide-y divide-gray-100 p-2 sm:p-4 bg-white space-y-2 sm:space-y-0 sm:block flex flex-col">
          {category.items.length === 0 ? (
             <div className="text-sm text-gray-500 italic p-4 text-center border-2 border-dashed border-gray-100 rounded-lg">Sin ítems. Pulsa + para añadir uno.</div>
          ) : (
            category.items.map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-4 py-3 sm:py-4 px-2 hover:bg-gray-50 rounded-lg transition-colors border sm:border-transparent border-gray-100">
                {/* Image */}
                <div className="w-full sm:w-16 h-32 sm:h-16 rounded-md bg-gray-100 shrink-0 overflow-hidden border border-gray-200 object-cover">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sin img</div>
                  )}
                </div>
                
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-gray-900 truncate pr-2">{item.name}</h4>
                    <span className="font-bold text-gray-900 shrink-0">{formatCLP(item.price)}</span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t border-gray-100 sm:border-0 w-full sm:w-auto">
                  <label className="flex items-center cursor-pointer relative">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={item.available}
                      onChange={() => toggleItemAvailability.mutate(item.id)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700 sm:hidden">Disponible</span>
                  </label>

                  <div className="flex gap-1">
                    <button 
                      onClick={() => onEditItem(item, category.id)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        if(confirm(`¿Eliminar ${item.name}?`)) deleteItemMutation.mutate(item.id);
                      }}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryAccordion;
