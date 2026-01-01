/**
 * Centralized Type Definitions
 * 
 * This file contains all shared TypeScript interfaces and types used across the application.
 * Avoids duplication and ensures consistency.
 */

import type { Timestamp } from 'firebase/firestore';

// ============================================================================
// USER TYPES
// ============================================================================

export type SubscriptionTier = 'free' | 'pro';
export type UserRole = 'user' | 'admin' | 'moderator';

export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    subscriptionTier: SubscriptionTier;
    role: UserRole;
    createdAt: Date;
    lastLogin?: Date;
}

// ============================================================================
// MUSIC TYPES
// ============================================================================

export type MusicGenre = 'classical' | 'jazz' | 'electronic' | 'ambient' | 'other';
export type TrackStatus = 'pending' | 'approved' | 'rejected';

export interface Track {
    id: string;
    title: string;
    artist: string;
    album: string;
    duration: number; // in seconds
    url: string;
    coverUrl: string;
    genre: MusicGenre;
    createdAt: Date;
}

export interface Album {
    id: string;
    title: string;
    artist: string;
    artistId: string;
    cover: string;
    tracks: Track[];
    releaseDate: Date;
    genre: MusicGenre;
    description?: string;
}

export interface Artist {
    id: string;
    name: string;
    bio?: string;
    photoURL?: string;
    isVerified: boolean;
    genres: MusicGenre[];
    albums: string[]; // album IDs
    createdAt: Date;
}

// ============================================================================
// MUSIC SUBMISSION TYPES
// ============================================================================

export interface MusicSubmission {
    id: string;
    title: string;
    artist: string;
    artistEmail: string;
    trackUrl: string;
    coverUrl?: string;
    genre: MusicGenre;
    description?: string;
    status: TrackStatus;
    submittedBy: string; // user UID
    submittedAt: Date;
    reviewedAt?: Date;
    reviewedBy?: string; // admin UID
    rejectionReason?: string;
}

// ============================================================================
// PROPOSAL TYPES
// ============================================================================

export type ProposalStatus = 'pending' | 'approved' | 'rejected' | 'implemented';
export type ProposalCategory = 'feature' | 'bug' | 'improvement' | 'other';

export interface Proposal {
    id: string;
    title: string;
    description: string;
    category: ProposalCategory;
    status: ProposalStatus;
    author: string;
    authorUid: string | null;
    votes: number;
    voters: string[]; // user UIDs
    createdAt: Date;
    updatedAt?: Date;
    implementedAt?: Date;
    adminNotes?: string;
}

// ============================================================================
// BUG REPORT TYPES
// ============================================================================

export type BugSeverity = 'low' | 'medium' | 'high' | 'critical';
export type BugStatus = 'reported' | 'reviewing' | 'fixed' | 'not-a-bug';

export interface BugReport {
    id: string;
    title: string;
    description: string;
    steps: string;
    severity: BugSeverity;
    browser: string;
    os: string;
    author: string;
    authorUid: string | null;
    status: BugStatus;
    createdAt: Date;
    resolvedAt?: Date;
    adminNotes?: string;
}

// Game Types removed (Chess logic deprecated)

// ============================================================================
// TOURNAMENT TYPES
// ============================================================================

export type TournamentStatus = 'upcoming' | 'active' | 'completed';
export type TournamentFormat = 'single-elimination' | 'double-elimination' | 'round-robin';

export interface Tournament {
    id: string;
    name: string;
    description: string;
    format: TournamentFormat;
    status: TournamentStatus;
    startDate: Date;
    endDate?: Date;
    participants: string[]; // user UIDs
    maxParticipants: number;
    prize?: string;
    createdBy: string;
    createdAt: Date;
}

// ============================================================================
// BACKUP TYPES
// ============================================================================

export type BackupType = 'firestore' | 'r2';
export type BackupStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

export interface BackupRecord {
    id: string;
    type: BackupType;
    status: BackupStatus;
    startedAt: Date;
    completedAt?: Date;
    size?: number; // bytes
    location?: string; // GCS or R2 path
    error?: string;
    triggeredBy: string; // 'auto' | user UID
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    userId?: string; // if user-specific
    read: boolean;
    createdAt: Date;
    expiresAt?: Date;
    actionUrl?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        hasMore: boolean;
    };
}

// ============================================================================
// FIRESTORE CONVERSION HELPERS
// ============================================================================

/**
 * Converts Firestore Timestamp to Date
 */
export function timestampToDate(timestamp: Timestamp | Date | undefined): Date | undefined {
    if (!timestamp) return undefined;
    if (timestamp instanceof Date) return timestamp;
    return timestamp.toDate();
}

/**
 * Type guard for checking if value is a valid enum member
 */
export function isValidEnum<T extends string>(
    value: string,
    enumValues: readonly T[]
): value is T {
    return enumValues.includes(value as T);
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Make specific fields optional
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific fields required
 */
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Deep partial (all nested properties optional)
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
