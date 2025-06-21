import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import FontFamily from '@tiptap/extension-font-family';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Superscript as SuperscriptIcon,
    Subscript as SubscriptIcon,
    Highlighter,
    Link as LinkIcon,
    Unlink,
    Image as ImageIcon,
    Table as TableIcon,
    Undo,
    Redo,
    Pilcrow,
    Paintbrush,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useAppearance } from '@/hooks/use-appearance';
import { FontSize } from '@/extensions/font-size';
const FONT_FAMILIES = [
    { label: 'Default', value: 'default' },
    { label: 'Inter', value: 'Inter' },
    { label: 'Arial', value: 'Arial' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Courier New', value: 'Courier New' },
    { label: 'Georgia', value: 'Georgia' },
];

const FONT_SIZES = [
    { label: 'Default', value: 'default' },
    { label: 'Small', value: '12px' },
    { label: 'Normal', value: '14px' },
    { label: 'Large', value: '18px' },
    { label: 'Huge', value: '24px' },
];



interface UseDocsEditorReturn {
    html: string | null
    initialContent: string
    json: object | null
    onUpdate: (content: string) => void
    editable: boolean
}

const RichTextEditor = ({ initialContent, onUpdate, editable }: UseDocsEditorReturn) => {
    const { appearance } = useAppearance();
    const [html, setHtml] = useState('')
    const [json, setJson] = useState<object | null>(null)
    const editor = useEditor({
        extensions: [
            Typography,
            FontSize,
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            TextStyle,
            FontFamily.configure({
                types: ['textStyle'],
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),

            Superscript,
            Subscript,
            Highlight.configure({
                multicolor: true,
            }),
            Color.configure({
                types: ['textStyle'],
            }),
            Link.configure({
                openOnClick: false,
            }),
            Image,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            Placeholder.configure({
                placeholder: 'Write something amazing...',
            }),

        ],
        onUpdate: ({ editor }) => {
            try {
                setHtml(editor.getHTML())
                setJson(editor.getJSON())
                onUpdate(editor.getHTML())
            } catch (e) {
                console.error("Editor update error:", e)
            }
        },

        editable: editable,
        content: initialContent,
        editorProps: {
            attributes: {
                class: `max-w-none focus:outline-none p-4 ${appearance === 'dark'
                    ? 'bg-gray-900 text-gray-100'
                    : 'bg-white text-gray-900'
                    }`,
                style: `
                h1 { font-size: 2em; font-weight: bold; margin: 0.67em 0; }
                h2 { font-size: 1.5em; font-weight: bold; margin: 0.83em 0; }
                h3 { font-size: 1.17em; font-weight: bold; margin: 1em 0; }
            `,
            },
        },
    });

    if (!editor) return

    const addImage = () => {
        const url = window.prompt('Enter the URL of the image:');
        if (url) editor.chain().focus().setImage({ src: url }).run();
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    if (!editor) return <div className="p-4">Loading editor...</div>;

    return (
        <div
            className={`rounded-lg border overflow-hidden ${appearance === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
                }`}
        >
            {/* Toolbar */}
            <div
                className={`flex flex-wrap items-center gap-1 p-2 border-b ${appearance === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
                    }`}
            >
                {/* Font Family */}
                <Select
                    value={editor.getAttributes('textStyle').fontFamily || 'default'}
                    onValueChange={(value) => {
                        if (value === 'default') {
                            editor.chain().focus().unsetFontFamily().run();
                        } else {
                            editor.chain().focus().setFontFamily(value).run();
                        }
                    }}
                >
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Font" />
                    </SelectTrigger>
                    <SelectContent>
                        {FONT_FAMILIES.map((font) => (
                            <SelectItem
                                key={font.value}
                                value={font.value}
                                style={{ fontFamily: font.value }}
                            >
                                {font.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Font Size */}
                <Select
                    value={editor.getAttributes('textStyle').fontSize || 'default'}
                    onValueChange={(value) => {
                        if (value === 'default') {
                            editor.chain().focus().removeEmptyTextStyle().run();
                        } else {
                            editor.chain().focus().setFontSize(value).run();
                        }
                    }}
                >
                    <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Size" />
                    </SelectTrigger>
                    <SelectContent>
                        {FONT_SIZES.map((size) => (
                            <SelectItem
                                key={size.value}
                                value={size.value}
                            >
                                {size.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Separator orientation="vertical" className="h-8 mx-1" />

                {/* Text Formatting */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive('bold') ? 'bg-accent' : ''}
                    title="Bold"
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive('italic') ? 'bg-accent' : ''}
                    title="Italic"
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={editor.isActive('underline') ? 'bg-accent' : ''}
                    title="Underline"
                >
                    <UnderlineIcon className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={editor.isActive('strike') ? 'bg-accent' : ''}
                    title="Strikethrough"
                >
                    <Strikethrough className="h-4 w-4" />
                </Button>

                {/* Text Color */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" title="Text Color">
                            <Paintbrush className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48">
                        <Input
                            type="color"
                            onInput={(e) => editor.chain().focus().setColor(e.currentTarget.value).run()}
                            value={editor.getAttributes('textStyle').color || '#000000'}
                            className="w-full"
                        />
                    </PopoverContent>
                </Popover>

                {/* Highlight Color */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" title="Highlight Color">
                            <Highlighter className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48">
                        <Input
                            type="color"
                            onInput={(e) => editor.chain().focus().setHighlight({ color: e.currentTarget.value }).run()}
                            value={editor.getAttributes('highlight').color || '#ffeb3b'}
                            className="w-full"
                        />
                    </PopoverContent>
                </Popover>

                <Separator orientation="vertical" className="h-8 mx-1" />

                {/* Headings and Paragraph */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    className={editor.isActive('paragraph') ? 'bg-accent' : ''}
                    title="Paragraph"
                >
                    <Pilcrow className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}
                    title="Heading 1"
                >
                    <Heading1 className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}
                    title="Heading 2"
                >
                    <Heading2 className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={editor.isActive('heading', { level: 3 }) ? 'bg-accent' : ''}
                    title="Heading 3"
                >
                    <Heading3 className="h-4 w-4" />
                </Button>

                {/* Lists */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive('bulletList') ? 'bg-accent' : ''}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive('orderedList') ? 'bg-accent' : ''}
                    title="Numbered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>

                {/* Blockquote */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={editor.isActive('blockquote') ? 'bg-accent' : ''}
                    title="Blockquote"
                >
                    <Quote className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-8 mx-1" />

                {/* Alignment */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={editor.isActive({ textAlign: 'left' }) ? 'bg-accent' : ''}
                    title="Align Left"
                >
                    <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={editor.isActive({ textAlign: 'center' }) ? 'bg-accent' : ''}
                    title="Align Center"
                >
                    <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={editor.isActive({ textAlign: 'right' }) ? 'bg-accent' : ''}
                    title="Align Right"
                >
                    <AlignRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    className={editor.isActive({ textAlign: 'justify' }) ? 'bg-accent' : ''}
                    title="Justify"
                >
                    <AlignJustify className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-8 mx-1" />

                {/* Super/Subscript */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleSuperscript().run()}
                    className={editor.isActive('superscript') ? 'bg-accent' : ''}
                    title="Superscript"
                >
                    <SuperscriptIcon className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleSubscript().run()}
                    className={editor.isActive('subscript') ? 'bg-accent' : ''}
                    title="Subscript"
                >
                    <SubscriptIcon className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-8 mx-1" />

                {/* Link */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={setLink}
                    className={editor.isActive('link') ? 'bg-accent' : ''}
                    title="Link"
                >
                    <LinkIcon className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().unsetLink().run()}
                    disabled={!editor.isActive('link')}
                    title="Remove Link"
                >
                    <Unlink className="h-4 w-4" />
                </Button>

                {/* Image */}
                <Button variant="ghost" size="sm" onClick={addImage} title="Insert Image">
                    <ImageIcon className="h-4 w-4" />
                </Button>

                {/* Table */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                    title="Insert Table"
                >
                    <TableIcon className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-8 mx-1" />

                {/* Undo/Redo */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="Undo"
                >
                    <Undo className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="Redo"
                >
                    <Redo className="h-4 w-4" />
                </Button>
            </div>

            <EditorContent editor={editor} className="ProseMirror min-h-[600px] " />
        </div>
    );
};

export default RichTextEditor;