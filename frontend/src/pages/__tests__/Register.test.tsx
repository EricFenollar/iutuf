import { TextEncoder, TextDecoder } from 'util';
Object.assign(global, { TextEncoder, TextDecoder });
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from '../Register';

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

jest.mock('../../context/AppTheme', () => ({
  useTheme: () => ({ theme: 'dark', toggleTheme: jest.fn() }),
}));

jest.mock('../../utils/Env', () => ({
  getEnv: () => ({ API_BASE_URL: 'http://api-test.com' }),
}));

jest.mock('../Auth.css', () => ({}));

describe('Register Component', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();

    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  test('Render all fields of the form', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
    expect(screen.getByText('Back to login')).toBeInTheDocument();
  });

  test('Allow writing to the inputs', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('Email');
    const userInput = screen.getByPlaceholderText('Username');

    fireEvent.change(emailInput, { target: { value: 'test@email.com' } });
    fireEvent.change(userInput, { target: { value: 'NewUser' } });

    expect(emailInput).toHaveValue('test@email.com');
    expect(userInput).toHaveValue('NewUser');
  });

  test('Display alert and not send data if the passwords do not match', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@valid.com' } });
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'UserTest' } });

    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: '1234' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: '5678' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(window.alert).toHaveBeenCalledWith('Password mismatch');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('Register successfully: call API, log in and redirect', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'new@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'NewUser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pass123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: 'pass123' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://api-test.com/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"username":"NewUser"'),
        })
      );

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const bodyObj = JSON.parse(callArgs[1].body);

      expect(bodyObj).toEqual({
        id: expect.any(Number),
        email: 'new@test.com',
        username: 'NewUser',
        password: 'pass123',
      });

      expect(mockLogin).toHaveBeenCalledWith('NewUser');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('Should redirect to "/error" if the API fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      text: async () => 'Internal error',
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'error@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'ErrorUser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pass123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: 'pass123' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/error');
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });
});
