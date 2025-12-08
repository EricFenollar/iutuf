import { TextEncoder, TextDecoder } from 'util';
Object.assign(global, { TextEncoder, TextDecoder });
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

jest.mock('./pages/Home', () => ({
  __esModule: true,
  default: () => <div data-testid="page-home">Home Component</div>,
}));

jest.mock('./pages/Login', () => ({
  __esModule: true,
  default: () => <div data-testid="page-login">Login Component</div>,
}));

jest.mock('./pages/Register', () => ({
  __esModule: true,
  default: () => <div data-testid="page-register">Register Component</div>,
}));

jest.mock('./pages/Video', () => ({
  __esModule: true,
  default: () => <div data-testid="page-video">Video Component</div>,
}));

jest.mock('./pages/UserProfile', () => ({
  __esModule: true,
  default: () => <div data-testid="page-profile">UserProfile Component</div>,
}));

jest.mock('./pages/VideoUpload', () => ({
  __esModule: true,
  default: () => <div data-testid="page-upload">VideoUpload Component</div>,
}));

jest.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('App Routing', () => {
  test('Render the Home page in the root path "/"', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('page-home')).toBeInTheDocument();
  });

  test('Login must be rendered on the path "/login"', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('page-login')).toBeInTheDocument();
  });

  test('Render Register in the path "/register"', () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('page-register')).toBeInTheDocument();
  });

  test('Render Upload to the path "/upload"', () => {
    render(
      <MemoryRouter initialEntries={['/upload']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('page-upload')).toBeInTheDocument();
  });

  test('Render Video Player to a dynamic path "/video/:id"', () => {
    render(
      <MemoryRouter initialEntries={['/video/123']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('page-video')).toBeInTheDocument();
  });

  test('Render User Profile to a dynamic path "/profile/:id"', () => {
    render(
      <MemoryRouter initialEntries={['/profile/DevExperto']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('page-profile')).toBeInTheDocument();
  });
});
