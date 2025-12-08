import { TextEncoder, TextDecoder } from 'util';
Object.assign(global, { TextEncoder, TextDecoder });
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VideoCard from '../VideoCard';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../utils/Env', () => ({
  getEnv: () => ({ API_BASE_URL: 'http://localhost:8080' }),
}));

describe('VideoCard Component', () => {
  const mockVideo = {
    id: '12345',
    title: 'Test title',
    user: 'Test user',
    username: 'TestUser',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Render video cover, title and author correctly', () => {
    render(
      <MemoryRouter>
        <ul>
          <VideoCard video={mockVideo} />
        </ul>
      </MemoryRouter>
    );

    expect(screen.getByText('Test title')).toBeInTheDocument();
    expect(screen.getByText(/Author: Test user/i)).toBeInTheDocument();

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt', mockVideo.title);
    expect(image).toHaveAttribute('src', `http://localhost:8080/api/videos/thumbnail/${mockVideo.id}`);
  });

  test('Navigate to the correct route by clicking on the card', () => {
    render(
      <MemoryRouter>
        <ul>
          <VideoCard video={mockVideo} />
        </ul>
      </MemoryRouter>
    );

    const card = screen.getByRole('img').closest('.card');

    // Simula el click
    fireEvent.click(card!);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(`/video/${mockVideo.id}`);
  });

  test('Use the default image if the image fails', () => {
    render(
      <MemoryRouter>
        <ul>
          <VideoCard video={mockVideo} />
        </ul>
      </MemoryRouter>
    );

    const image = screen.getByRole('img');
    fireEvent.error(image);

    expect(image).toHaveAttribute('src', expect.stringContaining('via.placeholder.com'));
  });

  test('Display "username" if "user" does not exist', () => {
    const videoWithUsername = { ...mockVideo, user: null, username: 'OtherUser' };

    render(
      <MemoryRouter>
        <ul>
          <VideoCard video={videoWithUsername} />
        </ul>
      </MemoryRouter>
    );

    expect(screen.getByText(/Author: OtherUser/i)).toBeInTheDocument();
  });

  test('', () => {
    render(
      <MemoryRouter>
        <ul>
          <VideoCard video={mockVideo} />
        </ul>
      </MemoryRouter>
    );

    const card = screen.getByRole('img').closest('.card');

    fireEvent.mouseEnter(card!);
    expect(card).toHaveStyle('transform: scale(1.03)');

    fireEvent.mouseLeave(card!);
    expect(card).toHaveStyle('transform: scale(1)');
  });
});
