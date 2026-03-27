import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';

export function useLanguages() {
  return useQuery({
    queryKey: ['languages'],
    queryFn: async () => {
      const { data, error } = await supabase.from('languages').select('*').order('is_default', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateLanguage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase.from('languages').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['languages'] }),
  });
}

export function useUpdateLanguage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase.from('languages').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['languages'] }),
  });
}

export function useTranslations(languageCode) {
  return useQuery({
    queryKey: ['translations', languageCode],
    queryFn: async () => {
      let q = supabase.from('translations').select('*').order('namespace').order('key');
      if (languageCode) q = q.eq('language_code', languageCode);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useUpsertTranslation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase.from('translations').upsert({ ...payload, updated_at: new Date().toISOString() }, { onConflict: 'language_code,key' }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ['translations', vars.language_code] }),
  });
}
