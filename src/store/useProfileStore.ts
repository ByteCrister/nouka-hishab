import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ProfileStore,
  UpdateProfilePayload,
  UpdatePasswordPayload,
  UpdateProfileImagePayload,
  UserProfileData,
} from '@/types/profile.types';

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  isLoading: false,
  isUpdating: false,
  error: null,

  fetchProfile: async () => {
    // Prevent fetching if already loading or updating
    if (get().isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('/api/v1/profile/me');
      set({ profile: response.data.data, isLoading: false });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error || error.message
        : 'Failed to fetch profile';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  updateDetails: async (payload: UpdateProfilePayload) => {
    if (get().isUpdating) return;
    const previousProfile = get().profile;

    if (!previousProfile) {
      toast.error("Profile not loaded.");
      return;
    }

    // Optimistic update
    set({
      isUpdating: true,
      error: null,
      profile: {
        ...previousProfile,
        profile: {
          ...previousProfile.profile,
          ...payload,
        }
      } as UserProfileData
    });

    try {
      const response = await axios.patch('/api/v1/profile/details', payload);
      set({ profile: response.data.data, isUpdating: false });
      toast.success('Profile updated successfully');
    } catch (error) {
      // Revert optimistic update on failure
      set({ profile: previousProfile, isUpdating: false });

      const message = axios.isAxiosError(error)
        ? error.response?.data?.error || error.message
        : 'Failed to update profile';
      toast.error(message);
      throw error;
    }
  },

  updatePassword: async (payload: UpdatePasswordPayload) => {
    if (get().isUpdating) return;

    set({ isUpdating: true, error: null });
    try {
      await axios.patch('/api/v1/profile/password', payload);
      set({ isUpdating: false });
      toast.success('Password updated successfully');
    } catch (error) {
      set({ isUpdating: false });
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error || error.message
        : 'Failed to update password';
      toast.error(message);
      throw error;
    }
  },

  updateImage: async (payload: UpdateProfileImagePayload, avatarUrl: string | null) => {
    if (get().isUpdating) return;
    const previousProfile = get().profile;

    if (!previousProfile) {
      toast.error("Profile not loaded.");
      return;
    }

    // Optimistic update
    set({
      isUpdating: true,
      error: null,
      profile: {
        ...previousProfile,
        avatarFileId: payload.avatarFileId,
        avatarUrl,
      },
    });

    try {
      const response = await axios.patch('/api/v1/profile/image', payload);
      set({ profile: response.data.data, isUpdating: false });
      toast.success('Profile image updated successfully');
    } catch (error) {
      // Revert optimistic update
      set({ profile: previousProfile, isUpdating: false });

      const message = axios.isAxiosError(error)
        ? error.response?.data?.error || error.message
        : 'Failed to update profile image';
      toast.error(message);
      throw error;
    }
  },

  clearProfile: () => {
    set({ profile: null, isLoading: false, isUpdating: false, error: null });
  },
}));
