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
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShareProjectDialog } from '@/components/share-project-dialog';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Product',
        href: '/product:id',
    },
];

interface Props {
    project: Project;
    isOwner: boolean;
}

export default function Show({ project, isOwner }: Props) {
    const { props } = usePage();

    const [isGenerating, setIsGenerating] = React.useState(false);
    console.log(project);
    console.log(props);
    console.log(props.permission);
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

    const canView = props.isRelated || props.isOwner;
    if (!canView) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Access Denied" />
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-6 mb-6">
                        <Shield className="h-12 w-12 text-red-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">Access Denied</h2>
                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                        You do not have permission to view this project. Please contact the project owner if you believe this is a mistake.
                    </p>
                    <Button variant="outline" onClick={() => router.visit('/')}>
                        Go to Dashboard
                    </Button>
                </div>
            </AppLayout>
        );
    }

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
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold text-foreground">{project.name}</h1>
                            <p className="text-lg text-muted-foreground">{project.description}</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {project.shared_users?.map((user: any) => (
                                    <Avatar key={user.id} className="h-9 w-9 border border-white">
                                        {user.avatar ? (
                                            <AvatarImage src={user.avatar} />
                                        ) : (
                                            <AvatarFallback>
                                                {user.name
                                                    .split(' ')
                                                    .map((part: string) => part[0])
                                                    .slice(0, 2)
                                                    .join('')
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                ))}
                            </div>

                            {isOwner && <ShareProjectDialog
                                project={project}
                            />}

                        </div>
                    </div>



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
                                isOwner={isOwner}
                                permission={`${props?.permission}`}
                                projectId={project.id}
                                icon={getDocIcon(doc.type)}
                            />
                        ))}
                        {props.permission == "edit" || isOwner &&

                            <NewDocCard
                                projectId={project.id}
                                onGenerate={handleGenerateDocs}
                                disabled={isGenerating}
                            />
                        }

                    </div>
                </motion.div>
            </div>
        </AppLayout>

    );
}
