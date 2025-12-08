import { TextEncoder, TextDecoder } from 'util';
Object.assign(global, { TextEncoder, TextDecoder });
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockLogin = jest.fn();
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

jest.mock('../../utils/Env', () => ({
  getEnv: () => ({ API_BASE_URL: 'http://api-test.com' }),
}));

jest.mock('../Auth.css', () => ({}));

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test('The form must be rendered correctly', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('User')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    // Usar el role 'button' y el nombre para distinguir entre Login y Sign up
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  test('Allow typing in the username and password fields', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const userInput = screen.getByPlaceholderText('User');
    const passInput = screen.getByPlaceholderText('Password');

    // Simula escribir
    fireEvent.change(userInput, { target: { value: 'TestUser' } });
    fireEvent.change(passInput, { target: { value: '123456' } });

    expect(userInput).toHaveValue('TestUser');
    expect(passInput).toHaveValue('123456');
  });

  test('Log in successfully: call the API, use context and redirect to "/"', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'fake-token' }),
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('User'), { target: { value: 'TestUser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://api-test.com/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ username: 'TestUser', password: 'password123' }),
        })
      );

      expect(mockLogin).toHaveBeenCalledWith('TestUser');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('Handle login errors: redirect to "/error" if the API fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false, // Dispara 'throw new Error'
      text: async () => 'Invalid credentials',
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('User'), { target: { value: 'WrongUser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: '123' } });

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/error');
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  test('Handle network errors: redirects to "/error"', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network failure'));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/error');
    });
  });
});
