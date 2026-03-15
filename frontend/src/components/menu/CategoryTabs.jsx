import React from 'react';

const CategoryTabs = ({ categories, activeCategory, onTabClick }) => {
  return (
    <div className="sticky top-[72px] z-30 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/5 no-scrollbar overflow-x-auto">
      <div className="flex px-4 items-center">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onTabClick(cat.id)}
              className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                isActive 
                  ? 'text-white border-brand-red' 
                  : 'text-gray-400 border-transparent hover:text-gray-200'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryTabs;
