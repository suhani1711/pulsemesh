import { create } from 'zustand';
import { EmergencyContact } from '../types';
import { dbGetAllContacts, dbSaveContact, dbDeleteContact } from '../lib/db';

interface ContactsState {
  contacts: EmergencyContact[];
  isLoading: boolean;
  loadContacts: () => Promise<void>;
  addContact: (contact: Omit<EmergencyContact, 'id'>) => Promise<void>;
  updateContact: (contact: EmergencyContact) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
}

export const useContactsStore = create<ContactsState>((set) => ({
  contacts: [],
  isLoading: true,

  loadContacts: async () => {
    set({ isLoading: true });
    try {
      const stored = await dbGetAllContacts();
      // Remove the fixed sample contacts inserted by older demo builds.
      const sampleContacts = stored.filter((contact) =>
        contact.id === 'c-primary-family' || contact.id === 'c-red-cross'
      );
      for (const sample of sampleContacts) {
        await dbDeleteContact(sample.id);
      }
      set({
        contacts: stored.filter((contact) =>
          contact.id !== 'c-primary-family' && contact.id !== 'c-red-cross'
        ),
        isLoading: false,
      });
    } catch {
      set({ contacts: [], isLoading: false });
    }
  },

  addContact: async (newContactData) => {
    const contact: EmergencyContact = {
      ...newContactData,
      id: 'cnt_' + Math.random().toString(36).substring(2, 9),
    };
    await dbSaveContact(contact);
    set((state) => ({ contacts: [...state.contacts, contact] }));
  },

  updateContact: async (updated) => {
    await dbSaveContact(updated);
    set((state) => ({
      contacts: state.contacts.map((c) => (c.id === updated.id ? updated : c)),
    }));
  },

  deleteContact: async (id: string) => {
    await dbDeleteContact(id);
    set((state) => ({
      contacts: state.contacts.filter((c) => c.id !== id),
    }));
  },
}));
