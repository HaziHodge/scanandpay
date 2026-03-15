import React from 'react';

const QRCard = ({ table, onDelete }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = table.qr_code_url;
    link.download = `mesa-${table.table_number}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col items-center p-6 hover:shadow-md transition-shadow">
      
      <div className="w-40 h-40 mb-4 bg-gray-50 rounded-lg p-2 border border-gray-100">
        <img 
          src={table.qr_code_url} 
          alt={`QR Mesa ${table.table_number}`} 
          className="w-full h-full object-contain mix-blend-multiply" 
        />
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        Mesa N°{table.table_number}
      </h3>

      <div className="w-full flex flex-col gap-2 mt-auto">
        <button 
          onClick={handleDownload}
          className="w-full py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors text-sm"
        >
          Descargar QR
        </button>
        
        <button 
          onClick={onDelete}
          className="w-full py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors text-sm"
        >
          Eliminar Mesa
        </button>
      </div>

    </div>
  );
};

export default QRCard;
