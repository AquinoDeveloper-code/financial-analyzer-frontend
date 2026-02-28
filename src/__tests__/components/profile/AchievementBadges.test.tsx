import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import AchievementBadges from '../../../components/profile/AchievementBadges';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('axios');

describe('AchievementBadges', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <AchievementBadges />
      </MemoryRouter>
    );
  };

  it('renders loading state initially', () => {
    (axios.get as jest.Mock).mockImplementation(() => new Promise(() => {}));
    renderComponent();
    expect(screen.getByText('Suas Conquistas')).toBeInTheDocument();
  });

  it('loads badges and calculates correctly based on API array data', async () => {
    // Mock the /goals/ API to return an array (fixing the .data.data bug)
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: [{ id: 'g1', current_amount: 1500, target_amount: 2000, status: 'active' }]
    });

    // Mock the /goals/g1/contributions API
    const today = new Date().toLocaleDateString('sv-SE'); // Local ISO equivalent
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: [
        { id: 'c1', amount: 500, type: 'deposit', date: today }, // Primeiro Passo
      ]
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/desbloqueadas/i)).toBeInTheDocument();
    });

    // Elite should be unlocked (>= 1000)
    // Primeiro passo unlocked (>= 1 contribution)
    expect(screen.getByText('2/5 desbloqueadas')).toBeInTheDocument();
  });
});
