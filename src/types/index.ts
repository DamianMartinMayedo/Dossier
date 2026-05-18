export interface Project {
  id: string;
  title: string;
  slug: string;
  category: "principal" | "secundario";
  description: string;
  cover_image: string | null;
  images: string[];
  services: string[];
  client: string | null;
  year: string | null;
  featured: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  name: string;
  bio: string;
  avatar: string | null;
  skills: string[];
  social_links: SocialLinks;
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  behance?: string;
  dribbble?: string;
  email?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface ProjectFormData {
  title: string;
  slug: string;
  category: "principal" | "secundario";
  description: string;
  services: string;
  client: string;
  year: string;
  featured: boolean;
  order: number;
}
