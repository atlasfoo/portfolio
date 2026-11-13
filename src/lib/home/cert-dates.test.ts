import { describe, expect, test } from 'vitest';
import { formatCertDate } from './cert-dates';

describe('formatCertDate', () => {
  test('renders an ISO date as year-month and keeps the full datetime', () => {
    expect(formatCertDate('2024-03-15')).toEqual({
      label: '2024-03',
      dateTime: '2024-03-15',
    });
  });

  test('accepts a bare year-month', () => {
    expect(formatCertDate('2027-03')).toEqual({
      label: '2027-03',
      dateTime: '2027-03',
    });
  });

  test('trims surrounding whitespace', () => {
    expect(formatCertDate('  2024-03-15  ')).toEqual({
      label: '2024-03',
      dateTime: '2024-03-15',
    });
  });

  test('returns null for missing or malformed input', () => {
    expect(formatCertDate(undefined)).toBeNull();
    expect(formatCertDate('')).toBeNull();
    expect(formatCertDate('March 2024')).toBeNull();
    expect(formatCertDate('2024-13-01')).toBeNull();
    expect(formatCertDate('24-03-15')).toBeNull();
  });
});
