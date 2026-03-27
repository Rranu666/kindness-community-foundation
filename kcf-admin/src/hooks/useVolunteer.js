import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';

export function useVolunteerHours() {
  return useQuery({
    queryKey: ['volunteer_hours'],
    queryFn: async () => {
      const { data, error } = await supabase.from('volunteer_hours').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useVolunteerSignups() {
  return useQuery({
    queryKey: ['volunteer_signups'],
    queryFn: async () => {
      const { data, error } = await supabase.from('volunteer_signups').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
