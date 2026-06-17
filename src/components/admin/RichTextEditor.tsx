'use client';

import React, { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Placeholder from '@tiptap/extension-placeholder';
import { Extension, CommandProps } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
};

const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }

              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }: CommandProps) => {
          return chain().setMark('textStyle', { fontSize }).run();
        },

      unsetFontSize:
        () =>
        ({ chain }: CommandProps) => {
          return chain()
            .setMark('textStyle', { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write content...',
  minHeight = 220,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),

      Underline,

      TextStyle,

      FontFamily.configure({
        types: ['textStyle'],
      }),

      FontSize,

      Placeholder.configure({
        placeholder,
      }),

      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),

      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],

    content: value || '',

    editorProps: {
      attributes: {
        class: 'rich-text-editor__content',
        style: `min-height: ${minHeight}px`,
      },
    },

    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const currentHtml = editor.getHTML();
    const incomingHtml = value || '';

    if (currentHtml !== incomingHtml) {
      editor.commands.setContent(incomingHtml, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl || 'https://');

    if (url === null) {
      return;
    }

    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({
        href: url,
        target: '_blank',
        rel: 'noopener noreferrer',
      })
      .run();
  };

  return (
    <div className="rich-text-editor">
      <div className="rich-text-editor__toolbar">
        <button
          type="button"
          className={editor.isActive('bold') ? 'is-active' : ''}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          B
        </button>

        <button
          type="button"
          className={editor.isActive('italic') ? 'is-active' : ''}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          I
        </button>

        <button
          type="button"
          className={editor.isActive('underline') ? 'is-active' : ''}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          U
        </button>

        <span className="rich-text-editor__separator" />

        <select
          value={
            editor.isActive('heading', { level: 2 })
              ? 'h2'
              : editor.isActive('heading', { level: 3 })
              ? 'h3'
              : editor.isActive('heading', { level: 4 })
              ? 'h4'
              : 'p'
          }
          onChange={(event) => {
            const value = event.target.value;

            if (value === 'p') {
              editor.chain().focus().setParagraph().run();
            }

            if (value === 'h2') {
              editor.chain().focus().toggleHeading({ level: 2 }).run();
            }

            if (value === 'h3') {
              editor.chain().focus().toggleHeading({ level: 3 }).run();
            }

            if (value === 'h4') {
              editor.chain().focus().toggleHeading({ level: 4 }).run();
            }
          }}
          title="Text style"
        >
          <option value="p">Paragraph</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
        </select>

        <select
          defaultValue=""
          onChange={(event) => {
            const fontSize = event.target.value;

            if (!fontSize) {
              editor.chain().focus().unsetFontSize().run();
              return;
            }

            editor.chain().focus().setFontSize(fontSize).run();
          }}
          title="Font size"
        >
          <option value="">Size</option>
          <option value="14px">Small</option>
          <option value="16px">Normal</option>
          <option value="18px">Medium</option>
          <option value="22px">Large</option>
          <option value="28px">Extra large</option>
        </select>

        <select
          defaultValue=""
          onChange={(event) => {
            const fontFamily = event.target.value;

            if (!fontFamily) {
              editor.chain().focus().unsetFontFamily().run();
              return;
            }

            editor.chain().focus().setFontFamily(fontFamily).run();
          }}
          title="Font family"
        >
          <option value="">Font</option>
          <option value="inherit">Default</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="'Times New Roman', serif">Times New Roman</option>
          <option value="'Courier New', monospace">Courier New</option>
        </select>

        <span className="rich-text-editor__separator" />

        <button
          type="button"
          className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="Align left"
        >
          ⬅
        </button>

        <button
          type="button"
          className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="Align center"
        >
          ↔
        </button>

        <button
          type="button"
          className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="Align right"
        >
          ➡
        </button>

        <button
          type="button"
          className={editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          title="Justify"
        >
          ☰
        </button>

        <span className="rich-text-editor__separator" />

        <button
          type="button"
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet list"
        >
          • List
        </button>

        <button
          type="button"
          className={editor.isActive('orderedList') ? 'is-active' : ''}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered list"
        >
          1. List
        </button>

        <span className="rich-text-editor__separator" />

        <button
          type="button"
          className={editor.isActive('link') ? 'is-active' : ''}
          onClick={setLink}
          title="Add link"
        >
          Link
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive('link')}
          title="Remove link"
        >
          Unlink
        </button>

        <span className="rich-text-editor__separator" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          Undo
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          Redo
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}