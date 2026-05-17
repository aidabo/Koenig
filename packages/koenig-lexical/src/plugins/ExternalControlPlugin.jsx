import React from 'react';
import {$canShowPlaceholder} from '@lexical/text';
import {$createHtmlNode} from '../nodes/HtmlNode';
import {$createParagraphNode, $getRoot, $getSelection, $insertNodes, $isDecoratorNode, $isNodeSelection, $isRangeSelection} from 'lexical';
import {$createVideoNode} from '../nodes/VideoNode';
import {$generateNodesFromDOM} from '@lexical/html';
import {$insertAndSelectNode} from '../utils/$insertAndSelectNode';
import {$selectDecoratorNode} from '../utils/$selectDecoratorNode';
import {DRAG_DROP_PASTE} from '@lexical/rich-text';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';

// used to register a minimal API for controlling the editor from the consuming app
// designed to allow typical behaviours without the consuming app needing to bundle the lexical library
export const ExternalControlPlugin = ({registerAPI}) => {
    const [editor] = useLexicalComposerContext();

    React.useEffect(() => {
        if (!registerAPI) {
            return;
        }

        const API = {
            // give access to the editor instance so the Lexical API can be used directly if needed
            editorInstance: editor,
            // simplified API methods for typical consumer app actions
            serialize() {
                return JSON.stringify(editor.getEditorState());
            },
            editorIsEmpty() {
                let isEmpty;
                editor.update(() => {
                    isEmpty = $canShowPlaceholder(false, true);
                });
                return isEmpty;
            },
            focusEditor({position = 'bottom'} = {}) {
                const editorFocusOptions = {
                    defaultSelection: position === 'top' ? 'rootStart' : null
                };

                editor.focus(() => {}, editorFocusOptions);

                if (position === 'top') {
                    // Lexical does not automatically select a decorator node
                    editor.update(() => {
                        const root = $getRoot();
                        const firstChild = root.getFirstChild();

                        if ($isDecoratorNode(firstChild)) {
                            $selectDecoratorNode(firstChild);
                            // selecting a decorator node does not change the
                            // window selection (there's no caret) so we need
                            // to manually move focus to the editor element
                            editor.getRootElement().focus();
                        }
                    });
                }
                if (position === 'bottom') {
                    // Lexical does not automatically select a decorator node
                    editor.update(() => {
                        const root = $getRoot();
                        const lastChild = root.getLastChild();

                        if ($isDecoratorNode(lastChild)) {
                            $selectDecoratorNode(lastChild);
                            // selecting a decorator node does not change the
                            // window selection (there's no caret) so we need
                            // to manually move focus to the editor element
                            editor.getRootElement().focus();
                        } else {
                            lastChild.select();
                        }
                    });
                }
            },
            blurEditor() {
                editor.blur();
            },
            insertParagraphAtTop({focus = true} = {}) {
                editor.update(() => {
                    const paragraphNode = $createParagraphNode();
                    const [firstChild] = $getRoot().getChildren();
                    firstChild.insertBefore(paragraphNode);

                    if (focus) {
                        paragraphNode.selectStart();
                    }
                });
            },
            insertParagraphAtBottom({focus = true} = {}) {
                editor.update(() => {
                    const paragraphNode = $createParagraphNode();
                    $getRoot().append(paragraphNode);

                    if (focus) {
                        paragraphNode.selectStart();
                    }
                });
            },
            insertFiles(files) {
                editor.dispatchCommand(DRAG_DROP_PASTE, files);
            },
            // Video cards are more reliable when inserted through Koenig's native
            // command path instead of generic HTML import. Host apps use this for
            // gallery-selected video assets so the editor creates a real video card.
            insertVideo(dataset, {focus = true, position = 'bottom'} = {}) {
                if (!dataset?.src) {
                    console.warn('[koenig][insertVideo] skipped: missing src', dataset); // eslint-disable-line no-console
                    return false;
                }

                console.warn('[koenig][insertVideo] start', {src: dataset.src, fileName: dataset.fileName, focus, position}); // eslint-disable-line no-console

                if (focus) {
                    API.focusEditor({position});
                }

                let inserted = false;

                editor.update(() => {
                    let selection = $getSelection();

                    console.warn('[koenig][insertVideo] selection before normalize', { // eslint-disable-line no-console
                        isRange: $isRangeSelection(selection),
                        isNode: $isNodeSelection(selection)
                    });

                    if (!$isRangeSelection(selection) && !$isNodeSelection(selection)) {
                        const root = $getRoot();
                        let paragraphNode = root.getLastChild();

                        if (!paragraphNode || $isDecoratorNode(paragraphNode)) {
                            paragraphNode = $createParagraphNode();
                            root.append(paragraphNode);
                        }

                        paragraphNode.selectEnd();
                        selection = $getSelection();

                        console.warn('[koenig][insertVideo] selection normalized at bottom', { // eslint-disable-line no-console
                            isRange: $isRangeSelection(selection),
                            isNode: $isNodeSelection(selection)
                        });
                    }

                    if (!$isRangeSelection(selection) && !$isNodeSelection(selection)) {
                        console.warn('[koenig][insertVideo] abort: no valid selection after normalize'); // eslint-disable-line no-console
                        return;
                    }

                    const cardNode = $createVideoNode(dataset);
                    const selectedNode = $isRangeSelection(selection)
                        ? selection.focus.getNode()
                        : selection.getNodes()[0];

                    if (!selectedNode) {
                        console.warn('[koenig][insertVideo] abort: selected node missing'); // eslint-disable-line no-console
                        return;
                    }

                    console.warn('[koenig][insertVideo] inserting after node', { // eslint-disable-line no-console
                        selectedNodeType: selectedNode.getType?.(),
                        selectedNodeKey: selectedNode.getKey?.(),
                        cardNodeKey: cardNode.getKey?.()
                    });
                    $insertAndSelectNode({selectedNode, newNode: cardNode});
                    inserted = true;
                    console.warn('[koenig][insertVideo] inserted', {cardNodeKey: cardNode.getKey?.()}); // eslint-disable-line no-console
                });

                console.warn('[koenig][insertVideo] result', {inserted}); // eslint-disable-line no-console
                return inserted;
            },
            insertHtmlCard(html, {focus = true, position = 'bottom'} = {}) {
                if (!html) {
                    console.warn('[koenig][insertHtmlCard] skipped: missing html'); // eslint-disable-line no-console
                    return false;
                }

                if (focus) {
                    API.focusEditor({position});
                }

                let inserted = false;

                editor.update(() => {
                    let selection = $getSelection();

                    if (!$isRangeSelection(selection) && !$isNodeSelection(selection)) {
                        const root = $getRoot();
                        let paragraphNode = root.getLastChild();

                        if (!paragraphNode || $isDecoratorNode(paragraphNode)) {
                            paragraphNode = $createParagraphNode();
                            root.append(paragraphNode);
                        }

                        paragraphNode.selectEnd();
                        selection = $getSelection();
                    }

                    if (!$isRangeSelection(selection) && !$isNodeSelection(selection)) {
                        return;
                    }

                    const cardNode = $createHtmlNode({html});
                    const selectedNode = $isRangeSelection(selection)
                        ? selection.focus.getNode()
                        : selection.getNodes()[0];

                    if (!selectedNode) {
                        return;
                    }

                    $insertAndSelectNode({selectedNode, newNode: cardNode});
                    inserted = true;
                });

                return inserted;
            },
            // External HTML insertion helper for host apps.
            // Current intended use is gallery asset insertion from the surrounding UI,
            // where the caller provides Koenig-compatible HTML such as kg-video-card,
            // kg-audio-card, kg-file-card, or simple image/link markup.
            // This does not create an HTML card; it reuses Lexical/Koenig HTML import
            // to convert the provided DOM into normal editor nodes at the current selection.
            insertHtml(html, {focus = true} = {}) {
                if (!html) {
                    return;
                }

                if (focus) {
                    editor.focus();
                }

                editor.update(() => {
                    const parser = new DOMParser();
                    const dom = parser.parseFromString(html, 'text/html');
                    const nodes = $generateNodesFromDOM(editor, dom);
                    const selection = $getSelection();

                    if ($isRangeSelection(selection)) {
                        $insertNodes(nodes);
                        return;
                    }

                    const root = $getRoot();
                    const paragraphNode = $createParagraphNode();
                    root.append(...nodes, paragraphNode);
                    if (focus) {
                        paragraphNode.selectStart();
                    }
                });
            },
            lastNodeIsDecorator() {
                let isDecorator = false;
                editor.getEditorState().read(() => {
                    const nodes = $getRoot().getChildren();
                    const lastNode = nodes[nodes.length - 1];

                    isDecorator = lastNode && $isDecoratorNode(lastNode);
                });
                return isDecorator;
            }
        };

        registerAPI(API);

        return () => {
            registerAPI?.(null);
        };
    }, [editor, registerAPI]);
};

export default ExternalControlPlugin;
