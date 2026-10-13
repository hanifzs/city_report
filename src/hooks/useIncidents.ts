import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Incident, IncidentCategory } from '../types/incident';
import { INITIAL_MOCK_INCIDENTS, calculateDistanceKm } from '../lib/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_INCIDENTS_KEY = 'cityreport_custom_incidents';
const LOCAL_VOTES_KEY = 'cityreport_user_votes';

export function useIncidents(userLat: number, userLon: number) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<IncidentCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userVotes, setUserVotes] = useState<Record<string, 'still_happening' | 'resolved'>>({});

  // Load votes cache from localStorage
  useEffect(() => {
    try {
      const savedVotes = localStorage.getItem(LOCAL_VOTES_KEY);
      if (savedVotes) {
        setUserVotes(JSON.parse(savedVotes));
      }
    } catch (e) {
      console.warn('Failed to parse user votes:', e);
    }
  }, []);

  // Fetch incidents from Supabase or Mock fallback
  const fetchIncidents = useCallback(async () => {
    setIsLoading(true);
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('incidents')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) {
          setIncidents(data as Incident[]);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to mock storage:', err);
      }
    }

    // Local / Mock fallback
    try {
      const customSaved = localStorage.getItem(LOCAL_INCIDENTS_KEY);
      const customIncidents: Incident[] = customSaved ? JSON.parse(customSaved) : [];
      // Combine mock + custom
      const combined = [...customIncidents, ...INITIAL_MOCK_INCIDENTS];
      setIncidents(combined);
    } catch (err) {
      setIncidents(INITIAL_MOCK_INCIDENTS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // Realtime Supabase listener if configured
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const channel = supabase
      .channel('public:incidents')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'incidents' },
        () => {
          fetchIncidents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchIncidents]);

  // Compute distances & sort
  const enrichedIncidents = useMemo(() => {
    return incidents.map((item) => {
      const distance = calculateDistanceKm(
        userLat,
        userLon,
        item.latitude,
        item.longitude
      );
      return {
        ...item,
        distance_km: distance,
      };
    });
  }, [incidents, userLat, userLon]);

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return enrichedIncidents.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesAddress = item.address.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        return matchesTitle || matchesAddress || matchesDesc;
      }
      return true;
    }).sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
  }, [enrichedIncidents, selectedCategory, searchQuery]);

  // Keep selected incident reference updated
  useEffect(() => {
    if (selectedIncident) {
      const updated = enrichedIncidents.find((i) => i.id === selectedIncident.id);
      if (updated) {
        setSelectedIncident(updated);
      }
    }
  }, [enrichedIncidents]);

  // Add Incident
  const addIncident = async (newIncident: Omit<Incident, 'id' | 'created_at' | 'updated_at' | 'expires_at' | 'votes_still_happening' | 'votes_resolved'>) => {
    const fullItem: Incident = {
      ...newIncident,
      id: 'inc-' + Date.now(),
      votes_still_happening: 1,
      votes_resolved: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('incidents')
          .insert([
            {
              title: fullItem.title,
              description: fullItem.description,
              category: fullItem.category,
              latitude: fullItem.latitude,
              longitude: fullItem.longitude,
              address: fullItem.address,
              photo_url: fullItem.photo_url,
              reporter_id: fullItem.reporter_id,
              reporter_name: fullItem.reporter_name,
              reporter_avatar: fullItem.reporter_avatar,
              status: fullItem.status,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setIncidents((prev) => [data as Incident, ...prev]);
          setSelectedIncident(data as Incident);
          return data;
        }
      } catch (err) {
        console.warn('Failed to insert into Supabase, saving locally:', err);
      }
    }

    // Local save
    const customSaved = localStorage.getItem(LOCAL_INCIDENTS_KEY);
    const customList: Incident[] = customSaved ? JSON.parse(customSaved) : [];
    const updatedList = [fullItem, ...customList];
    localStorage.setItem(LOCAL_INCIDENTS_KEY, JSON.stringify(updatedList));

    setIncidents((prev) => [fullItem, ...prev]);
    setSelectedIncident(fullItem);
    return fullItem;
  };

  // Vote Incident (Still Happening / Resolved)
  const voteIncident = async (
    incidentId: string,
    voteType: 'still_happening' | 'resolved'
  ): Promise<{ success: boolean; message: string }> => {
    const currentVote = userVotes[incidentId];
    if (currentVote === voteType) {
      return { success: false, message: 'Anda sudah memberikan konfirmasi ini.' };
    }

    const newVotes = { ...userVotes, [incidentId]: voteType };
    setUserVotes(newVotes);
    localStorage.setItem(LOCAL_VOTES_KEY, JSON.stringify(newVotes));

    // Update in memory
    setIncidents((prev) =>
      prev.map((item) => {
        if (item.id === incidentId) {
          let stillCount = item.votes_still_happening;
          let resCount = item.votes_resolved;

          if (currentVote === 'still_happening') stillCount = Math.max(0, stillCount - 1);
          if (currentVote === 'resolved') resCount = Math.max(0, resCount - 1);

          if (voteType === 'still_happening') stillCount += 1;
          if (voteType === 'resolved') resCount += 1;

          const isResolved = resCount >= 3 && resCount > stillCount;

          return {
            ...item,
            votes_still_happening: stillCount,
            votes_resolved: resCount,
            status: isResolved ? 'resolved' : 'active',
            // Extend expires_at by 24h if confirmed still happening
            expires_at:
              voteType === 'still_happening'
                ? new Date(Date.now() + 24 * 3600 * 1000).toISOString()
                : item.expires_at,
          };
        }
        return item;
      })
    );

    // Save to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('incident_votes').upsert({
          incident_id: incidentId,
          vote_type: voteType,
        });
      } catch (e) {
        console.warn('Vote sync to Supabase skipped:', e);
      }
    }

    return {
      success: true,
      message:
        voteType === 'still_happening'
          ? 'Terima kasih! Anda mengonfirmasi gangguan ini masih terjadi.'
          : 'Terima kasih! Laporan telah Anda tandai sudah selesai.',
    };
  };

  return {
    incidents: filteredIncidents,
    allIncidents: enrichedIncidents,
    isLoading,
    selectedIncident,
    setSelectedIncident,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    addIncident,
    voteIncident,
    userVotes,
    refreshIncidents: fetchIncidents,
  };
}
