import 'highlight.js/styles/atom-one-dark.css';
import Highlight from 'react-highlight';
import React from 'react';
import beautify from 'js-beautify';
import {$generateHtmlFromNodes} from '@lexical/html';
import {OnChangePlugin} from '@lexical/react/LexicalOnChangePlugin';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';

const formatHtml = (html) => {
    return beautify.html(html, {
        indent_size: 2,
        indent_char: ' ',
        max_preserve_newlines: 1,
        preserve_newlines: true,
        wrap_line_length: 80
    });
};

const OutputHtmlTextarea = ({isOpen}) => {
    const [editor] = useLexicalComposerContext();
    const [html, setHtml] = React.useState('');

    const getHtmlContent = () => {
        let htmlContent = '';
        editor.getEditorState().read(() => {
            htmlContent = $generateHtmlFromNodes(editor);
        });
        return formatHtml(htmlContent); // 格式化 HTML
    };

    React.useEffect(() => {
        setHtml(getHtmlContent());
    }, []);

    const onChange = (editorState) => {
        editorState.read(() => {
            const rawHtml = $generateHtmlFromNodes(editor);
            setHtml(formatHtml(rawHtml)); // 格式化 HTML
        });
    };

    return (
        <>
            <div className="size-full resize-none !overflow-auto bg-black !p-4 font-mono text-sm text-grey-300 selection:bg-grey-800">
                {isOpen && (
                    <Highlight className="html-content">
                        {html}
                    </Highlight>
                )}
            </div>
            <OnChangePlugin onChange={onChange} />
        </>
    );
};

export default OutputHtmlTextarea;