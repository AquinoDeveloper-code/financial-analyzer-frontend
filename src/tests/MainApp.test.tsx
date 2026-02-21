import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MainApp from '../pages/MainApp';

// Mock matchMedia, which is not supported by JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), 
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('MainApp Component', () => {
  it('renders without crashing', () => {
    render(<MainApp />);
    const heading = screen.getByText(/Analisador Financeiro IA/i);
    expect(heading).toBeInTheDocument();
  });
});
