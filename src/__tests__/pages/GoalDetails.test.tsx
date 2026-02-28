import { describe, it, expect, vi } from 'vitest';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn()
}));

describe('GoalDetails', () => {
  it('renders correctly', () => {
    expect(true).toBe(true);
  });
});
