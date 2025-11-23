import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { getEnv } from './utils/Env';

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export function useUserVideos(userId: string | number) {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState<LoadingState>('idle');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (!userId) return;

    const fetchVideos = async () => {
      try {
        setLoading('loading');
        const response = await axios.get(`${getEnv().API_BASE_URL}/api/videos/user/${userId}`);
        setVideos(response.data);
        setLoading('success');
      } catch (error: unknown) {
        setLoading('error');
        setMessage('Error fetching user videos: ' + ((error as AxiosError).message || 'Unknown error'));
      }
    };

    fetchVideos();
  }, [userId]);

  return { videos, loading, message };
}
