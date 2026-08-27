import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { DestinationCombobox } from '@/components/booking/DestinationCombobox';

function Harness() {
  const [state, setState] = useState({ value: '', label: '' });
  return (
    <>
      <DestinationCombobox value={state.value} label={state.label} onChange={setState} />
      <output data-testid="resolved">{state.value}</output>
    </>
  );
}

describe('destination combobox', () => {
  it('exposes the ARIA combobox contract', () => {
    render(<Harness />);
    const input = screen.getByRole('combobox', { name: /where to next/i });
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
  });

  it('opens a listbox on focus and marks the active option', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('combobox', { name: /where to next/i }));

    expect(screen.getByRole('listbox', { name: /cities and hotels/i })).toBeInTheDocument();
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(0);
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('moves the virtual cursor with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByRole('combobox', { name: /where to next/i });
    await user.click(input);
    await user.keyboard('{ArrowDown}');

    const options = screen.getAllByRole('option');
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
    expect(input).toHaveAttribute('aria-activedescendant', options[1]!.id);
  });

  it('commits the highlighted option on Enter and resolves a slug', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByRole('combobox', { name: /where to next/i });
    await user.type(input, 'siligu');
    await user.keyboard('{Enter}');

    expect(input).toHaveValue('Siliguri');
    expect(screen.getByTestId('resolved')).toHaveTextContent('siliguri');
  });

  it('commits on click', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(screen.getByRole('combobox', { name: /where to next/i }), 'mumbai');

    // "mumbai" matches the city and Aurika Mumbai Skycity; the city ranks first.
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(1);
    await user.click(options[0]!);

    expect(screen.getByTestId('resolved')).toHaveTextContent('mumbai');
  });

  it('closes on Escape without clearing what was typed', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByRole('combobox', { name: /where to next/i });
    await user.type(input, 'aj');
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(input).toHaveValue('aj');
  });

  it('shows nothing for a query with no matches', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(screen.getByRole('combobox', { name: /where to next/i }), 'zzzz');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('flags destinations that have not opened', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(screen.getByRole('combobox', { name: /where to next/i }), 'ujjain');

    // Ujjain has no open hotel, so every match must be marked.
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(0);
    for (const option of options) {
      expect(option).toHaveTextContent(/opening soon/i);
    }
  });
});

describe('the listbox does not appear unasked', () => {
  it('stays closed when focus arrives programmatically', async () => {
    render(<Harness />);
    const input = screen.getByRole('combobox', { name: /where to next/i });
    input.focus();

    expect(input).toHaveFocus();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens on a deliberate click', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('combobox', { name: /where to next/i }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('opens on ArrowDown from a focused, closed field', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByRole('combobox', { name: /where to next/i });
    input.focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
});
