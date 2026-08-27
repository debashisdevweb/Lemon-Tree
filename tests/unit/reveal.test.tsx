import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Reveal } from '@/components/primitives/Reveal';
import { REVEAL_DELAYS } from '@/lib/tokens/motion';

describe('Reveal', () => {
  it('renders its children and reveals when observed', () => {
    render(<Reveal>Visible content</Reveal>);
    const node = screen.getByText('Visible content');
    // The test IntersectionObserver reports intersection immediately.
    expect(node).toHaveAttribute('data-revealed', 'true');
  });

  it('carries the reveal duration and easing tokens, not literals', () => {
    render(<Reveal>Timed</Reveal>);
    const className = screen.getByText('Timed').className;
    expect(className).toContain('duration-[var(--dur-reveal)]');
    expect(className).toContain('ease-[var(--ease-reveal)]');
  });

  it('uses the faster duration when asked', () => {
    render(<Reveal fast>Fast</Reveal>);
    expect(screen.getByText('Fast').className).toContain('duration-[var(--dur-reveal-fast)]');
  });

  it('applies a stagger delay as a transition delay', () => {
    render(<Reveal delay={270}>Staggered</Reveal>);
    expect(screen.getByText('Staggered')).toHaveStyle({ transitionDelay: '270ms' });
  });

  it('sets no delay style at all when the stagger is zero', () => {
    render(<Reveal>No delay</Reveal>);
    expect(screen.getByText('No delay').getAttribute('style')).toBeNull();
  });

  it('renders as the requested element', () => {
    render(<Reveal as="article">Article</Reveal>);
    expect(screen.getByText('Article').tagName).toBe('ARTICLE');
  });

  it('only permits delays that exist in the motion inventory', () => {
    // The artboard's data-delay values, plus 0.
    expect([...REVEAL_DELAYS]).toEqual([
      0, 90, 110, 120, 140, 180, 200, 220, 260, 270, 280, 340, 360,
    ]);
  });
});
