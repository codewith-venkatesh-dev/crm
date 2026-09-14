import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface FollowUpOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (completionNote: string) => void;
  title: string;
  isLoading?: boolean;
}

export const FollowUpOutcomeModal: React.FC<FollowUpOutcomeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  isLoading = false,
}) => {
  const [completionNote, setCompletionNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(completionNote.trim());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Close Follow-up & Record Outcome"
      subtitle={`What happened during: "${title}"?`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Follow-up Outcome Notes / Discussion Summary
          </label>
          <textarea
            rows={4}
            autoFocus
            placeholder="e.g. Spoke with customer. They requested a 10% volume discount on 50 seats. Agreed to follow up next Tuesday..."
            value={completionNote}
            onChange={(e) => setCompletionNote(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            This outcome will be saved to the follow-up record and recorded in the lead activity history.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>Mark Completed</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
