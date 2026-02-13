const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  icon,
  confirmText = "Yes",
  cancelText = "Cancel",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg"
        >
          ✕
        </button>

        {/* Icon */}
        <div className="flex justify-center mt-8">
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gray-100">
            <img src={icon} alt="icon" className="w-10 h-10 object-contain" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center px-8 py-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
          <p className="text-gray-500 text-sm">{message}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg border border-red-600 text-red-600 hover:bg-red-50 transition"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
