export interface FPCycle {
  family: string;
  grade: string;
  name: string;
}

export interface SocialMediaLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
}

export interface Center {
  id: string;
  name: string;
  type: string;
  address: string;
  zipCode: string;
  municipality: string;
  province: string;
  phone?: string;
  lat: number;
  lng: number;
  levels: string[];
  url?: string;
  gvaUrl?: string;
  hasCustomUrl?: boolean;
  socialMedia?: SocialMediaLinks;
  fpCycles?: FPCycle[];
  distance?: number;
}
