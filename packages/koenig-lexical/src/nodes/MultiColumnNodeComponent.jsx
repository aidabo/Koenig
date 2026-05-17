import CardContext from '../context/CardContext';
import React from 'react';
import {$generateHtmlFromNodes} from '@lexical/html';
import {$getNodeByKey} from 'lexical';
import {ActionToolbar} from '../components/ui/ActionToolbar.jsx';
import {MultiColumnCard} from '../components/ui/cards/MultiColumnCard';
import {ToolbarMenu, ToolbarMenuItem} from '../components/ui/ToolbarMenu.jsx';
import {mergeRegister} from '@lexical/utils';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';

export function MultiColumnNodeComponent({
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
    nodeKey
}) {
    const [editor] = useLexicalComposerContext();
    const {isEditing, isSelected, setEditing} = React.useContext(CardContext);

    React.useEffect(() => {
        column1Editor?.setEditable?.(isEditing);
        column2Editor?.setEditable?.(isEditing);
        column3Editor?.setEditable?.(isEditing);
        column4Editor?.setEditable?.(isEditing);
    }, [column1Editor, column2Editor, column3Editor, column4Editor, isEditing]);

    React.useEffect(() => {
        const syncColumn = (columnEditor, columnName) => {
            if (!columnEditor) {
                return null;
            }

            return columnEditor.registerUpdateListener(({editorState, tags}) => {
                if (tags.has('history-merge')) {
                    return;
                }

                let html = '';
                editorState.read(() => {
                    html = $generateHtmlFromNodes(columnEditor, null).trim();
                });

                editor.update(() => {
                    const node = $getNodeByKey(nodeKey);
                    if (!node || node[columnName] === html) {
                        return;
                    }

                    node[columnName] = html;
                });
            });
        };

        const unregister = [
            syncColumn(column1Editor, 'column1'),
            syncColumn(column2Editor, 'column2'),
            syncColumn(column3Editor, 'column3'),
            syncColumn(column4Editor, 'column4')
        ].filter(Boolean);

        return mergeRegister(...unregister);
    }, [column1Editor, column2Editor, column3Editor, column4Editor, editor, nodeKey]);

    const handleToolbarEdit = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setEditing(true);
    };

    const handleColumnsChange = (value) => {
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            node.columns = parseInt(value, 10);
        });
    };

    const handleGapChange = (value) => {
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            node.gap = parseFloat(value);
        });
    };

    return (
        <>
            <MultiColumnCard
                column1Editor={column1Editor}
                column1EditorInitialState={column1EditorInitialState}
                column2Editor={column2Editor}
                column2EditorInitialState={column2EditorInitialState}
                column3Editor={column3Editor}
                column3EditorInitialState={column3EditorInitialState}
                column4Editor={column4Editor}
                column4EditorInitialState={column4EditorInitialState}
                columns={columns}
                gap={gap}
                isEditing={isEditing}
                onColumnsChange={handleColumnsChange}
                onGapChange={handleGapChange}
            />

            <ActionToolbar
                data-kg-card-toolbar="multi-column"
                isVisible={isSelected && !isEditing}
            >
                <ToolbarMenu>
                    <ToolbarMenuItem
                        dataTestId="edit-multi-column-card"
                        icon="edit"
                        isActive={false}
                        label="Edit"
                        onClick={handleToolbarEdit}
                    />
                </ToolbarMenu>
            </ActionToolbar>
        </>
    );
}
