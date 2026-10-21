import { describe, expect, it } from 'vitest';
import { scoreBand } from './score';

describe('scoreBand', () => {
  it.each([
    [0, 'high'],
    [39, 'high'],
    [40, 'medium'],
    [69, 'medium'],
    [70, 'low'],
    [100, 'low'],
  ])('%i → %s', (score, band) => expect(scoreBand(score)).toBe(band));
});
