import { TextEncoder, TextDecoder } from 'util';
Object.assign(global, { TextEncoder, TextDecoder });
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Video from '../Video';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: '123' }), // Simula que estamos en /video/123
}));

const mockUseAuth = jest.fn();
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('../../utils/Env', () => ({
  getEnv: () => ({ API_BASE_URL: 'http://api-test.com' }),
}));

jest.mock('../Video.css', () => ({}));

const mockVideoData = {
  id: '123',
  title: 'Test Video',
  categories: 'Education',
  likeCount: 10,
  dislikeCount: 2,
  reaction: null,
  meta: {
    description: 'Line 1\nLine 2\nLine 3\nLine 4', //4 líneas para poder probar el "Show more"
    tags: ['react', 'testing'],
    comments: [
      { author: 'UserA', text: 'Great video!' },
      { author: 'UserB', text: 'Thanks' },
    ],
  },
};

describe('Video Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      username: 'TestUser',
      isAuthenticated: true,
    });

    global.fetch = jest.fn();
  });

  const renderVideo = async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockVideoData,
    });

    render(
      <MemoryRouter>
        <Video />
      </MemoryRouter>
    );

    // Esperar a que desaparezca el "Loading..."
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  };

  test('It must load and render the video information correctly', async () => {
    await renderVideo();

    //Título y categoría
    expect(screen.getByText('Test Video')).toBeInTheDocument();
    expect(screen.getByText(/Category:/)).toBeInTheDocument();

    // Tags
    expect(screen.getByText('#react')).toBeInTheDocument();

    // Comentarios existentes
    expect(screen.getByText('Great video!')).toBeInTheDocument();

    // Video Player
    const source = document.querySelector('source');
    expect(source).toHaveAttribute('src', 'http://api-test.com/api/videos/123');
  });

  test('Navigate back by pressing the close button (✖)', async () => {
    await renderVideo();

    const closeBtn = screen.getByText('✖');
    fireEvent.click(closeBtn);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test('Update the counters when you click Like', async () => {
    await renderVideo();

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        likeCount: 11,
        dislikeCount: 2,
        reaction: 'like',
      }),
    });

    const likeBtn = screen.getByText(/👍 10/i);
    fireEvent.click(likeBtn);

    await waitFor(() => {
      expect(screen.getByText(/👍 11/i)).toBeInTheDocument();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/like?username=TestUser'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  test('Update the counters when you click Dislike', async () => {
    await renderVideo();

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        likeCount: 10,
        dislikeCount: 3,
        reaction: 'dislike',
      }),
    });

    const dislikeBtn = screen.getByText(/👎 2/i);
    fireEvent.click(dislikeBtn);

    await waitFor(() => {
      expect(screen.getByText(/👎 3/i)).toBeInTheDocument();
    });
  });

  test('Alternate between "Show more" and "Show less" (description)', async () => {
    await renderVideo();

    const toggleBtn = screen.getByText('Show more');
    expect(toggleBtn).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.getByText('Show less')).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.getByText('Show more')).toBeInTheDocument();
  });

  test('Send a comment by pressing Enter', async () => {
    await renderVideo();

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const input = screen.getByPlaceholderText('Add a comment...');

    fireEvent.change(input, { target: { value: 'My comment' } });

    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/comments'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ text: 'My comment', author: 'TestUser' }),
        })
      );
      expect(input).toHaveValue('');
    });
  });

  test('It should not display input if the user is NOT authenticated (comments)', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, username: null });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockVideoData,
    });

    render(
      <MemoryRouter>
        <Video />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

    expect(screen.queryByPlaceholderText('Add a comment...')).not.toBeInTheDocument();
  });

  test('Display an alert if sending the comment fails', async () => {
    await renderVideo();

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      text: async () => 'Forbidden error',
    });

    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    const input = screen.getByPlaceholderText('Add a comment...');
    fireEvent.change(input, { target: { value: 'Failed comment' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Forbidden error');
      // El input no se limpia si falla
      expect(input).toHaveValue('Failed comment');
    });
    alertSpy.mockRestore();
  });

  test('It should do nothing if a key other than Enter is pressed (comments)', async () => {
    await renderVideo();

    const input = screen.getByPlaceholderText('Add a comment...');

    fireEvent.change(input, { target: { value: 'Sample text' } });
    fireEvent.keyDown(input, { key: 'a', code: 'KeyA' });

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('Do not submit a comment if it is empty or consists only of spaces', async () => {
    await renderVideo();

    const input = screen.getByPlaceholderText('Add a comment...');

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('LIKE should not explode if the API fails (response.ok = false)', async () => {
    await renderVideo();

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false, // Esto activa el: if (!response.ok) return;
      json: async () => ({}),
    });

    const likeBtn = screen.getByText(/👍 10/i);
    fireEvent.click(likeBtn);

    await waitFor(() => {
      // El contador no cambia
      expect(screen.getByText(/👍 10/i)).toBeInTheDocument();
    });
  });

  test('DISLIKE should not explode if there is a network error)', async () => {
    await renderVideo();

    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

    const dislikeBtn = screen.getByText(/👎 2/i);
    fireEvent.click(dislikeBtn);

    await waitFor(() => {
      // El contador no cambia
      expect(screen.getByText(/👎 2/i)).toBeInTheDocument();
    });
  });
});
