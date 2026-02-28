import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PiggyBankAvatar from '../../components/goals/PiggyBankAvatar';

describe('PiggyBankAvatar Component', () => {

  it('renders the SVG piggy bank structure correctly', () => {
    const { container } = render(<PiggyBankAvatar progress={0} />);
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('scales visually when progress is at 100%', () => {
    const { container } = render(<PiggyBankAvatar progress={100} />);
    const svgElement = container.querySelector('svg');
    
    // Scale formula in component is: 0.5 + Math.min(progress / 100, 1) * 0.5
    // Therefore, progress 100 should strictly equalize to scale(1)
    expect(svgElement).toHaveStyle('transform: scale(1)');
  });

  it('shows animated dropping coin when progress is greater than 0', () => {
    const { container } = render(<PiggyBankAvatar progress={50} />);
    
    // Look for the absolute element wrapping the coin icon
    const absoluteDiv = container.querySelector('.absolute.-top-6.animate-bounce');
    expect(absoluteDiv).toBeInTheDocument();
  });

  it('hides animated coin when progress is exactly 0', () => {
    const { container } = render(<PiggyBankAvatar progress={0} />);
    const absoluteDiv = container.querySelector('.absolute.-top-6.animate-bounce');
    expect(absoluteDiv).not.toBeInTheDocument();
  });

  it('hides animated coin when Piggy theme is sad even if progress > 0', () => {
    const { container } = render(<PiggyBankAvatar progress={20} theme="sad" />);
    const absoluteDiv = container.querySelector('.absolute.-top-6.animate-bounce');
    expect(absoluteDiv).not.toBeInTheDocument();
  });

});
