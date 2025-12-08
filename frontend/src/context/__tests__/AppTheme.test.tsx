import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppTheme, useTheme } from '../AppTheme';

const TestConsumer = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button onClick={toggleTheme}>Change app theme</button>
    </div>
  );
};

describe('AppTheme Context', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    jest.clearAllMocks();
  });

  test('Use "dark" as the default theme if there is nothing in localStorage', () => {
    render(
      <AppTheme>
        <TestConsumer />
      </AppTheme>
    );

    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  test('Must start with "light" if stored in localStorage', () => {
    localStorage.setItem('theme', 'light');

    render(
      <AppTheme>
        <TestConsumer />
      </AppTheme>
    );

    expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });

  test('Change the theme and update localStorage when you run toggleTheme', () => {
    render(
      <AppTheme>
        <TestConsumer />
      </AppTheme>
    );

    const testButton = screen.getByText('Change app theme');

    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');

    fireEvent.click(testButton);

    expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(localStorage.getItem('theme')).toBe('light');

    fireEvent.click(testButton);

    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  test('It should throw an error if useTheme is used outside of the AppTheme Provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow('useTheme must be used within an AppTheme');

    consoleSpy.mockRestore();
  });
});
