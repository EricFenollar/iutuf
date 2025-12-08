import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

const TestAuthConsumer = () => {
  const { username, login, logout, isAuthenticated } = useAuth() as any;

  return (
    <div>
      <span data-testid="username-display">{username || 'Guest'}</span>
      <span data-testid="auth-status">{isAuthenticated ? 'LOGGED_IN' : 'LOGGED_OUT'}</span>

      <button onClick={() => login('TestUser')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('It should start as unauthenticated (null) if there is nothing in localStorage', () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('username-display')).toHaveTextContent('Guest');
    expect(screen.getByTestId('auth-status')).toHaveTextContent('LOGGED_OUT');
  });

  test('You should log in automatically if a user exists in localStorage', () => {
    localStorage.setItem('username', 'LogedUser');

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('username-display')).toHaveTextContent('LogedUser');
    expect(screen.getByTestId('auth-status')).toHaveTextContent('LOGGED_IN');
  });

  test('Must update the status and localStorage upon logging in', () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login'));

    expect(screen.getByTestId('username-display')).toHaveTextContent('TestUser');
    expect(screen.getByTestId('auth-status')).toHaveTextContent('LOGGED_IN');

    expect(localStorage.getItem('username')).toBe('TestUser');
  });

  test('Must clear the state and localStorage when logging out', () => {
    localStorage.setItem('username', 'UserToDelete');

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('username-display')).toHaveTextContent('UserToDelete');

    fireEvent.click(screen.getByText('Logout'));

    expect(screen.getByTestId('username-display')).toHaveTextContent('Guest');
    expect(screen.getByTestId('auth-status')).toHaveTextContent('LOGGED_OUT');

    expect(localStorage.getItem('username')).toBeNull();
  });
});
