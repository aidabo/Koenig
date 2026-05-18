export const TABLE_RESIZE_HOVER_THRESHOLD_PX = 10;
export const TABLE_RESIZE_HANDLE_HALF_WIDTH_PX = 9;

export function shouldShowTableResizeHover(eventX, cellRect, threshold = TABLE_RESIZE_HOVER_THRESHOLD_PX) {
    if (!cellRect) {
        return false;
    }

    const distanceFromRightEdge = cellRect.right - eventX;

    return distanceFromRightEdge >= 0 && distanceFromRightEdge <= threshold;
}

export function getTableResizeHoverStyle(cellRect) {
    if (!cellRect) {
        return {
            display: 'none'
        };
    }

    return {
        display: 'block',
        left: `${Math.round(cellRect.right - 1)}px`,
        top: `${Math.round(cellRect.top)}px`,
        height: `${Math.round(cellRect.height)}px`,
        width: '2px',
        cursor: 'col-resize',
        backgroundColor: 'var(--green)'
    };
}
