// Profile types based on database schema
export interface ContactInfoEntry {
  id: string;
  type: 'phone' | 'email' | 'telegram' | 'whatsapp' | 'github' | 'linkedin' | 'twitter' | 'website' | 'link';
  value: string;
  label?: string;
  order: number;
  is_whatsapp?: boolean;
}

export interface Profile {
  id: string;
  created_at: string;
  telegram_id: string | null;
  user_id: string | null;
  telegram_username: string | null;
  name: string | null;
  username: string | null;
  about: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  profile_type: string | null;
  badge: string[] | null;
  contact_info: ContactInfoEntry[] | null;
}