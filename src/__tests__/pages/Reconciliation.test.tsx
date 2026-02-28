import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Reconciliation from '../../pages/Reconciliation';

// Mock the outlet context
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useOutletContext: () => ({
      history: [
        { doc_hash: '123', tipo: 'fatura', created_at: '2023-10-01' },
        { doc_hash: '456', tipo: 'extrato', created_at: '2023-10-02' }
      ],
      apiUrl: 'http://localhost:8000/api/v1'
    })
  };
});

describe('Reconciliation Dashboard', () => {
  it('renders the reconciliation page correctly', () => {
    render(
      <BrowserRouter>
        <Reconciliation />
      </BrowserRouter>
    );
    
    // Check main title
    expect(screen.getByText('Conciliação de Relatórios')).toBeInTheDocument();
    
    // Check selects
    expect(screen.getByText('Relatório de Origem (Saídas)')).toBeInTheDocument();
    expect(screen.getByText('Relatório de Destino (Entradas)')).toBeInTheDocument();
    
    // Check items loaded from context mock
    expect(screen.getAllByText(/FATURA -/i)).toHaveLength(2); // One per select
    expect(screen.getAllByText(/EXTRATO -/i)).toHaveLength(2); // One per select
    
    // Check submit button
    expect(screen.getByRole('button', { name: /Iniciar Conciliação/i })).toBeInTheDocument();
  });
});
