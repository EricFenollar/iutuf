import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { getEnv } from './utils/Env';

type LoadingState = 'loading' | 'success' | 'error' | 'idle';

export function useUserVideos(username: string) {
  const [value, setValue] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('Loading...');
  const [loading, setLoading] = useState<LoadingState>('idle');

  const BASE_URL = `${getEnv().API_BASE_URL}/api/videos/user/${username}`;

  useEffect(() => {
    const getVideos = async () => {
      try {
        setLoading('loading');
        const response = await axios.get<string[]>(BASE_URL);

        if (response.status === 200) {
          setValue(response.data);
        }
        setLoading('success');
      } catch (error: unknown) {
        setLoading('error');
        setMessage('Error fetching videos: ' + (error as AxiosError).message);
      }
    };

    if (username) {
      getVideos();
    }
  }, [username]);

  return { value, message, loading };
}
