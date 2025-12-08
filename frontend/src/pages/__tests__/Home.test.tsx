import { TextEncoder, TextDecoder } from 'util';
Object.assign(global, { TextEncoder, TextDecoder });
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../Home';

const mockUseAllVideos = jest.fn();
jest.mock('../../useAllVideos', () => ({
  useAllVideos: () => mockUseAllVideos(),
}));

const mockUseAuth = jest.fn();
const mockLogout = jest.fn();
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const mockToggleTheme = jest.fn();
jest.mock('../../context/AppTheme', () => ({
  useTheme: () => ({
    theme: 'dark',
    toggleTheme: mockToggleTheme,
  }),
}));

jest.mock('../../components/VideoGrid', () => {
  return {
    __esModule: true,
    default: ({ videos }: { videos: any[] }) => (
      <div data-testid="video-grid-mock">
        {videos.map((v) => (
          <div key={v.id}>{v.title}</div>
        ))}
      </div>
    ),
  };
});

jest.mock('../Home.css', () => ({}));

const mockVideosData = [
  { id: 1, title: 'Title 1' },
  { id: 2, title: 'Tutorial 2' },
  { id: 3, title: 'Sample 3' },
];

describe('Home Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Configuración por defecto
    mockUseAllVideos.mockReturnValue({
      loading: 'success',
      message: '',
      value: mockVideosData,
    });

    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      username: null,
      logout: mockLogout,
    });
  });

  test('It should display "Loading..." when loading is "loading"', () => {
    mockUseAllVideos.mockReturnValue({ loading: 'loading', value: [] });

    render(<Home />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('It should display an error message when loading is "error"', () => {
    mockUseAllVideos.mockReturnValue({
      loading: 'error',
      message: 'Failed to connect',
      value: [],
    });

    render(<Home />);

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to connect')).toBeInTheDocument();
  });

  test('Render the grid with all the videos when it loads successfully', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('Title 1')).toBeInTheDocument();
    expect(screen.getByText('Tutorial 2')).toBeInTheDocument();
    expect(screen.getByText('Sample 3')).toBeInTheDocument();
  });

  test('Filter the videos when the user types in the search bar', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('Search videos...');

    fireEvent.change(input, { target: { value: 'Title' } });

    expect(screen.getByText('Title 1')).toBeInTheDocument();
    expect(screen.queryByText('Sample 3')).not.toBeInTheDocument();
  });

  test('Display a login button if the user is not authenticated', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const loginLink = screen.getByText('Login');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');

    expect(screen.queryByText('My Profile')).not.toBeInTheDocument();
  });

  test('Call toggleTheme when you click the theme button', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    //Como es oscuro por defecto, el icono que muestra es el del modo claro
    const themeBtn = screen.getByText('☀️');

    fireEvent.click(themeBtn);

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
});
