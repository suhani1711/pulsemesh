import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  const confirmBtnStyle = {
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    warning: 'bg-amber-600 hover:bg-amber-500 text-white',
    primary: 'bg-cyan-600 hover:bg-cyan-500 text-white',
  }[variant];

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} maxWidth="md">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-red-500/20 text-red-400 flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{message}</p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 border border-slate-700 font-medium text-sm transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${confirmBtnStyle}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
