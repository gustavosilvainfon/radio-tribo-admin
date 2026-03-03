'use client';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-black/90 to-black/70 backdrop-blur-xl rounded-2xl p-8 border-2 border-red-500/50 shadow-2xl max-w-md w-full">
        <h3 className="text-2xl font-bold text-white mb-4">{title || 'Confirmar Exclusão'}</h3>
        <p className="text-gray-300 mb-6">{message || 'Tem certeza que deseja deletar este item? Esta ação não pode ser desfeita.'}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
          >
            Deletar
          </button>
        </div>
      </div>
    </div>
  );
}

