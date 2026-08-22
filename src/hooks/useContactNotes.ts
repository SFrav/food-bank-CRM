import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ContactNote {
  note_id: string;
  note_text: string;
  created_by: string | null;
  creator_name: string | null;
  created_at: string;
}

export const useContactNotes = (contactId: string | null) => {
  const [notes, setNotes] = useState<ContactNote[]>([]);
  // const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!contactId) return;
    // setLoading(true);
    try{
    const { data, error } = await supabase
      .rpc('get_contact_notes', { p_contact_id: contactId });
    if (error) throw error;
    if (!error && data) setNotes(data as ContactNote[]);
    return { success: true };
    } catch (err: unknown) { 
        console.error(err);
        return { success: false, error: err };
      } finally {
        // setLoading(false);
      }
  }, [contactId]);

  const delete_note = useCallback(
    async (noteId: string) => {
      try{
        const { data, error } = await supabase.rpc('delete_contact_note', {
          p_note_id: noteId,
        });
        if (error) throw error;
        if (!error) {
          setNotes(prev => prev.filter(n => n.note_id !== noteId));
          return { success: true };
        }
      } catch (err: unknown) { 
        console.error(err);
        return { success: false, error: err };
      } finally {
        // setLoading(false);
      }
    }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { 
    notes, 
    fetch, 
    delete_note 
  };
};
