export interface UserProfileData {
  id: number;
  publicId: string;
  email: string;
  role: 'user' | 'admin';
  avatarFileId: number | null;
  avatarUrl: string | null;
  profile: {
    fullName: string;
    phone: string | null;
    address: string | null;
    companyName: string | null;
    nidNumber: string | null;
  } | null;
}

export interface UpdateProfilePayload {
  fullName: string;
  phone?: string | null;
  address?: string | null;
  companyName?: string | null;
  nidNumber?: string | null;
}

export interface UpdatePasswordPayload {
  currentPassword?: string;
  newPassword: string;
}

export interface UpdateProfileImagePayload {
  avatarFileId: number | null;
}

export interface ProfileStore {
  profile: UserProfileData | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  updateDetails: (payload: UpdateProfilePayload) => Promise<void>;
  updatePassword: (payload: UpdatePasswordPayload) => Promise<void>;
  updateImage: (payload: UpdateProfileImagePayload, avatarUrl: string | null) => Promise<void>;
  clearProfile: () => void;
}


