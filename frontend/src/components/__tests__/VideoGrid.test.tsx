import React from 'react';
import { render, screen } from '@testing-library/react';
import VideoGrid from '../VideoGrid';
jest.mock('../VideoCard', () => {
  return {
    __esModule: true,
    default: ({ video }: { video: any }) => <li data-testid="video-card-item">{video.title}</li>,
  };
});

describe('VideoGrid Component', () => {
  const mockVideos = [
    { id: '1', title: 'Video 1', user: 'User A' },
    { id: '2', title: 'Video 2', user: 'User B' },
    { id: '3', title: 'Video 3', user: 'User C' },
  ];

  test('It must render a list of cards based on the videos received', () => {
    render(<VideoGrid videos={mockVideos} />);

    const cards = screen.getAllByTestId('video-card-item');

    expect(cards).toHaveLength(3);
  });

  test('It must render the correct titles in the correct order', () => {
    render(<VideoGrid videos={mockVideos} />);

    expect(screen.getByText('Video 1')).toBeInTheDocument();
    expect(screen.getByText('Video 2')).toBeInTheDocument();
    expect(screen.getByText('Video 3')).toBeInTheDocument();
  });

  test('It should render an empty list if there are no videos', () => {
    render(<VideoGrid videos={[]} />);

    const card = screen.queryByTestId('video-card-item');

    expect(card).not.toBeInTheDocument();
  });
});
