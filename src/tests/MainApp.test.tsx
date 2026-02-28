import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MainApp from '../pages/MainApp';
import { BrowserRouter } from 'react-router-dom';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useOutletContext: () => ({ apiUrl: 'http://localhost' }),
    useLocation: () => ({ search: '' }),
    useNavigate: () => vi.fn()
  };
});

describe('MainApp Component', () => {
  it('renders without crashing', () => {
    render(
       <BrowserRouter>
         <MainApp />
       </BrowserRouter>
    );
    expect(screen.getByText(/Nenhum documento selecionado/i)).toBeInTheDocument();
  });
});
