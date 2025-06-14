import React from 'react';
import { BreadcrumbItem, Project } from '@/types';
import { motion } from 'framer-motion';
import { DocumentCard } from '@/components/document-card';
import { NewDocCard } from '@/components/new-doc-card';
import { DocCategory } from '@/types';
import {
    Code, Server, LayoutTemplate, ClipboardList,
    GitBranch, MessageSquare, TestTube2, Shield, FileText
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Product',
        href: '/product:id',
    },
];

interface Props {
    project: Project;
}

export default function Show({ project }: Props) {
    const [isGenerating, setIsGenerating] = React.useState(false);

    const handleGenerateDocs = (projectId: string, docType: DocCategory) => {
        setIsGenerating(true);
        setTimeout(() => {
            // Simulate logic here
            setIsGenerating(false);
        }, 1000);
    };

    const getDocIcon = (type: DocCategory) => {
        const icons = {
            'technical': <Code className="h-4 w-4" />,
            'ui-ux': <LayoutTemplate className="h-4 w-4" />,
            'product': <ClipboardList className="h-4 w-4" />,
            'collaboration': <GitBranch className="h-4 w-4" />,
            'client': <MessageSquare className="h-4 w-4" />,
            'testing': <TestTube2 className="h-4 w-4" />,
            'security': <Shield className="h-4 w-4" />,
            'operations': <Server className="h-4 w-4" />
        };
        return icons[type] || <FileText className="h-4 w-4" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product" />
            <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-2"
                >
                    <h1 className="text-4xl font-bold text-foreground">{project.name}</h1>
                    <p className="text-lg text-muted-foreground">{project.description}</p>

                    <div className="flex flex-wrap gap-2 mt-3">
                        {project.tech_stack && project.tech_stack.map((tech) => (
                            <span
                                key={tech}
                                className="bg-muted text-foreground text-sm px-3 py-1 rounded-full font-medium"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </motion.div>

                {/* Project Details */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-background border rounded-2xl shadow p-6 space-y-4"
                >
                    <p>
                        <span className="font-semibold text-foreground">Target Audience:</span>{' '}
                        <span className="text-muted-foreground">{project.target_audience}</span>
                    </p>
                    <p>
                        <span className="font-semibold text-foreground">Enhanced Mode:</span>{' '}
                        <span
                            className={`inline-block text-sm px-2 py-1 rounded font-medium ${project.enhanced_mode
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-muted text-muted-foreground'
                                }`}
                        >
                            {project.enhanced_mode ? 'Yes' : 'No'}
                        </span>
                    </p>
                    <p>
                        <span className="font-semibold text-foreground">Project Idea:</span>{' '}
                        <span className="text-muted-foreground">{project.project_idea}</span>
                    </p>
                </motion.div>

                {/* Documents Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <h2 className="text-2xl font-semibold mb-4 text-foreground">Documents</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {project.documents.map((doc) => (
                            <DocumentCard
                                key={doc.id}
                                doc={doc}
                                projectId={project.id}
                                icon={getDocIcon(doc.type)}
                            />
                        ))}
                        <NewDocCard
                            projectId={project.id}
                            onGenerate={handleGenerateDocs}
                            disabled={isGenerating}
                        />
                    </div>
                </motion.div>
            </div>
        </AppLayout>

    );
}
