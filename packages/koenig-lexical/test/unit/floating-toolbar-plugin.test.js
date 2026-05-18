import {describe, expect, it} from 'vitest';
import {getToolbarItemTypeFromSelectionState} from '../../src/plugins/FloatingToolbarPlugin.jsx';

describe('FloatingToolbarPlugin selection routing', function () {
    it('shows the table toolbar for a table selection', function () {
        expect(getToolbarItemTypeFromSelectionState({
            hasRangeSelection: true,
            isAtLinkSearchNode: false,
            isTableSelection: true,
            hasSelectedTableCell: true,
            isCollapsed: false,
            canShowTextToolbar: true
        })).toEqual('table');
    });

    it('shows the table toolbar for a collapsed selection inside a table cell', function () {
        expect(getToolbarItemTypeFromSelectionState({
            hasRangeSelection: true,
            isAtLinkSearchNode: false,
            isTableSelection: false,
            hasSelectedTableCell: true,
            isCollapsed: true,
            canShowTextToolbar: true
        })).toEqual('table');
    });

    it('shows the text toolbar when text is selected inside a table cell', function () {
        expect(getToolbarItemTypeFromSelectionState({
            hasRangeSelection: true,
            isAtLinkSearchNode: false,
            isTableSelection: false,
            hasSelectedTableCell: true,
            isCollapsed: false,
            canShowTextToolbar: true
        })).toEqual('text');
    });

    it('does not show a toolbar when the selection is not a range', function () {
        expect(getToolbarItemTypeFromSelectionState({
            hasRangeSelection: false,
            isAtLinkSearchNode: false,
            isTableSelection: false,
            hasSelectedTableCell: false,
            isCollapsed: true,
            canShowTextToolbar: true
        })).toEqual(null);
    });
});
