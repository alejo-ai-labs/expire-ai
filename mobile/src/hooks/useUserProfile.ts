import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { getUserProfile, setUserProfile, clearUserProfile } from '../services/storage';

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  lastName: '',
  email: '',
  birthday: '',
  weight: 0,
  height: 0,
  gender: '',
  country: '',
};

interface UseUserProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  clearProfile: () => Promise<void>;
}

export function useUserProfile(): UseUserProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const stored = await getUserProfile();
        if (!cancelled) {
          if (stored !== null && typeof stored === 'object') {
            // Merge with defaults to handle missing fields
            setProfile({ ...DEFAULT_PROFILE, ...stored });
          } else {
            setProfile(null);
          }
        }
      } catch (error) {
        console.warn('Failed to load user profile:', error);
        if (!cancelled) {
          setProfile(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      const current = profile ?? DEFAULT_PROFILE;
      const updated: UserProfile = { ...current, ...updates };
      setProfile(updated);
      await setUserProfile(updated);
    },
    [profile],
  );

  const clearProfile = useCallback(async () => {
    setProfile(null);
    await clearUserProfile();
  }, []);

  return { profile, isLoading, updateProfile, clearProfile };
}
