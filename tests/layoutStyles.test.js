import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('responsive app shell', () => {
  it('keeps the stage usable on narrow viewports', () => {
    const css = readFileSync('src/style.css', 'utf8');
    expect(css).toContain('@media (max-width: 720px)');
    expect(css).toContain('flex-direction: column');
    expect(css).toContain('width: 100%');
  });
});
