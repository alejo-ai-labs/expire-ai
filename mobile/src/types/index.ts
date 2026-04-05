// TypeScript type definitions for FoodTracker app

export interface FoodItem {
    id: string;
    name: string;
    purchaseDate: string; // ISO date string
    expirationDate: string; // ISO date string
    isEstimated: boolean;
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateFoodItemInput {
    name: string;
    purchaseDate: string;
    expirationDate: string;
    isEstimated?: boolean;
}

export interface UpdateFoodItemInput {
    name?: string;
    expirationDate?: string;
    isEstimated?: boolean;
}

export interface ScanReceiptResponse {
    items: ExtractedFoodItem[];
    rawText?: string;
}

export interface ExtractedFoodItem {
    name: string;
    estimatedExpirationDays: number;
    confidence: number;
}

export interface ScanLabelResponse {
    expirationDate: string | null;
    confidence: number;
}

export type TrafficLightStatus = 'green' | 'yellow' | 'red';

export interface FoodItemWithStatus extends FoodItem {
    status: TrafficLightStatus;
    daysUntilExpiration: number;
}

export interface UserProfile {
    name: string;
    lastName: string;
    email: string;
    birthday: string; // ISO date string (YYYY-MM-DD)
    weight: number;
    height: number;
    gender: string;
    country: string;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

// Error codes
export const ErrorCodes = {
    CAMERA_PERMISSION_DENIED: 'CAMERA_PERMISSION_DENIED',
    IMAGE_PROCESSING_FAILED: 'IMAGE_PROCESSING_FAILED',
    NO_ITEMS_FOUND: 'NO_ITEMS_FOUND',
    FOOD_ITEM_NOT_FOUND: 'FOOD_ITEM_NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
} as const;
