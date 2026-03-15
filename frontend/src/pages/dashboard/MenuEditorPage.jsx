import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, GripVertical, ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import CategoryAccordion from '../../components/dashboard/CategoryAccordion';
import ItemForm from '../../components/dashboard/ItemForm';

const MenuEditorPage = () => {
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['dashboardMenu'],
    queryFn: async () => {
      const res = await api.get('/dashboard/menu');
      return res.data;
    }
  });

  const categories = data?.categories || [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const reorderCategoriesMutation = useMutation({
    mutationFn: async (updatedCategories) => {
      // In a real app we'd send a bulk update or individual updates
      const promises = updatedCategories.map((cat, index) => 
        api.put(`/dashboard/menu/categories/${cat.id}`, { ...cat, display_order: index })
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardMenu'] });
      toast.success('Orden guardado');
    }
  });

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);
      
      const newOrder = arrayMove(categories, oldIndex, newIndex);
      // Optimistic update
      queryClient.setQueryData(['dashboardMenu'], oldData => ({
        ...oldData,
        categories: newOrder
      }));

      reorderCategoriesMutation.mutate(newOrder);
    }
  };

  const createCategoryMutation = useMutation({
    mutationFn: async (name) => {
      const order = categories.length;
      return await api.post('/dashboard/menu/categories', { name, display_order: order });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardMenu'] });
      toast.success('Categoría creada');
    }
  });

  const handleCreateCategory = () => {
    const name = window.prompt('Nombre de la nueva categoría:');
    if (name?.trim()) {
      createCategoryMutation.mutate(name.trim());
    }
  };

  const handleOpenItemForm = (item = null, defaultCategoryId = null) => {
    setEditingItem(item ? { ...item, defaultCategoryId } : { defaultCategoryId });
    setIsFormOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto h-full pb-20">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editor de Menú</h1>
          <p className="text-gray-500 text-sm mt-1">Organiza tus categorías y añade productos</p>
        </div>
        <button 
          onClick={() => handleOpenItemForm(null, categories[0]?.id)}
          className="bg-brand-red text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-red-600 flex items-center gap-2"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Nuevo Ítem</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-red/30 border-t-brand-red rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
              {categories.map((cat) => (
                <CategoryAccordion 
                  key={cat.id} 
                  category={cat} 
                  onEditItem={handleOpenItemForm}
                />
              ))}
            </SortableContext>
          </DndContext>

          <button 
            onClick={handleCreateCategory}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Nueva Categoría
          </button>
        </div>
      )}

      {isFormOpen && (
        <ItemForm 
          item={editingItem} 
          categories={categories}
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
};

export default MenuEditorPage;
