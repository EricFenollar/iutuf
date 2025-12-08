import { TextEncoder, TextDecoder } from 'util';
Object.assign(global, { TextEncoder, TextDecoder });
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import UserProfile from '../UserProfile';

const mockUseAuth = jest.fn();
const mockLogout = jest.fn();
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const mockUseUserVideos = jest.fn();
jest.mock('../../useUserVideos', () => ({
  useUserVideos: (userId: string) => mockUseUserVideos(userId),
}));

jest.mock('../../context/AppTheme', () => ({
  useTheme: () => ({ theme: 'dark', toggleTheme: jest.fn() }),
}));

jest.mock('../../components/VideoGrid', () => ({
  __esModule: true,
  default: ({ videos }: { videos: any[] }) => <div data-testid="video-grid-mock">Grid with {videos.length} videos</div>,
}));

jest.mock('../UserProfile.css', () => ({}));
jest.mock('../../utils/Env', () => ({ getEnv: () => ({}) }));

describe('UserProfile Component', () => {
  const mockVideos = [
    { id: 1, title: 'Uploaded video 1' },
    { id: 2, title: 'Uploaded video 2' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: 'TestUser',
      isAuthenticated: true,
      logout: mockLogout,
    });

    mockUseUserVideos.mockReturnValue({
      loading: 'success',
      value: mockVideos,
      message: '',
    });
  });

  const renderWithRouter = (usernameParam: string) => {
    render(
      <MemoryRouter initialEntries={[`/profile/${usernameParam}`]}>
        <Routes>
          <Route path="/profile/:username" element={<UserProfile />} />
          <Route path="/" element={<div>Home page</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  test('Display "Loading..." while loading the videos', () => {
    mockUseUserVideos.mockReturnValue({ loading: 'loading', value: [] });

    renderWithRouter('TestUser');

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('Display an error message if the upload fails', () => {
    mockUseUserVideos.mockReturnValue({
      loading: 'error',
      message: 'Error loading profile',
      value: [],
    });

    renderWithRouter('TestUser');

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Error loading profile')).toBeInTheDocument();
  });

  test('Show "Your Videos" if the profile belongs to the logged-in user', () => {
    renderWithRouter('TestUser');

    expect(screen.getByText('Your Videos')).toBeInTheDocument();
    expect(screen.getByTestId('video-grid-mock')).toHaveTextContent('Grid with 2 videos');

    const uploadLink = screen.getByText('Upload');
    expect(uploadLink).toHaveAttribute('href', '/upload');
  });

  test('Display "Name`s Videos" if it is another user', () => {
    renderWithRouter('OtherUser');

    expect(screen.getByText("OtherUser's Videos")).toBeInTheDocument();

    const uploadLink = screen.getByText('Upload');
    expect(uploadLink).toHaveAttribute('href', '/profile');
  });

  test('Display a custom "no videos" message (own profile)', () => {
    mockUseUserVideos.mockReturnValue({ loading: 'success', value: [] });

    renderWithRouter('TestUser');

    expect(screen.getByText("You haven't uploaded any videos yet.")).toBeInTheDocument();
  });

  test('Display a custom "no videos" message (other user profile)', () => {
    mockUseUserVideos.mockReturnValue({ loading: 'success', value: [] });

    renderWithRouter('OtherUser');

    expect(screen.getByText("OtherUser hasn't uploaded any videos yet.")).toBeInTheDocument();
  });

  test('Call logout when you click the link', () => {
    renderWithRouter('TestUser');

    const logoutLink = screen.getByText('Logout');
    fireEvent.click(logoutLink);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
