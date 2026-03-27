import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';

export function useDonations() {
  return useQuery({
    queryKey: ['donations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('donations').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
