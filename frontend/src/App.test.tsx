import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Services section', () => {
  render(<App />);
  expect(screen.getByText(/Our Services/i)).toBeInTheDocument();
});
