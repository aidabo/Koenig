import BASIC_NODES from '../../../nodes/BasicNodes';
import KoenigNestedEditor from '../../KoenigNestedEditor';
import React from 'react';
import clsx from 'clsx';
import {ButtonGroup} from '../ButtonGroup';
import {Dropdown} from '../Dropdown';
import {ExtendedTextNode, extendedTextNodeReplacement} from '@tryghost/kg-default-nodes';
import {ImageNode} from '../../../nodes/ImageNode';

/* eslint-disable react/prop-types */

const COLUMN_NODES = [...BASIC_NODES, ExtendedTextNode, extendedTextNodeReplacement, ImageNode];

function ColumnEditor({
    autoFocus = false,
    dataTestId,
    initialEditor,
    initialEditorState,
    placeholderText,
    textClassName
}) {
    return (
        <KoenigNestedEditor
            autoFocus={autoFocus}
            dataTestId={dataTestId}
            hasSettingsPanel={true}
            initialEditor={initialEditor}
            initialEditorState={initialEditorState}
            nodes={COLUMN_NODES}
            placeholderClassName="text-sm font-sans leading-normal text-grey-600 opacity-40 dark:text-grey-500"
            placeholderText={placeholderText}
            textClassName={textClassName}
        />
    );
}

export function MultiColumnCard({
    column1Editor,
    column1EditorInitialState,
    column2Editor,
    column2EditorInitialState,
    column3Editor,
    column3EditorInitialState,
    column4Editor,
    column4EditorInitialState,
    columns,
    gap,
    isEditing,
    onColumnsChange,
    onGapChange
}) {
    const columnCount = Math.min(3, [2, 3, 4].includes(columns) ? columns : 2);
    const columnButtons = [
        {label: '2', name: '2'},
        {label: '3', name: '3'}
    ];
    const gapMenu = [
        {label: 'Tight', name: '1'},
        {label: 'Default', name: '1.5'},
        {label: 'Wide', name: '2'}
    ];

    const visibleColumns = [
        {
            editor: column1Editor,
            initialState: column1EditorInitialState,
            label: 'Column 1'
        },
        {
            editor: column2Editor,
            initialState: column2EditorInitialState,
            label: 'Column 2'
        },
        {
            editor: column3Editor,
            initialState: column3EditorInitialState,
            label: 'Column 3'
        },
        {
            editor: column4Editor,
            initialState: column4EditorInitialState,
            label: 'Column 4'
        }
    ].slice(0, columnCount);

    return (
        <div className="not-kg-prose w-full">
            {isEditing && (
                <div className="mb-4 grid gap-3 rounded-lg border border-grey-200 bg-white p-3 font-sans text-sm dark:border-grey-900 dark:bg-grey-950">
                    <div className="flex items-center justify-between gap-3">
                        <div className="font-medium text-grey-900 dark:text-grey-200">Columns</div>
                        <ButtonGroup
                            buttons={columnButtons}
                            selectedName={`${columnCount}`}
                            onClick={onColumnsChange}
                        />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <div className="font-medium text-grey-900 dark:text-grey-200">Gap</div>
                        <div className="w-28">
                            <Dropdown
                                dataTestId="multi-column-gap"
                                menu={gapMenu}
                                value={`${gap}`}
                                onChange={onGapChange}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div
                className={clsx(
                    'kg-multi-column-editor grid grid-cols-1 gap-4',
                    columnCount === 2 && 'md:grid-cols-2',
                    columnCount === 3 && 'md:grid-cols-3',
                    columnCount === 4 && 'md:grid-cols-4'
                )}
                style={{gap: `${gap}rem`}}
            >
                {visibleColumns.map(({editor, initialState, label}, index) => (
                    <div
                        key={label}
                        className="min-h-[11rem] rounded-xl border border-grey-150 bg-white p-4 shadow-sm transition dark:border-grey-900 dark:bg-grey-950"
                    >
                        <ColumnEditor
                            autoFocus={isEditing && index === 0}
                            dataTestId={`multi-column-${index + 1}`}
                            initialEditor={editor}
                            initialEditorState={initialState}
                            placeholderText={label}
                            textClassName="min-h-[9rem] whitespace-normal text-[1.6rem] leading-[1.75] text-black dark:text-white"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
