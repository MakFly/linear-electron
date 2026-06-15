import { LucideIcon } from 'lucide-react';

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

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
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
    preferences?: LinearPreferences;
    [key: string]: unknown; // This allows for additional properties...
}

export type LinearPreferences = {
    default_home_view: 'active' | 'my-issues' | 'inbox';
    display_names: 'full' | 'short' | 'username';
    first_day_of_week: 'sunday' | 'monday';
    convert_emoticons: boolean;
    send_comment_on: 'enter' | 'mod-enter';
    font_size: 'small' | 'default' | 'large';
    pointer_cursors: boolean;
    interface_theme: 'light' | 'dark' | 'system';
    open_in_desktop_app: boolean;
    language: 'en' | 'fr';
};
