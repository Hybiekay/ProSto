import React, { useState } from 'react';
import RichTextEditor from '@/components/docs-editor';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Save, Download, Copy, Sparkles, Wand2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Docs Editor',
        href: '/project-editor',
    },
];
const EditorPage = () => {
    const [content, setContent] = useState<string>('<h2>My Document</h2><p>Edit me!</p>');
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleSave = () => {
        toast.success('Document saved successfully', {
            description: 'All your changes have been saved',
            action: {
                label: 'Undo',
                onClick: () => console.log('Undo save'),
            },
        });
    };

    const handleDownload = () => {
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.html';
        a.click();
        URL.revokeObjectURL(url);

        toast('Download started', {
            description: 'Your document is being downloaded',
            icon: <Download className="w-4 h-4" />,
        });
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            toast.success('Copied to clipboard');
        } catch (err) {
            toast.error('Failed to copy content');
        }
    };

    const handleAiRequest = async () => {
        if (!aiPrompt.trim()) return;

        setIsAiLoading(true);
        try {
            // Simulate AI API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock response - in a real app you would call your AI API
            const mockResponses = [
                "Consider adding more details about your project goals in the introduction.",
                "Your document could benefit from bullet points to highlight key features.",
                "The structure looks good! Maybe add some examples to illustrate your points.",
                "I suggest breaking this into smaller paragraphs for better readability."
            ];

            const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
            setAiResponse(response);
        } catch (error) {
            toast.error('Failed to get AI response');
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
                                        Improve Structure
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className={`flex-1 overflow-auto ${isSidebarOpen ? 'w-3/4' : 'w-full'}`}>
                    <div className="max-w-4xl mx-auto p-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <h1 className="text-2xl font-bold">Document Editor</h1>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="flex items-center gap-2"
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
                                <Button variant="outline" onClick={handleDownload}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </Button>
                                <Button onClick={handleSave}>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save
                                </Button>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <RichTextEditor
                                initialContent={content}
                                onUpdate={(html) => setContent(html)}
                                editable={true} html={null} json={null} />
                        </div>

                        {/* Preview section */}
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold mb-2">HTML Preview</h2>
                            <div className="p-4 bg-gray-50 rounded border border-gray-200 overflow-auto max-h-60">
                                <code className="text-sm text-gray-700">
                                    {content}
                                </code>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Assistant Sidebar */}

            </div>
        </AppLayout>
    );
};

export default EditorPage;