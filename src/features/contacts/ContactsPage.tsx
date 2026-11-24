import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Phone,
  MessageSquare,
  Trash2,
  Edit2,
  AlertTriangle,
  Star
} from 'lucide-react';
import { useContactsStore } from '../../store/useContactsStore';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { GENERAL_EMERGENCY_NUMBERS } from '../../data/demoData';
import { EmergencyContact } from '../../types';

export const ContactsPage: React.FC = () => {
  const { showToast } = useToast();
  const { contacts, addContact, updateContact, deleteContact } = useContactsStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    setEditingContact(null);
    setName('');
    setRelationship('Family');
    setPhone('');
    setIsPrimary(contacts.length === 0);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setName(contact.name);
    setRelationship(contact.relationship);
    setPhone(contact.phone);
    setIsPrimary(Boolean(contact.isPrimary));
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setFormError('Contact name and phone number are required.');
      return;
    }

    if (editingContact) {
      await updateContact({
        id: editingContact.id,
        name: name.trim(),
        relationship: relationship.trim() || 'Contact',
        phone: phone.trim(),
        isPrimary,
      });
      showToast('Contact updated successfully.', 'success');
    } else {
      await addContact({
        name: name.trim(),
        relationship: relationship.trim() || 'Contact',
        phone: phone.trim(),
        isPrimary,
      });
      showToast('Emergency contact saved to IndexedDB.', 'success');
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h1 className="text-2xl font-black text-white">Emergency Contacts Directory</h1>
          </div>
          <p className="text-sm text-slate-300 mt-1">
            Offline address book stored locally in IndexedDB with tap-to-call and tap-to-SMS links.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,217,255,0.25)]"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Emergency Contact</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Personal Saved Contacts */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-[#0D1B2A] border border-cyan-500/20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-950">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Personal Emergency Contacts ({contacts.length})
              </h2>
              <span className="text-[11px] text-slate-400">IndexedDB Persisted</span>
            </div>

            <div className="space-y-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{contact.name}</span>
                      {contact.isPrimary && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Star className="w-3 h-3 fill-amber-300" />
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-cyan-300 font-mono">{contact.phone}</div>
                    <div className="text-[11px] text-slate-400">Relationship: {contact.relationship}</div>
                  </div>

                  {/* Quick Action Dial Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 text-xs font-semibold transition-colors"
                      title="Tap to call"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                    <a
                      href={`sms:${contact.phone}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-xs font-semibold transition-colors"
                      title="Tap to SMS"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>SMS</span>
                    </a>
                    <button
                      onClick={() => openEditModal(contact)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                      title="Edit contact"
                      aria-label="Edit contact"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setIsConfirmingDelete(contact.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
                      title="Delete contact"
                      aria-label="Delete contact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {contacts.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-xs space-y-2">
                  <p>No personal emergency contacts registered.</p>
                  <button
                    onClick={openAddModal}
                    className="text-cyan-400 hover:underline font-semibold"
                  >
                    Add your first contact now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: General Emergency Numbers Reference */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-[#0D1B2A] border border-cyan-500/20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-950">
              <div className="space-y-0.5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  Universal Emergency Numbers
                </h2>
                <span className="text-[11px] text-amber-300 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  Verify for your specific country
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              {GENERAL_EMERGENCY_NUMBERS.map((gen, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-200">
                    <span>{gen.country}</span>
                    <span className="text-[10px] text-slate-400">{gen.note}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href={`tel:${gen.police.split('/')[0].trim()}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] flex items-center gap-1 font-mono"
                    >
                      <Phone className="w-3 h-3 text-cyan-400" />
                      <span>Police: {gen.police}</span>
                    </a>
                    <a
                      href={`tel:${gen.ambulance.split('/')[0].trim()}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] flex items-center gap-1 font-mono"
                    >
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>Ambulance: {gen.ambulance}</span>
                    </a>
                    <a
                      href={`tel:${gen.fire.split('/')[0].trim()}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] flex items-center gap-1 font-mono"
                    >
                      <Phone className="w-3 h-3 text-red-400" />
                      <span>Fire: {gen.fire}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ADD / EDIT CONTACT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-lg text-red-200">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Contact Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-400 text-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Relationship</label>
            <input
              type="text"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="e.g. Spouse, Parent, Aid Worker, Doctor"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-400 text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Phone Number (with Country Code) *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1 555-0199 or 911"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-400 text-white font-mono focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="primary-contact"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="primary-contact" className="text-slate-300 cursor-pointer">
              Set as primary SOS recipient
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-colors"
            >
              {editingContact ? 'Save Changes' : 'Add Contact'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(isConfirmingDelete)}
        title="Delete Emergency Contact?"
        message="Are you sure you want to remove this contact from your offline directory?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={async () => {
          if (isConfirmingDelete) {
            await deleteContact(isConfirmingDelete);
            showToast('Contact deleted.', 'info');
            setIsConfirmingDelete(null);
          }
        }}
        onCancel={() => setIsConfirmingDelete(null)}
      />
    </div>
  );
};
