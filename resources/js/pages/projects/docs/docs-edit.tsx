import React, { useEffect, useMemo, useState } from 'react';
import RichTextEditor from '@/components/docs-editor';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Save, Download, Copy, Sparkles, Wand2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { debounce } from 'lodash'; // or use your own debounce hook
import { v4 as uuidv4 } from 'uuid'; // For unique key generation

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"; // adjust path if needed
import axios from 'axios';

import { downloadPDF } from '@/utils/pdfExport';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Docs Editor',
        href: '/project-editor',
    },
];
const EditorPage = ({ document }: { document: any }) => {
    const [content, setContent] = useState<string>(document.content || '');
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isAiNew, setisAiNewDoc] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [generationKey, setGenerationKey] = useState('');

    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    const [title, setTitle] = useState(document.title || '');




    const handleDownloadPDF = () => {
        downloadPDF(content)
    };


    const handleDownload = (documentId: string) => {
        // Direct the browser to the Laravel route
        window.open(`/document/${documentId}/download`, '_blank');
    };

    const handleDownloadWord = async () => {
        // downloadDocx(content)
        handleDownload(document.id)
    };

    const handleSave = (html?: string, edittitle?: string) => {
        setSaveStatus('saving');

        router.put(
            `/document/${document.id}`,
            {
                title: edittitle ?? title,
                content: html ?? content
            },
            {
                onSuccess: () => {
                    setSaveStatus('saved');
                },
                onError: () => {
                    // toast.error('Failed to save document');
                    setSaveStatus('idle');

                },
                preserveScroll: true,
                preserveState: true,
            }
        );
    };
    // ...existing code...
    const debouncedSave = useMemo(() => debounce(handleSave, 1000), []);




    useEffect(() => {
        setContent(document.content || '');
    }, [document.content]);



    const handleCopy = async () => {
        try {
            const blob = new Blob([content], { type: 'text/html' });
            const data = [new ClipboardItem({ 'text/html': blob })];

            await navigator.clipboard.write(data);

            toast.success('Formatted content copied to clipboard');
        } catch (err) {
            console.error('Copy failed:', err);
            toast.error('Failed to copy content');
        }
    };


    // const handleAiRequest = async () => {
    //     if (!aiPrompt.trim()) return;

    //     setIsAiLoading(true);
    //     console.log(document.content)
    //     router.post(
    //         `/document/${document.id}/ai-edit`,
    //         { prompt: aiPrompt },
    //         {
    //             onSuccess: () => {
    //                 router.reload()
    //                 router.reload({ only: ['document'] }); // This will reload just the `document` prop
    //                 setContent(document.content)
    //                 toast.success("AI edit applied");
    //                 setContent(document.content)
    //                 setContent(document.content)
    //                 console.log(document)

    //             },
    //             onError: () => {
    //                 toast.error('AI edit failed');
    //             },
    //             onFinish: () => {
    //                 setIsAiLoading(false);
    //             },
    //         }
    //     );
    // };


    const handleAiRequest = async () => {
        if (!aiPrompt.trim()) return;

        setIsAiLoading(true);
        try {
            const response = await axios.post(`/document/${document.id}/ai-edit`, {
                prompt: aiPrompt,
            });

            // Update state with new content directly
            console.log(response.data.content)
            console.log(response.data.content.content)
            setContent(response.data.content.content);
            setGenerationKey(uuidv4());

            toast.success("AI edit applied");
        } catch (error) {
            toast.error('AI edit failed');
        } finally {
            setIsAiLoading(false);
        }
    };

    const applyAiSuggestion = () => {
        if (!aiResponse) return;

        // In a real app, you would implement the suggestion properly
        toast('Applying AI suggestion...');
        setContent(prev => prev + '\n\n' + aiResponse);
        setAiResponse('');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Docs Edit" />
            <div className="flex h-screen">
                {/* Main Editor Area */}
                {isSidebarOpen && (
                    <div className="w-1/4 border-l p-4 bg-gray-50 dark:bg-gray-800 flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="text-yellow-500" />
                            <h2 className="font-semibold">AI Writing Assistant</h2>
                        </div>

                        <div className="flex-1 space-y-4">
                            <div>
                                <Textarea
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder="Ask AI to improve, summarize, or analyze your document..."
                                    className="min-h-[100px]"
                                />
                                <Button
                                    onClick={handleAiRequest}
                                    disabled={isAiLoading || !aiPrompt.trim()}
                                    className="mt-2 w-full"
                                >
                                    {isAiLoading ? 'Thinking...' : 'Get Suggestions'}
                                </Button>
                            </div>

                            {aiResponse && (
                                <div className="p-4 bg-white dark:bg-gray-700 rounded border">
                                    <h3 className="font-medium mb-2">AI Suggestion:</h3>
                                    <p className="text-sm mb-4">{aiResponse}</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={applyAiSuggestion}
                                        className="w-full"
                                    >
                                        Apply Suggestion
                                    </Button>
                                </div>
                            )}

                            <div className="p-4 bg-white dark:bg-gray-700 rounded border">
                                <h3 className="font-medium mb-2">Quick Actions</h3>
                                <div className="space-y-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => setAiPrompt('Improve the clarity of this document')}
                                    >
                                        Improve Clarity
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => setAiPrompt('Check for grammar and spelling errors')}
                                    >
                                        Check Grammar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => setAiPrompt('Suggest a better structure for this document')}
                                    >
                                        Generated New Doc
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className={`flex-1 overflow-auto ${isSidebarOpen ? 'w-3/4' : 'w-full'}`}>
                    <div className="max-w-4xl mx-auto p-4 space-y-4">

                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => {
                                        setTitle(e.target.value);
                                        setSaveStatus('saving');
                                        debouncedSave(content, e.target.value);
                                    }}
                                    placeholder="Document Title"
                                    className="text-base font-medium bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none px-1 py-0.5 w-48"
                                />

                                <div className="text-xs text-gray-500 w-14">
                                    {saveStatus === 'saving' && <span>Saving...</span>}
                                    {saveStatus === 'saved' && <span className="text-green-600">Saved</span>}
                                    {saveStatus === 'idle' && <span>Idle</span>}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="flex items-center gap-1"
                                >
                                    <Wand2 className="h-4 w-4" />
                                    {isSidebarOpen ? 'Hide AI' : 'Show AI'}
                                </Button>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handleCopy}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={handleDownloadPDF}>
                                            PDF
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleDownloadWord}>
                                            Word Document (.docx)
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <RichTextEditor
                                key={generationKey}
                                initialContent={content}
                                onUpdate={(html) => {
                                    console.log(html)
                                    setContent(html);
                                    debouncedSave(html);
                                }}
                                editable={true} html={null} json={null} />
                        </div>

                    </div>
                </div>

                {/* AI Assistant Sidebar */}

            </div>
        </AppLayout>
    );
};

export default EditorPage;