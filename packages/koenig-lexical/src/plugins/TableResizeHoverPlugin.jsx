import React from 'react';
import {$getNodeByKey} from 'lexical';
import {$getTableColumnIndexFromTableCellNode, $getTableNodeFromLexicalNodeOrThrow, $isTableCellNode} from '@lexical/table';
import {TABLE_COLUMN_DEFAULT_WIDTH_PX, TABLE_COLUMN_MIN_WIDTH_PX, setTableColumnWidth} from '../utils/tableWidth';
import {getDOMCellFromTarget} from '@lexical/table';
import {getTableResizeHoverStyle, shouldShowTableResizeHover} from '../utils/tableResizeHover';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';

export default function TableResizeHoverPlugin() {
    const [editor] = useLexicalComposerContext();
    const [hoverState, setHoverState] = React.useState(null);
    const lastEventRef = React.useRef(null);
    const dragStateRef = React.useRef(null);

    React.useEffect(() => {
        const setCursor = (cursor) => {
            if (document?.body?.style) {
                document.body.style.cursor = cursor;
            }
            if (document?.documentElement?.style) {
                document.documentElement.style.cursor = cursor;
            }
        };

        const updateHover = (event) => {
            if (dragStateRef.current) {
                return;
            }

            const rootElement = editor.getRootElement();
            const target = event.target instanceof Node ? event.target : null;

            if (!rootElement || !target || !rootElement.contains(target)) {
                setHoverState(null);
                lastEventRef.current = null;
                return;
            }

            if (target instanceof Element && target.closest('.kg-table-resize-ruler')) {
                return;
            }

            const cell = getDOMCellFromTarget(event.target);
            if (!cell) {
                setHoverState(null);
                lastEventRef.current = null;
                setCursor('');
                return;
            }

            const cellRect = cell.elem.getBoundingClientRect();
            const tableCellMeta = getTableCellMetaFromDomCell(editor, cell.elem);
            lastEventRef.current = {cellRect, clientX: event.clientX, tableCellMeta};

            if (!shouldShowTableResizeHover(event.clientX, cellRect)) {
                setHoverState(null);
                setCursor('');
                return;
            }

            setHoverState({
                ...getTableResizeHoverStyle(cellRect),
                tableCellMeta
            });
            setCursor('col-resize');
        };

        const resetHover = () => {
            setHoverState(null);
            lastEventRef.current = null;
            setCursor('');
            dragStateRef.current = null;
        };

        const updateFromLastEvent = () => {
            const rootElement = editor.getRootElement();
            const lastEvent = lastEventRef.current;

            if (!rootElement || !lastEvent) {
                return;
            }

            if (!shouldShowTableResizeHover(lastEvent.clientX, lastEvent.cellRect)) {
                setHoverState(null);
                setCursor('');
                return;
            }

            setHoverState({
                ...getTableResizeHoverStyle(lastEvent.cellRect),
                tableCellMeta: lastEvent.tableCellMeta
            });
            setCursor('col-resize');
        };

        const onMouseMoveDuringDrag = (event) => {
            const dragState = dragStateRef.current;
            if (!dragState) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            const nextWidth = Math.max(
                TABLE_COLUMN_MIN_WIDTH_PX,
                dragState.startWidth + (event.clientX - dragState.startX)
            );

            editor.update(() => {
                const tableCellNode = $getNodeByKey(dragState.tableCellNodeKey);
                if (!$isTableCellNode(tableCellNode)) {
                    return;
                }

                const latestTableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
                setTableColumnWidth(latestTableNode, dragState.columnIndex, nextWidth);
            });
        };

        const onMouseDownToStartDrag = (event) => {
            if (dragStateRef.current) {
                return;
            }

            const hoverStateSnapshot = lastEventRef.current;
            if (!hoverStateSnapshot) {
                return;
            }

            if (!shouldShowTableResizeHover(event.clientX, hoverStateSnapshot.cellRect)) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            dragStateRef.current = {
                columnIndex: hoverStateSnapshot.tableCellMeta.columnIndex,
                startWidth: hoverStateSnapshot.tableCellMeta.columnWidth ?? TABLE_COLUMN_DEFAULT_WIDTH_PX,
                startX: event.clientX,
                tableCellNodeKey: hoverStateSnapshot.tableCellMeta.tableCellNodeKey
            };
        };

        const onMouseUpDuringDrag = () => {
            if (!dragStateRef.current) {
                return;
            }

            dragStateRef.current = null;
            setCursor('col-resize');
        };

        const onMouseLeaveWindow = () => {
            if (!dragStateRef.current) {
                resetHover();
            }
        };

        document.addEventListener('mousemove', updateHover);
        document.addEventListener('mousedown', onMouseDownToStartDrag, true);
        document.addEventListener('mouseleave', resetHover);
        window.addEventListener('scroll', updateFromLastEvent, true);
        window.addEventListener('resize', updateFromLastEvent);
        window.addEventListener('mousemove', onMouseMoveDuringDrag, true);
        window.addEventListener('mouseup', onMouseUpDuringDrag, true);
        window.addEventListener('blur', resetHover);
        window.addEventListener('mouseleave', onMouseLeaveWindow);

        return () => {
            document.removeEventListener('mousemove', updateHover);
            document.removeEventListener('mousedown', onMouseDownToStartDrag, true);
            document.removeEventListener('mouseleave', resetHover);
            window.removeEventListener('scroll', updateFromLastEvent, true);
            window.removeEventListener('resize', updateFromLastEvent);
            window.removeEventListener('mousemove', onMouseMoveDuringDrag, true);
            window.removeEventListener('mouseup', onMouseUpDuringDrag, true);
            window.removeEventListener('blur', resetHover);
            window.removeEventListener('mouseleave', onMouseLeaveWindow);
            setCursor('');
        };
    }, [editor]);

    if (!hoverState) {
        return null;
    }

    return (
        <div
            aria-hidden="true"
            className="kg-table-resize-ruler"
            style={hoverState}
        />
    );
}

function getTableCellMetaFromDomCell(editor, cellElem) {
    let meta = null;

    editor.getEditorState().read(() => {
        const lexicalKey = cellElem[`__lexicalKey_${editor._key}`];
        const lexicalNode = lexicalKey ? $getNodeByKey(lexicalKey) : null;

        if (!$isTableCellNode(lexicalNode)) {
            return;
        }

        const tableNode = $getTableNodeFromLexicalNodeOrThrow(lexicalNode);
        const columnIndex = $getTableColumnIndexFromTableCellNode(lexicalNode);
        meta = {
            columnIndex,
            columnWidth: lexicalNode.getWidth?.(),
            tableCellNode: lexicalNode,
            tableNodeKey: tableNode.getKey(),
            tableCellNodeKey: lexicalNode.getKey()
        };
    });

    return meta;
}
