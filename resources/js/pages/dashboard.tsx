import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { DocCategory, DocType, Project, type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, ChevronDown, FileText, Code, LayoutTemplate, ClipboardList, Users, Shield, Server, GitBranch, MessageSquare, TestTube2, Search, MoreVertical, Trash } from 'lucide-react';
import React from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { features } from 'process';
import { DocumentCard } from '@/components/document-card';
import { NewDocCard } from '@/components/new-doc-card';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];





export default function Dashboard() {
    // const [projects, setProjects] = React.useState<Project[]>();
    const { props } = usePage();
    console.log(props);
    const pros: Project[] = (props.projects as { data: Project[] }).data;
    const [projects, setProjects] = React.useState<Project[]>(pros);
    const [viewMode, setViewMode] = React.useState<'list' | 'grid'>('grid');
    const [open, setOpen] = React.useState(false);

    const [searchQuery, setSearchQuery] = React.useState('');
    const [expandedProject, setExpandedProject] = React.useState<string | null>(null);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [isDeleteing, setIsDeleting] = React.useState(false);

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tech_stack && project.tech_stack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    console.log(projects);



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

    const handleGenerateDocs = (projectId: string, docType: DocCategory) => {
        setIsGenerating(true);
        // Simulate AI generation
        setTimeout(() => {
            setProjects(prev => prev.map(project => {
                if (project.id === projectId) {
                    const newDoc: DocType = {
                        id: `${projectId}-${Date.now()}`,
                        title: `${docType.charAt(0).toUpperCase() + docType?.slice(1)} Documentation`,
                        type: docType,
                        status: 'generating',
                        progress: 0
                    };

                    // Simulate progress
                    let currentProgress = 0;
                    const interval = setInterval(() => {
                        setProjects(prev => prev.map(p => {
                            if (p.id === projectId) {
                                const updatedDocs = p.documents.map(d => {
                                    if (d.id === newDoc.id) {
                                        currentProgress = Math.min(100, (d.progress || 0) + 10);
                                        return {
                                            ...d,
                                            progress: currentProgress,
                                            status: (currentProgress === 100 ? 'published' : 'generating') as 'generating' | 'draft' | 'published' | 'archived'
                                        };
                                    }
                                    return d;
                                });
                                return { ...p, documents: updatedDocs };
                            }
                            return p;
                        }));

                        if (currentProgress === 100) {
                            clearInterval(interval);
                            setIsGenerating(false);
                        }
                    }, 500);

                    return {
                        ...project,
                        documents: [...project.documents, newDoc],
                        lastModified: new Date().toISOString()
                    };
                }
                return project;
            }));





        }, 1000);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col h-full p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Documentation Projects</h1>
                        <p className="text-muted-foreground">
                            AI-generated documentation for your projects
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search projects..."
                                className="pl-9 w-full sm:w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />

                        </div>
                        {/*  */}
                        <Link href={route('project.form')} className="btn btn-outline">

                            <Button>
                                New Project
                            </Button>
                        </Link>

                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => setViewMode('list')}
                        >
                            <ClipboardList className="w-4 h-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutTemplate className="w-4 h-4" />
                        </Button>
                    </div>

                </div>

                {/* Projects List */}
                <div className="space-y-4">
                    {filteredProjects.length > 0 ? (
                        viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.map((project) => (
                                    <Card key={project.id}
                                        onClick={() => router.visit(`/projects/${project.id}`)}
                                        className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                                        <CardHeader>
                                            <div className='flex justify-between'>
                                                <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                                                <Dialog open={open} onOpenChange={setOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            className="ml-2"
                                                            onClick={e => e.stopPropagation()}
                                                            title="Delete Project"
                                                        >
                                                            <Trash className="w-4 h-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent onClick={e => e.stopPropagation()}>
                                                        <DialogHeader>
                                                            <DialogTitle> {isDeleteing ? "Deleting Project" : "Delete Project"}</DialogTitle>
                                                            {isDeleteing && <DialogDescription>

                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    exit={{ opacity: 0 }}
                                                                    transition={{ duration: 0.3 }}
                                                                    className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl text-center space-y-4"
                                                                >
                                                                    <div className="flex justify-center">
                                                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500" />
                                                                    </div>   <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                                        We are deleting all the document, files, images, that is releted to <b>{project.name}</b>
                                                                    </h2>
                                                                    <p className="text-sm text-muted-foreground">Hold tight, this may take a few seconds.</p>
                                                                </motion.div>

                                                            </DialogDescription>}
                                                            {!isDeleteing && <DialogDescription>
                                                                Are you sure you want to delete $ {<b>{project.name}</b>}? This action cannot be undone.
                                                            </DialogDescription>}
                                                        </DialogHeader>
                                                        <div className="flex justify-end gap-2 mt-4">
                                                            <Button variant="outline" onClick={() => { setOpen(false) }}>
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                onClick={() => {
                                                                    // Add loading state and close dialog after delete
                                                                    setIsDeleting(true);
                                                                    router.delete(`/projects/${project.id}`, {
                                                                        onFinish: () => {
                                                                            setIsDeleting(false);
                                                                            // Close dialog by blurring the active element
                                                                            setProjects(prev => prev.filter(p => p.id !== project.id));


                                                                            setOpen(false)
                                                                            // Remove the project from the list after deletion

                                                                        }
                                                                    });
                                                                }}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                            <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex flex-wrap gap-2">
                                                {project.tech_stack?.slice(0, 3).map((tech) => (
                                                    <Badge key={tech} variant="secondary">{tech}</Badge>
                                                ))}
                                                {project.tech_stack && project.tech_stack?.length > 3 && (
                                                    <Badge variant="outline">+{project.tech_stack?.length - 3}</Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex justify-between text-sm text-muted-foreground">
                                            <span>{project.documents.length} docs</span>
                                            <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>) : (


                            filteredProjects.map((project) => (

                                <Collapsible
                                    key={project.id}
                                    open={expandedProject === project.id}
                                    onOpenChange={(open) => setExpandedProject(open ? project.id : null)}
                                    className="border rounded-lg bg-background/50 backdrop-blur-sm"
                                >
                                    <CollapsibleTrigger asChild>
                                        <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-medium truncate">{project.name}</h3>
                                                        <div className="flex gap-1">
                                                            {project.tech_stack?.slice(0, 2).map(tech => (
                                                                <Badge key={tech} variant="secondary" className="truncate">
                                                                    {tech}
                                                                </Badge>
                                                            ))}
                                                            {project.tech_stack && project.tech_stack?.length > 2 && (
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Badge variant="outline" className="truncate">
                                                                            +{project.tech_stack?.length - 2}
                                                                        </Badge>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        {project.tech_stack?.slice(2).join(', ')}
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {project.description}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="shrink-0">
                                                        {project.documents?.length} docs
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        Modified: {new Date(project.updated_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronDown className={`h-5 w-5 transition-transform ${expandedProject === project.id ? 'rotate-180' : ''
                                                }`} />
                                        </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="p-4 pt-0 border-t">
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
                                    </CollapsibleContent>
                                </Collapsible>
                            ))
                        )) : (
                        <div className="flex flex-col items-center justify-center h-64 rounded-lg border border-dashed bg-muted/50">
                            <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">No projects found</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {searchQuery ? 'Try a different search' : 'Create your first project'}
                            </p>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Project
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}





