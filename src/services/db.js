import { createClient } from '@supabase/supabase-js';

class DatabaseService {
  constructor() {
    this.supabase = null;
    this.onAuthStateChangeCallback = null;
    this.loadConfig();
  }

  // Load Supabase URL and Anon Key from localStorage if they exist
  loadConfig() {
    const url = localStorage.getItem('blip_supabase_url') || '';
    const key = localStorage.getItem('blip_supabase_anon_key') || '';
    
    if (url && key) {
      try {
        this.supabase = createClient(url, key, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          }
        });
        
        // Listen to auth state changes
        this.supabase.auth.onAuthStateChange((event, session) => {
          if (this.onAuthStateChangeCallback) {
            this.onAuthStateChangeCallback(event, session);
          }
          if (event === 'SIGNED_IN' && session?.user) {
            this.syncLocalToCloud(session.user.id);
          }
        });
      } catch (err) {
        console.error("Failed to initialize Supabase client:", err);
        this.supabase = null;
      }
    } else {
      this.supabase = null;
    }
  }

  // Set Supabase URL and Key manually
  setCredentials(url, key) {
    if (url && key) {
      localStorage.setItem('blip_supabase_url', url.trim());
      localStorage.setItem('blip_supabase_anon_key', key.trim());
    } else {
      localStorage.removeItem('blip_supabase_url');
      localStorage.removeItem('blip_supabase_anon_key');
    }
    this.loadConfig();
  }

  getCredentials() {
    return {
      url: localStorage.getItem('blip_supabase_url') || '',
      key: localStorage.getItem('blip_supabase_anon_key') || '',
    };
  }

  isCloudConfigured() {
    return this.supabase !== null;
  }

  registerAuthListener(callback) {
    this.onAuthStateChangeCallback = callback;
    // Trigger initial check
    if (this.supabase) {
      this.supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          callback('SIGNED_IN', session);
        } else {
          callback('SIGNED_OUT', null);
        }
      });
    } else {
      callback('SIGNED_OUT', null);
    }
  }

  // Authentication operations
  async login(email, password) {
    if (!this.supabase) throw new Error("Cloud Sync is not configured. Configure it in Settings.");
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async signup(email, password) {
    if (!this.supabase) throw new Error("Cloud Sync is not configured. Configure it in Settings.");
    const { data, error } = await this.supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }

  async logout() {
    if (this.supabase) {
      await this.supabase.auth.signOut();
    }
  }

  async getCurrentUser() {
    if (!this.supabase) return null;
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  // Get all journal entries
  async getEntries() {
    const user = await this.getCurrentUser();
    
    if (this.supabase && user) {
      try {
        const { data, error } = await this.supabase
          .from('journal_entries')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Convert DB format to client format
        return data.map(item => ({
          id: item.id,
          createdAt: new Date(item.created_at),
          modifiedAt: new Date(item.modified_at),
          text: item.text,
          mood: item.mood,
          isFavorite: item.is_favorite,
          owner: item.owner
        }));
      } catch (err) {
        console.error("Failed to fetch from Supabase, falling back to local cache:", err);
        // Fallback to local cache in case network is down
        return this.getLocalEntries();
      }
    } else {
      return this.getLocalEntries();
    }
  }

  // Get entries stored in localStorage
  getLocalEntries() {
    const raw = localStorage.getItem('blip_local_entries');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return parsed.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        modifiedAt: new Date(item.modifiedAt)
      })).sort((a, b) => b.createdAt - a.createdAt);
    } catch (e) {
      console.error("Error parsing local entries:", e);
      return [];
    }
  }

  // Save or Update a journal entry
  async saveEntry(entryData) {
    const user = await this.getCurrentUser();
    
    const entry = {
      id: entryData.id || crypto.randomUUID(),
      createdAt: entryData.createdAt ? new Date(entryData.createdAt) : new Date(),
      modifiedAt: new Date(),
      text: entryData.text,
      mood: parseInt(entryData.mood) ?? 1,
      isFavorite: !!entryData.isFavorite,
      owner: user ? user.id : null
    };

    if (this.supabase && user) {
      // Map to DB column names
      const dbPayload = {
        id: entry.id,
        created_at: entry.createdAt.toISOString(),
        modified_at: entry.modifiedAt.toISOString(),
        text: entry.text,
        mood: entry.mood,
        is_favorite: entry.isFavorite,
        owner: user.id
      };

      const { error } = await this.supabase
        .from('journal_entries')
        .upsert([dbPayload]);

      if (error) throw error;
      
      // Also cache locally for offline access
      this.saveLocalEntry(entry);
    } else {
      this.saveLocalEntry(entry);
    }

    return entry;
  }

  saveLocalEntry(entry) {
    const entries = this.getLocalEntries();
    const idx = entries.findIndex(e => e.id === entry.id);
    if (idx >= 0) {
      entries[idx] = entry;
    } else {
      entries.unshift(entry);
    }
    localStorage.setItem('blip_local_entries', JSON.stringify(entries));
  }

  // Delete a journal entry
  async deleteEntry(id) {
    const user = await this.getCurrentUser();

    if (this.supabase && user) {
      const { error } = await this.supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    }
    
    // Always delete locally as well
    const entries = this.getLocalEntries();
    const filtered = entries.filter(e => e.id !== id);
    localStorage.setItem('blip_local_entries', JSON.stringify(filtered));
  }

  // Toggle favorite status
  async toggleFavorite(id) {
    const entries = this.getLocalEntries();
    const entry = entries.find(e => e.id === id);
    if (!entry) return;

    entry.isFavorite = !entry.isFavorite;
    entry.modifiedAt = new Date();
    
    await this.saveEntry(entry);
    return entry;
  }

  // Sync offline entries to Supabase once logged in
  async syncLocalToCloud(userId) {
    if (!this.supabase || !userId) return;

    const localEntries = this.getLocalEntries();
    // Filter entries that don't have an owner (created offline)
    const offlineEntries = localEntries.filter(e => !e.owner);
    if (offlineEntries.length === 0) return;

    console.log(`Syncing ${offlineEntries.length} offline entries to Cloud...`);

    const dbPayloads = offlineEntries.map(e => ({
      id: e.id,
      created_at: e.createdAt.toISOString(),
      modified_at: e.modifiedAt.toISOString(),
      text: e.text,
      mood: e.mood,
      is_favorite: e.isFavorite,
      owner: userId
    }));

    try {
      const { error } = await this.supabase
        .from('journal_entries')
        .upsert(dbPayloads);

      if (error) throw error;

      // Update local storage so they are now owned by user
      const updatedEntries = localEntries.map(e => {
        if (!e.owner) {
          return { ...e, owner: userId };
        }
        return e;
      });
      localStorage.setItem('blip_local_entries', JSON.stringify(updatedEntries));
      console.log("Offline sync complete!");
    } catch (err) {
      console.error("Failed to sync offline entries to cloud:", err);
    }
  }

  // Import JSON entries
  async importJSON(entriesArray) {
    for (const item of entriesArray) {
      await this.saveEntry({
        id: item.id || crypto.randomUUID(),
        createdAt: item.createdAt || item.created_at || new Date(),
        text: item.text || '',
        mood: parseInt(item.mood) ?? 1,
        isFavorite: !!(item.isFavorite || item.is_favorite),
      });
    }
  }
}

export const db = new DatabaseService();
