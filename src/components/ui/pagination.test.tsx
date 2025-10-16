/**
 * Unit tests for Pagination component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from './pagination';

describe('Pagination', () => {
  const mockOnPageChange = vi.fn();
  const mockOnPageSizeChange = vi.fn();

  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    onPageChange: mockOnPageChange,
    onPageSizeChange: mockOnPageSizeChange,
    paginationInfo: 'Showing 1-25 of 250 items'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render pagination controls', () => {
    render(<Pagination {...defaultProps} />);
    
    expect(screen.getByText('Showing 1-25 of 250 items')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('should disable Previous button on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />);
    
    const prevButton = screen.getByText('Previous');
    expect(prevButton).toBeDisabled();
  });

  it('should disable Next button on last page', () => {
    render(<Pagination {...defaultProps} currentPage={10} totalPages={10} />);
    
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('should call onPageChange when clicking Next', () => {
    render(<Pagination {...defaultProps} />);
    
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('should call onPageChange when clicking Previous', () => {
    render(<Pagination {...defaultProps} currentPage={5} />);
    
    const prevButton = screen.getByText('Previous');
    fireEvent.click(prevButton);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(4);
  });

  it('should render page numbers correctly', () => {
    render(<Pagination {...defaultProps} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should highlight current page', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);
    
    const currentPageButton = screen.getByText('3');
    expect(currentPageButton).toHaveClass('bg-primary'); // Assuming bg-primary is used for active page
  });

  it('should call onPageChange when clicking page number', () => {
    render(<Pagination {...defaultProps} />);
    
    const pageButton = screen.getByText('5');
    fireEvent.click(pageButton);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(5);
  });

  it('should show ellipsis for many pages', () => {
    render(<Pagination {...defaultProps} totalPages={20} currentPage={10} />);
    
    const ellipsis = screen.getAllByText('...');
    expect(ellipsis.length).toBeGreaterThan(0);
  });

  it('should render page size selector', () => {
    render(<Pagination {...defaultProps} showPageSize={true} pageSize={25} />);
    
    expect(screen.getByDisplayValue('25')).toBeInTheDocument();
  });

  it('should call onPageSizeChange when changing page size', () => {
    render(<Pagination {...defaultProps} showPageSize={true} pageSize={25} />);
    
    const select = screen.getByDisplayValue('25');
    fireEvent.change(select, { target: { value: '50' } });
    
    expect(mockOnPageSizeChange).toHaveBeenCalledWith(50);
  });
});
