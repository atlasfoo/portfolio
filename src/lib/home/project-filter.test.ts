import { describe, expect, test } from 'vitest';
import { filterProjects } from './project-filter';

/**
 * Failing-first tests for `project-filter.ts` (implemented in T-040).
 *
 * `filterProjects` ports the mock's `renderVals()` project-filtering logic
 * (design-import/Portafolio Jerry Mejia.dc.html) and backs HOME-001's
 * "filter by sector" requirement.
 */

describe('filterProjects', () => {
  const fixtureProjects = [
    {
      name: 'PaymentHub',
      tags: ['pay', 'fin'],
      stack: ['Node.js', 'AWS Lambda', 'DynamoDB'],
      kind: { es: 'Plataforma de Pagos', en: 'Payments Platform' },
      description: {
        es: 'Sistema de procesamiento de pagos',
        en: 'Payment processing system',
      },
    },
    {
      name: 'HealthTracker',
      tags: ['med'],
      stack: ['React', 'TypeScript', 'PostgreSQL'],
      kind: { es: 'Aplicación Médica', en: 'Healthcare App' },
      description: {
        es: 'Seguimiento de datos de salud',
        en: 'Health data tracking',
      },
    },
    {
      name: 'FinanceCore',
      tags: ['fin'],
      stack: ['Python', 'Kafka', 'Elasticsearch'],
      kind: { es: 'Motor Financiero', en: 'Financial Engine' },
      description: {
        es: 'Motor de análisis financiero',
        en: 'Financial analytics engine',
      },
    },
    {
      name: 'Wallet',
      tags: ['pay', 'fin'],
      stack: ['Swift', 'AWS RDS', 'Redis'],
      kind: { es: 'Billetera Digital', en: 'Digital Wallet' },
      description: {
        es: 'Billetera digital segura',
        en: 'Secure digital wallet',
      },
    },
  ];

  test('returns all projects when filterId is "all"', () => {
    const result = filterProjects(fixtureProjects, 'all');
    expect(result).toHaveLength(4);
    expect(result).toEqual(fixtureProjects);
  });

  test('returns only projects matching the filter tag', () => {
    const result = filterProjects(fixtureProjects, 'pay');
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('PaymentHub');
    expect(result[1].name).toBe('Wallet');
  });

  test('returns projects with multiple matching tags', () => {
    const result = filterProjects(fixtureProjects, 'fin');
    expect(result).toHaveLength(3);
    expect(result.map((p: (typeof fixtureProjects)[0]) => p.name)).toEqual([
      'PaymentHub',
      'FinanceCore',
      'Wallet',
    ]);
  });

  test('returns an empty array when no projects match the filter', () => {
    const result = filterProjects(fixtureProjects, 'nonexistent');
    expect(result).toEqual([]);
  });

  test('returns an empty array when given an empty projects list', () => {
    const result = filterProjects([], 'pay');
    expect(result).toEqual([]);
  });

  test('handles single-tag filters correctly', () => {
    const result = filterProjects(fixtureProjects, 'med');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('HealthTracker');
  });
});
