import { TextEncoder, TextDecoder } from 'util';
Object.assign(global, { TextEncoder, TextDecoder });
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import VideoUpload from '../VideoUpload';

jest.mock('axios');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockUseAuth = jest.fn();
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('../../utils/Env', () => ({
  getEnv: () => ({ API_BASE_URL: 'http://api-test.com' }),
}));

jest.mock('../VideoUpload.css', () => ({}));

describe('VideoUpload Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      username: 'TestUser',
      token: 'fake-token',
      isAuthenticated: true,
    });

    // Silencia console.error para que no ensucie el reporte cuando probamos los casos de error intencionados
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  test('Redirect to "/login" if the user is NOT authenticated', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });

    render(
      <MemoryRouter>
        <VideoUpload />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('The form must be rendered correctly', () => {
    render(
      <MemoryRouter>
        <VideoUpload />
      </MemoryRouter>
    );

    expect(screen.getByText('Upload Video')).toBeInTheDocument();
    expect(screen.getByTestId('title-input')).toBeInTheDocument();
    expect(screen.getByTestId('desc-input')).toBeInTheDocument();
    expect(screen.getByTestId('video-input')).toBeInTheDocument();
    expect(screen.getByTestId('upload-btn')).toBeInTheDocument();
  });

  test('Display an error if you try to upload without selecting a file', () => {
    render(
      <MemoryRouter>
        <VideoUpload />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByTestId('title-input'), { target: { value: 'Title' } });
    fireEvent.click(screen.getByTestId('upload-btn'));

    expect(screen.getByText('Please select a video file.')).toBeInTheDocument();
  });

  test('Perform a successful upload: Axios post and redirect', async () => {
    jest.useFakeTimers();

    (axios.post as jest.Mock).mockResolvedValueOnce({ data: { success: true } });

    render(
      <MemoryRouter>
        <VideoUpload />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByTestId('title-input'), { target: { value: 'My new video' } });
    fireEvent.change(screen.getByTestId('desc-input'), { target: { value: 'Epic description' } });

    const videoFile = new File(['(video content)'], 'video.mp4', { type: 'video/mp4' });
    const thumbFile = new File(['(img content)'], 'thumb.jpg', { type: 'image/jpeg' });

    const videoInput = screen.getByTestId('video-input');
    const thumbInput = screen.getByTestId('thumb-input');

    fireEvent.change(videoInput, { target: { files: [videoFile] } });
    fireEvent.change(thumbInput, { target: { files: [thumbFile] } });

    fireEvent.click(screen.getByTestId('upload-btn'));

    await waitFor(() => {
      expect(screen.getByText('Upload successful!')).toBeInTheDocument();

      expect(axios.post).toHaveBeenCalledWith(
        'http://api-test.com/api/videos/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: { Authorization: 'Bearer fake-token' },
        })
      );
    });

    // Fuerza que pase el tiempo y procesa los cambios de estado (setUploading, navigate)"
    act(() => {
      jest.runAllTimers();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/');
    jest.useRealTimers();
  });

  test('It must handle upload errors (API failure)', async () => {
    (axios.post as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: 'Unsupported format' } },
    });

    render(
      <MemoryRouter>
        <VideoUpload />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByTestId('title-input'), { target: { value: 'Video Fail' } });

    const videoFile = new File(['...'], 'video.mp4', { type: 'video/mp4' });
    fireEvent.change(screen.getByTestId('video-input'), { target: { files: [videoFile] } });

    const thumbFile = new File(['(img)'], 'thumb.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByTestId('thumb-input'), { target: { files: [thumbFile] } });

    fireEvent.click(screen.getByTestId('upload-btn'));

    await waitFor(() => {
      expect(screen.getByText('Unsupported format')).toBeInTheDocument();
    });
  });

  test('Handle generic upload errors (Network Error)', async () => {
    (axios.post as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

    render(
      <MemoryRouter>
        <VideoUpload />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByTestId('title-input'), { target: { value: 'Video Net Fail' } });

    const videoFile = new File(['...'], 'video.mp4', { type: 'video/mp4' });
    fireEvent.change(screen.getByTestId('video-input'), { target: { files: [videoFile] } });

    const thumbFile = new File(['(img)'], 'thumb.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByTestId('thumb-input'), { target: { files: [thumbFile] } });

    fireEvent.click(screen.getByTestId('upload-btn'));

    await waitFor(() => {
      expect(screen.getByText('Network Error')).toBeInTheDocument();
    });
  });
});
