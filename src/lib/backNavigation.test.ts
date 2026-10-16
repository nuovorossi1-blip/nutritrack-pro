import { describe, expect, it } from 'vitest';
import { createBackNavigation } from './backNavigation';

describe('Android Back hierarchy', () => {
  it('closes the top layer before its parent and falls back only at the root', () => {
    const nav = createBackNavigation();
    const closed: string[] = [];
    const removeChild = nav.register(() => closed.push('portion'), 50);
    const removeParent = nav.register(() => closed.push('meal'), 20);
    expect(nav.back()).toBe(true);
    removeChild();
    nav.back();
    removeParent();
    expect(nav.back()).toBe(false);
    expect(closed).toEqual(['portion', 'meal']);
  });
  it('uses the latest same-level layer and removes only that registration', () => {
    const nav = createBackNavigation();
    const closed: string[] = [];
    nav.register(() => closed.push('old'), 50);
    const dispose = nav.register(() => closed.push('new'), 50);
    nav.back(); dispose(); dispose(); nav.back();
    expect(closed).toEqual(['new', 'old']);
  });
});
