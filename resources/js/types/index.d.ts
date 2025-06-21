import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}



// In @/types/index.ts
export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    exact?: boolean;
    isActive?: boolean;
    badge?: string | number;
    external?: boolean;
    disabled?: boolean;
    className?: string;
}
export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}


export type DocType = {
    id: string;
    title: string;
    type: DocCategory;
    status: 'draft' | 'generating' | 'published' | 'archived';
    created_at?: string;
    updated_at?: string;
    progress: number;
    wordCount?: number;
};

export type Project = {
    id: string;
    name: string;
    description: string;
    tech_stack?: string[];
    enhanced_mode: boolean;
    features: string[]
    project_idea: string;
    target_audience: string
    created_at: string;
    updated_at: string;
    documents: DocType[];
    shared_users?: Users[]
    owner?: Users
};

export type DocCategory =
    | 'technical'
    | 'ui-ux'
    | 'product'
    | 'collaboration'
    | 'client'
    | 'testing'
    | 'security'
    | 'operations';