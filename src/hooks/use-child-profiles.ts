import { useState, useCallback } from 'react';
import { ChildProfile, CreateChildProfileRequest, UpdateChildProfileRequest } from '@/types/child-profile';

export const useChildProfiles = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchChildProfiles = useCallback(async (): Promise<ChildProfile[]> => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch('/api/child-profiles', {
				method: 'GET',
				credentials: 'include',
			});

			if (!response.ok) {
				throw new Error('Failed to fetch child profiles');
			}

			const data = await response.json();

			if (!data.success) {
				throw new Error(data.error || 'Failed to fetch child profiles');
			}

			return data.profiles;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
			setError(errorMessage);
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	const createChildProfile = useCallback(async (profileData: CreateChildProfileRequest): Promise<ChildProfile> => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch('/api/child-profiles', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify(profileData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to create child profile');
			}

			const data = await response.json();

			if (!data.success) {
				throw new Error(data.error || 'Failed to create child profile');
			}

			return data.profile;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
			setError(errorMessage);
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	const updateChildProfile = useCallback(async (id: string, updates: UpdateChildProfileRequest): Promise<ChildProfile> => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch(`/api/child-profiles/${id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify(updates),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to update child profile');
			}

			const data = await response.json();

			if (!data.success) {
				throw new Error(data.error || 'Failed to update child profile');
			}

			return data.profile;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
			setError(errorMessage);
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	const deleteChildProfile = useCallback(async (id: string): Promise<void> => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch(`/api/child-profiles/${id}`, {
				method: 'DELETE',
				credentials: 'include',
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to delete child profile');
			}

			const data = await response.json();

			if (!data.success) {
				throw new Error(data.error || 'Failed to delete child profile');
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
			setError(errorMessage);
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	const getChildProfile = useCallback(async (id: string): Promise<ChildProfile> => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch(`/api/child-profiles/${id}`, {
				method: 'GET',
				credentials: 'include',
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to fetch child profile');
			}

			const data = await response.json();

			if (!data.success) {
				throw new Error(data.error || 'Failed to fetch child profile');
			}

			return data.profile;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
			setError(errorMessage);
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	return {
		loading,
		error,
		fetchChildProfiles,
		createChildProfile,
		updateChildProfile,
		deleteChildProfile,
		getChildProfile,
	};
};