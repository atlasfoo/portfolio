import { describe, expect, test } from 'vitest';
import { hintStyle, placeNavHint } from './nav-hint';

describe('placeNavHint', () => {
  const navLeft = 100;
  const segments = [
    { href: '#architecture', left: 120, width: 80, sectionTop: 300 },
    { href: '#stack', left: 220, width: 60, sectionTop: 800 },
    { href: '#sectors', left: 300, width: 70, sectionTop: 1400 },
    { href: '#projects', left: 390, width: 75, sectionTop: 2000 },
  ];

  describe('hidden before the first section', () => {
    test('returns hidden: true when scroll line is above the first section', () => {
      expect(placeNavHint({ navLeft, line: 0, segments })).toEqual({
        hidden: true,
      });
      expect(placeNavHint({ navLeft, line: 299, segments })).toEqual({
        hidden: true,
      });
    });

    test('returns hidden: true when segments array is empty', () => {
      expect(placeNavHint({ navLeft, line: 500, segments: [] })).toEqual({
        hidden: true,
      });
    });
  });

  describe('sitting on the first link', () => {
    test('positions exactly on the first link at t = 0', () => {
      // At line = 300, current = architecture, next = stack (span = 500). t = 0.
      // x = (120 - 100) + (220 - 120) * 0 = 20
      // width = 80 + (60 - 80) * 0 = 80
      // href = '#architecture' (t = 0 <= 0.55)
      expect(placeNavHint({ navLeft, line: 300, segments })).toEqual({
        hidden: false,
        x: 20,
        width: 80,
        href: '#architecture',
      });
    });
  });

  describe('interpolating toward the next link', () => {
    test('interpolates x and width proportionally between current and next link', () => {
      // span = 800 - 300 = 500.
      // line = 425 -> t = (425 - 300) / 500 = 125 / 500 = 0.25
      // x = 20 + (220 - 120) * 0.25 = 20 + 25 = 45
      // width = 80 + (60 - 80) * 0.25 = 80 - 5 = 75
      // href = '#architecture' (0.25 <= 0.55)
      expect(placeNavHint({ navLeft, line: 425, segments })).toEqual({
        hidden: false,
        x: 45,
        width: 75,
        href: '#architecture',
      });

      // line = 550 -> t = (550 - 300) / 500 = 250 / 500 = 0.5
      // x = 20 + 100 * 0.5 = 70
      // width = 80 - 20 * 0.5 = 70
      // href = '#architecture' (0.5 <= 0.55)
      expect(placeNavHint({ navLeft, line: 550, segments })).toEqual({
        hidden: false,
        x: 70,
        width: 70,
        href: '#architecture',
      });
    });
  });

  describe('flipping href only after t > 0.55', () => {
    test('retains current segment href when t <= 0.55', () => {
      // line = 300 + 500 * 0.55 = 575 -> t = 0.55 (not > 0.55)
      // x = 20 + 100 * 0.55 = 75
      // width = 80 - 20 * 0.55 = 69
      expect(placeNavHint({ navLeft, line: 575, segments })).toEqual({
        hidden: false,
        x: 75,
        width: 69,
        href: '#architecture',
      });
    });

    test('flips href to the next segment when t > 0.55', () => {
      // line = 600 -> t = (600 - 300) / 500 = 0.6 > 0.55
      // x = 20 + 100 * 0.6 = 80
      // width = 80 - 20 * 0.6 = 68
      expect(placeNavHint({ navLeft, line: 600, segments })).toEqual({
        hidden: false,
        x: 80,
        width: 68,
        href: '#stack',
      });

      // line = 750 -> t = (750 - 300) / 500 = 0.9 > 0.55
      // x = 20 + 100 * 0.9 = 110
      // width = 80 - 20 * 0.9 = 62
      expect(placeNavHint({ navLeft, line: 750, segments })).toEqual({
        hidden: false,
        x: 110,
        width: 62,
        href: '#stack',
      });
    });
  });

  describe('last segment handling (no next segment)', () => {
    test('stays on the last link relative to navLeft with t = 1', () => {
      // line = 2000 (at projects) or line = 2500 (beyond projects)
      // current = projects (left: 390, width: 75), next = none
      // x = 390 - 100 = 290, width = 75, href = '#projects'
      expect(placeNavHint({ navLeft, line: 2000, segments })).toEqual({
        hidden: false,
        x: 290,
        width: 75,
        href: '#projects',
      });

      expect(placeNavHint({ navLeft, line: 2500, segments })).toEqual({
        hidden: false,
        x: 290,
        width: 75,
        href: '#projects',
      });
    });
  });

  describe('span not > 1', () => {
    test('defaults t = 1 when sectionTop span is <= 1', () => {
      const tightSegments = [
        { href: '#architecture', left: 120, width: 80, sectionTop: 300 },
        { href: '#stack', left: 220, width: 60, sectionTop: 301 },
      ];
      // span = 301 - 300 = 1, not > 1 -> t = 1
      // x = (120 - 100) + (220 - 120) * 1 = 120
      // width = 80 + (60 - 80) * 1 = 60
      // t = 1 > 0.55 -> href flips to '#stack'
      expect(
        placeNavHint({ navLeft, line: 300, segments: tightSegments }),
      ).toEqual({
        hidden: false,
        x: 120,
        width: 60,
        href: '#stack',
      });
    });
  });
});

describe('hintStyle', () => {
  test('returns opacity 0 when hidden is true', () => {
    expect(hintStyle({ hidden: true })).toEqual({ opacity: '0' });
  });

  test('returns opacity 1, translateX transform, and width when hidden is false', () => {
    expect(
      hintStyle({ hidden: false, x: 180, width: 72, href: '#stack' }),
    ).toEqual({
      opacity: '1',
      transform: 'translateX(180px)',
      width: '72px',
    });
  });

  test('positions from the active link offset rather than stuck at zero', () => {
    const style = hintStyle({
      hidden: false,
      x: 180,
      width: 72,
      href: '#stack',
    });
    expect(style).toEqual({
      opacity: '1',
      transform: 'translateX(180px)',
      width: '72px',
    });
  });
});
