import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';

export function useSeoSettings() {
  return useQuery({
    queryKey: ['seo_settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('seo_settings').select('*').order('page_slug');
      if (error) throw error;
      return data;
    },
  });
}

export function useUpsertSeo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase.from('seo_settings').upsert({ ...payload, updated_at: new Date().toISOString() }, { onConflict: 'page_slug' }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['seo_settings'] }),
  });
}
