import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { MemberScore } from '@/types';

const STORAGE_KEY = 'church_member_scores';
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to automatically sync data from Supabase to localStorage
 * Syncs every 5 minutes in the background
 */
export const useAutoSync = (onSyncComplete?: () => void) => {
  const syncInProgressRef = useRef(false);
  const lastSyncCountRef = useRef(0);

  const syncFromSupabase = useCallback(async () => {
    if (syncInProgressRef.current) return;
    syncInProgressRef.current = true;

    try {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const scores: MemberScore[] = data.map(score => ({
          memberId: score.member_id,
          date: score.date,
          activities: score.activities,
          totalPoints: score.total_points
        }));

        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));

          // If data changed, notify parent component
          if (scores.length !== lastSyncCountRef.current) {
            console.log(`🔄 Auto-synced ${scores.length} records from Supabase`);
            lastSyncCountRef.current = scores.length;
            onSyncComplete?.();
          }
        }
      }
    } catch (error) {
      // Silently fail - will try again in 5 minutes
      console.log('Auto-sync skipped (using localStorage)');
    } finally {
      syncInProgressRef.current = false;
    }
  }, [onSyncComplete]);

  useEffect(() => {
    // Initial sync on mount
    syncFromSupabase();

    // Set up interval for periodic sync
    const intervalId = setInterval(syncFromSupabase, SYNC_INTERVAL);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [syncFromSupabase]);
};
