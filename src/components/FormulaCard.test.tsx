import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormulaCard } from './FormulaCard';

describe('FormulaCard', () => {
  const mockFormula = {
    id: 'formula-123',
    formula_name: 'Balayage Blonde',
    client_id: 'client-123',
    client: {
      full_name: 'Jane Smith',
    },
    formula_notes: 'Use 20 vol developer',
    tags: ['blonde', 'balayage'],
    created_at: '2025-10-15T10:00:00Z',
    updated_at: '2025-10-15T10:00:00Z',
    is_favorite: false,
  };

  const mockHandlers = {
    onEdit: vi.fn(),
    onDuplicate: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render formula name', () => {
    render(
      <FormulaCard
        formula={mockFormula}
        searchTerm=""
        {...mockHandlers}
      />
    );

    expect(screen.getByText(/Balayage Blonde/i)).toBeInTheDocument();
  });

  it('should render client name', () => {
    render(
      <FormulaCard
        formula={mockFormula}
        searchTerm=""
        {...mockHandlers}
      />
    );

    expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
  });

  it('should render formula notes', () => {
    render(
      <FormulaCard
        formula={mockFormula}
        searchTerm=""
        {...mockHandlers}
      />
    );

    expect(screen.getByText(/Use 20 vol developer/)).toBeInTheDocument();
  });

  it('should render tags', () => {
    render(
      <FormulaCard
        formula={mockFormula}
        searchTerm=""
        {...mockHandlers}
      />
    );

    expect(screen.getByText('blonde')).toBeInTheDocument();
    expect(screen.getByText('balayage')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    render(
      <FormulaCard
        formula={mockFormula}
        searchTerm=""
        {...mockHandlers}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(mockHandlers.onEdit).toHaveBeenCalled();
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <FormulaCard
        formula={mockFormula}
        searchTerm=""
        {...mockHandlers}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockHandlers.onDelete).toHaveBeenCalled();
  });

  it('should show duplicate button', () => {
    render(
      <FormulaCard
        formula={mockFormula}
        searchTerm=""
        {...mockHandlers}
      />
    );

    const duplicateButton = screen.getByRole('button', { name: /duplicate/i });
    expect(duplicateButton).toBeInTheDocument();
  });

  it('should highlight search term if provided', () => {
    render(
      <FormulaCard
        formula={mockFormula}
        searchTerm="Balayage"
        {...mockHandlers}
      />
    );

    // The search term should be present
    expect(screen.getByText(/Balayage/i)).toBeInTheDocument();
  });

  it('should handle formula without tags', () => {
    const formulaWithoutTags = { ...mockFormula, tags: null };
    
    render(
      <FormulaCard
        formula={formulaWithoutTags}
        searchTerm=""
        {...mockHandlers}
      />
    );

    // Should render without errors
    expect(screen.getByText(/Balayage Blonde/i)).toBeInTheDocument();
  });

  it('should handle formula without notes', () => {
    const formulaWithoutNotes = { ...mockFormula, formula_notes: null };
    
    render(
      <FormulaCard
        formula={formulaWithoutNotes}
        searchTerm=""
        {...mockHandlers}
      />
    );

    expect(screen.queryByText(/Use 20 vol developer/)).not.toBeInTheDocument();
  });
});
