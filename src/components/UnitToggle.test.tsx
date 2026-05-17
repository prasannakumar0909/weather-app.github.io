import { screen, fireEvent } from '@testing-library/react';
import { UnitToggle } from './UnitToggle';
import { renderWithProviders } from '@/utils/test-utils';

describe('UnitToggle component', () => {
  it('renders temperature unit options', () => {
    renderWithProviders(<UnitToggle />);
    expect(screen.getByRole('group', { name: 'Temperature unit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '°C' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '°F' })).toBeInTheDocument();
  });

  it('renders metric as selected by default', () => {
    renderWithProviders(<UnitToggle />);
    const buttonC = screen.getByRole('button', { name: '°C' });
    const buttonF = screen.getByRole('button', { name: '°F' });

    expect(buttonC).toHaveAttribute('aria-pressed', 'true');
    expect(buttonF).toHaveAttribute('aria-pressed', 'false');
  });

  it('dispatches setUnit action when imperial button is clicked', () => {
    const { store } = renderWithProviders(<UnitToggle />);
    const buttonF = screen.getByRole('button', { name: '°F' });

    fireEvent.click(buttonF);

    // Verify unit state is updated to imperial in the Redux store
    expect(store.getState().cities.unit).toBe('imperial');
  });

  it('reflects updated selection after clicking Celsius', () => {
    const { store } = renderWithProviders(<UnitToggle />, {
      preloadedState: {
        cities: {
          cities: [],
          primaryId: null,
          unit: 'imperial',
          hasGeoConsent: false,
        },
      },
    });

    const buttonC = screen.getByRole('button', { name: '°C' });
    expect(buttonC).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(buttonC);

    expect(store.getState().cities.unit).toBe('metric');
  });
});
