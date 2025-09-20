export interface ChildProfile {
	id: string;
	parent_user_id: string;
	name: string;
	year_level: number;
	age: number;
	gender: 'boy' | 'girl' | 'other';
	preferences: {
		favoriteGenres: string[];
		contentFilters: string[];
		allowedTopics: string[];
		blockedTopics: string[];
	};
	created_at: string;
	updated_at: string;
}

export interface CreateChildProfileRequest {
	name: string;
	year_level: number;
	age: number;
	gender: 'boy' | 'girl' | 'other';
	preferences: {
		favoriteGenres: string[];
		contentFilters: string[];
		allowedTopics: string[];
		blockedTopics: string[];
	};
}

export interface UpdateChildProfileRequest {
	name?: string;
	year_level?: number;
	age?: number;
	gender?: 'boy' | 'girl' | 'other';
	preferences?: {
		favoriteGenres?: string[];
		contentFilters?: string[];
		allowedTopics?: string[];
		blockedTopics?: string[];
	};
}