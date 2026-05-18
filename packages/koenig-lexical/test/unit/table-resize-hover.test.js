import {describe, expect, it} from 'vitest';
import {getTableResizeHoverStyle, shouldShowTableResizeHover} from '../../src/utils/tableResizeHover';

describe('table resize hover helper', function () {
    it('shows the hover ruler only near the right edge of a cell', function () {
        const cellRect = {
            right: 200,
            top: 100,
            height: 40
        };

        expect(shouldShowTableResizeHover(192, cellRect)).toBe(true);
        expect(shouldShowTableResizeHover(189, cellRect)).toBe(false);
        expect(shouldShowTableResizeHover(205, cellRect)).toBe(false);
    });

    it('returns a fixed-position style for the resize ruler', function () {
        const style = getTableResizeHoverStyle({
            right: 200.2,
            top: 100.6,
            height: 40.4
        });

        expect(style).to.deep.equal({
            display: 'block',
            left: '199px',
            top: '101px',
            height: '40px',
            width: '2px',
            cursor: 'col-resize',
            backgroundColor: 'var(--green)'
        });
    });
});
