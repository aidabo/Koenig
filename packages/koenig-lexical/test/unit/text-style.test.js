import {describe, expect, it} from 'vitest';
import {getStyleProperty, normalizeColorValue, setStyleProperty} from '../../src/utils/textStyle.js';

describe('textStyle utils', function () {
    it('sets and clears inline styles', function () {
        const withColor = setStyleProperty('font-family: Georgia;', 'color', '#ff0095');
        expect(withColor).toContain('font-family: Georgia');
        expect(withColor).toContain('color: rgb(255, 0, 149)');

        const withoutColor = setStyleProperty(withColor, 'color', '');
        expect(withoutColor).toContain('font-family: Georgia');
        expect(withoutColor).not.toContain('color:');
    });

    it('reads a style property from inline styles', function () {
        expect(getStyleProperty('font-family: Georgia; color: rgb(18, 52, 86);', 'font-family')).toBe('Georgia');
        expect(getStyleProperty('font-family: Georgia; color: rgb(18, 52, 86);', 'color')).toBe('rgb(18, 52, 86)');
    });

    it('normalizes color values to hex', function () {
        expect(normalizeColorValue('#123456')).toBe('#123456');
        expect(normalizeColorValue('rgb(18, 52, 86)')).toBe('#123456');
        expect(normalizeColorValue('red')).toBe('#FF0000');
    });
});
