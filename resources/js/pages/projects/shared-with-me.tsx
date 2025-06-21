import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { DocCategory, DocType, Project, type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ChevronDown, FileText, Code, LayoutTemplate, ClipboardList, Shield, Server, GitBranch, MessageSquare, TestTube2, Search } from 'lucide-react';
import React from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { DocumentCard } from '@/components/document-card';
import { NewDocCard } from '@/components/new-doc-card';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Shared With Me',
        href: '/shared',
    },
];

export default function SharedWithMe() {
    const { props } = usePage();

    // Safely get shared projects data with fallback
    const initialProjects = props?.projects || [];
    const [projects, setProjects] = React.useState<Project[]>(initialProjects);
    const [viewMode, setViewMode] = React.useState<'list' | 'grid'>('grid');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [expandedProject, setExpandedProject] = React.useState<string | null>(null);
    const [isGenerating, setIsGenerating] = React.useState(false);
    // Safe filtering with null checks
    console.log(props);
    console.log(props.permission);
    const filteredProjects = React.useMemo(() => {
        return projects.filter(project => {
            const matchesName = project.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
            const matchesDescription = project.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
            const matchesTech = project.tech_stack?.some(tech =>
                tech?.toLowerCase().includes(searchQuery.toLowerCase())
            ) || false;

            return matchesName || matchesDescription || matchesTech;
        });
    }, [projects, searchQuery]);

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
            <Head title="Shared With Me" />
            <div className="flex flex-col h-full p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Shared Projects</h1>
                        <p className="text-muted-foreground">
                            Projects shared with you by other team members
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search shared projects..."
                                className="pl-9 w-full sm:w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
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
                </div>

                {/* Projects List */}
                <div className="space-y-4">
                    {filteredProjects.length > 0 ? (
                        viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProjects.map((project) => (
                                    <Card key={project.id}
                                        onClick={() => router.visit(`/projects/${project.id}`)}
                                        className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                                        <CardHeader>
                                            <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                                            <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex flex-wrap gap-2">
                                                {project.tech_stack?.slice(0, 3).map((tech) => (
                                                    <Badge key={tech} variant="secondary">{tech}</Badge>
                                                ))}
                                                {project.tech_stack && project.tech_stack.length > 3 && (
                                                    <Badge variant="outline">+{project.tech_stack.length - 3}</Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex justify-between text-sm text-muted-foreground">
                                            <span>{project.documents?.length || 0} docs</span>
                                            <span>Shared by: {project.owner?.name || 'Unknown'}</span>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        ) : (
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
                                                            {project.tech_stack && project.tech_stack.length > 2 && (
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Badge variant="outline" className="truncate">
                                                                            +{project.tech_stack.length - 2}
                                                                        </Badge>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        {project.tech_stack.slice(2).join(', ')}
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
                                                        {project.documents?.length || 0} docs
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        Shared by: {project.owner?.name || 'Unknown'}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronDown className={`h-5 w-5 transition-transform ${expandedProject === project.id ? 'rotate-180' : ''}`} />
                                        </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="p-4 pt-0 border-t">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {project.documents?.map((doc) => (
                                                <DocumentCard
                                                    key={doc.id}
                                                    doc={doc}
                                                    isOwner={false}
                                                    permission={`${props.permission}`}
                                                    projectId={project.id}
                                                    icon={getDocIcon(doc.type)}
                                                />
                                            ))}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            ))
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 rounded-lg border border-dashed bg-muted/50">
                            <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">No shared projects found</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {searchQuery ? 'No matches for your search' : 'No projects have been shared with you yet'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}