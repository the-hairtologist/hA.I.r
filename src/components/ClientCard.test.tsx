import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ClientCard } from './ClientCard';

describe('ClientCard', () => {
  const mockClient = {
    id: 'client-123',
    full_name: 'John Doe',
    email: 'john@example.com',
    phone: '555-0123',
    hair_type: 'Curly',
    total_appointments: 5,
    last_appointment_date: '2025-10-15T10:00:00Z',
  };

  const mockHandlers = {
    onToggleSelection: vi.fn(),
    onEdit: vi.fn(),
    onViewHistory: vi.fn(),
    onViewNotes: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render client name', () => {
    render(
      <ClientCard
        client={mockClient}
        isSelected={false}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should render client email', () => {
    render(
      <ClientCard
        client={mockClient}
        isSelected={false}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should render client phone', () => {
    render(
      <ClientCard
        client={mockClient}
        isSelected={false}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('555-0123')).toBeInTheDocument();
  });

  it('should render hair type badge', () => {
    render(
      <ClientCard
        client={mockClient}
        isSelected={false}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Curly')).toBeInTheDocument();
  });

  it('should show appointment count', () => {
    render(
      <ClientCard
        client={mockClient}
        isSelected={false}
        {...mockHandlers}
      />
    );

    expect(screen.getByText(/5 appointments/)).toBeInTheDocument();
  });

  it('should call onToggleSelection when checkbox is clicked', () => {
    render(
      <ClientCard
        client={mockClient}
        isSelected={false}
        {...mockHandlers}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockHandlers.onToggleSelection).toHaveBeenCalledWith('client-123');
  });

  it('should call onEdit when Edit button is clicked', () => {
    render(
      <ClientCard
        client={mockClient}
        isSelected={false}
        {...mockHandlers}
      />
    );

    const editButton = screen.getByLabelText(/Edit John Doe/);
    fireEvent.click(editButton);

    expect(mockHandlers.onEdit).toHaveBeenCalled();
  });

  it('should call onViewHistory when History button is clicked', () => {
    render(
      <ClientCard
        client={mockClient}
        isSelected={false}
        {...mockHandlers}
      />
    );

    const historyButton = screen.getByLabelText(/View John Doe's appointment history/);
    fireEvent.click(historyButton);

    expect(mockHandlers.onViewHistory).toHaveBeenCalled();
  });

  it('should call onViewNotes when Notes button is clicked', () => {
    render(
      <ClientCard
        client={mockClient}
        isSelected={false}
        {...mockHandlers}
      />
    );

    const notesButton = screen.getByLabelText(/View John Doe's notes/);
    fireEvent.click(notesButton);

    expect(mockHandlers.onViewNotes).toHaveBeenCalled();
  });

  it('should show selected state when isSelected is true', () => {
    render(
      <ClientCard
        client={mockClient}
        isSelected={true}
        {...mockHandlers}
      />
    );

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('should handle client without name', () => {
    const clientWithoutName = { ...mockClient, full_name: null };
    
    render(
      <ClientCard
        client={clientWithoutName}
        isSelected={false}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Unnamed Client')).toBeInTheDocument();
  });

  it('should handle client without email', () => {
    const clientWithoutEmail = { ...mockClient, email: null };
    
    render(
      <ClientCard
        client={clientWithoutEmail}
        isSelected={false}
        {...mockHandlers}
      />
    );

    expect(screen.queryByText('john@example.com')).not.toBeInTheDocument();
  });

  it('should handle client without phone', () => {
    const clientWithoutPhone = { ...mockClient, phone: null };
    
    render(
      <ClientCard
        client={clientWithoutPhone}
        isSelected={false}
        {...mockHandlers}
      />
    );

    expect(screen.queryByText('555-0123')).not.toBeInTheDocument();
  });

  it('should handle client with no appointments', () => {
    const clientNoAppointments = {
      ...mockClient,
      total_appointments: 0,
      last_appointment_date: null,
    };
    
    render(
      <ClientCard
        client={clientNoAppointments}
        isSelected={false}
        {...mockHandlers}
      />
    );

    expect(screen.getByText(/0 appointments/)).toBeInTheDocument();
  });
});
