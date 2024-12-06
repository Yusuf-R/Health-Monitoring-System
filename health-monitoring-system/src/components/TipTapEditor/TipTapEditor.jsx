'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

const MenuBar = ({ editor }) => {
    if (!editor) {
        return null;
    }

    // Prevent form submission when clicking toolbar buttons
    const handleButtonClick = (e, action) => {
        e.preventDefault();
        e.stopPropagation();
        action();
    };

    return (
        <div className="menuBar">
            <button
                type="button" // Explicitly set button type
                onClick={(e) => handleButtonClick(e, () => editor.chain().focus().toggleBold().run())}
                className={editor.isActive('bold') ? 'is-active' : ''}
            >
                bold
            </button>
            <button
                type="button"
                onClick={(e) => handleButtonClick(e, () => editor.chain().focus().toggleItalic().run())}
                className={editor.isActive('italic') ? 'is-active' : ''}
            >
                italic
            </button>
            <button
                type="button"
                onClick={(e) => handleButtonClick(e, () => editor.chain().focus().setParagraph().run())}
                className={editor.isActive('paragraph') ? 'is-active' : ''}
            >
                paragraph
            </button>
            <button
                type="button"
                onClick={(e) => handleButtonClick(e, () => editor.chain().focus().toggleBulletList().run())}
                className={editor.isActive('bulletList') ? 'is-active' : ''}
            >
                bullet list
            </button>
            <button
                type="button"
                onClick={(e) => handleButtonClick(e, () => editor.chain().focus().toggleOrderedList().run())}
                className={editor.isActive('orderedList') ? 'is-active' : ''}
            >
                ordered list
            </button>
            <button
                type="button"
                onClick={(e) => handleButtonClick(e, () => editor.chain().focus().undo().run())}
            >
                undo
            </button>
            <button
                type="button"
                onClick={(e) => handleButtonClick(e, () => editor.chain().focus().redo().run())}
            >
                redo
            </button>
        </div>
    );
};

export default function TipTapEditor({ value, onChange }) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: value,
        onUpdate: ({ editor }) => {
            // Get plain text content
            const plainText = editor.getText();
            onChange(plainText);
        },
    });

    // Update content when value prop changes
    useEffect(() => {
        if (editor && value !== editor.getText()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    return (
        <div className="editor">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
            <style jsx global>{`
                .editor {
                    background: white;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    margin-bottom: 20px;
                }

                .menuBar {
                    padding: 5px 10px;
                    border-bottom: 1px solid #ccc;
                    background: #f5f5f5;
                    border-top-left-radius: 4px;
                    border-top-right-radius: 4px;
                    display: flex;
                    gap: 5px;
                }

                .menuBar button {
                    border: 1px solid #ccc;
                    background: white;
                    border-radius: 3px;
                    padding: 5px 10px;
                    cursor: pointer;
                    font-size: 14px;
                }

                .menuBar button:hover {
                    background: #f0f0f0;
                }

                .menuBar button.is-active {
                    background: #e0e0e0;
                }

                .ProseMirror {
                    padding: 15px;
                    min-height: 150px;
                    outline: none;
                }

                .ProseMirror p {
                    margin: 0 0 1em 0;
                }

                .ProseMirror ul,
                .ProseMirror ol {
                    padding-left: 20px;
                }
            `}</style>
        </div>
    );
}
