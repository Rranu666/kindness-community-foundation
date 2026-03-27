import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import { subDays, format } from 'date-fns';

export function useUserGrowth(days = 30) {
  return useQuery({
    queryKey: ['user_growth', days],
    queryFn: async () => {
      const since = subDays(new Date(), days).toISOString();
      const { data, error } = await supabase.from('profiles').select('created_at').gte('created_at', since).order('created_at');
      if (error) throw error;
      // Group by day
      const grouped = {};
      data.forEach(r => {
        const day = format(new Date(r.created_at), 'MMM d');
        grouped[day] = (grouped[day] || 0) + 1;
      });
      return Object.entries(grouped).map(([date, count]) => ({ date, count }));
    },
  });
}

export function useDonationTrend(days = 30) {
  return useQuery({
    queryKey: ['donation_trend', days],
    queryFn: async () => {
      const since = subDays(new Date(), days).toISOString();
      const { data, error } = await supabase.from('donations').select('created_at, amount').gte('created_at', since).order('created_at');
      if (error) throw error;
      const grouped = {};
      data.forEach(r => {
        const day = format(new Date(r.created_at), 'MMM d');
        grouped[day] = (grouped[day] || 0) + (parseFloat(r.amount) || 0);
      });
      return Object.entries(grouped).map(([date, total]) => ({ date, total: parseFloat(total.toFixed(2)) }));
    },
  });
}

export function useDonationsByCause() {
  return useQuery({
    queryKey: ['donations_by_cause'],
    queryFn: async () => {
      const { data, error } = await supabase.from('donations').select('cause, amount');
      if (error) throw error;
      const grouped = {};
      data.forEach(r => {
        const cause = r.cause || 'Other';
        grouped[cause] = (grouped[cause] || 0) + (parseFloat(r.amount) || 0);
      });
      return Object.entries(grouped).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }));
    },
  });
}

export function useVolunteerByInitiative() {
  return useQuery({
    queryKey: ['volunteer_by_initiative'],
    queryFn: async () => {
      const { data, error } = await supabase.from('volunteer_hours').select('initiative_name, hours');
      if (error) throw error;
      const grouped = {};
      data.forEach(r => {
        const name = r.initiative_name || 'General';
        grouped[name] = (grouped[name] || 0) + (parseFloat(r.hours) || 0);
      });
      return Object.entries(grouped).map(([name, hours]) => ({ name, hours: parseFloat(hours.toFixed(1)) }));
    },
  });
}
