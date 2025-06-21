import { DocType } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from "./ui/button";
import { MoreVertical } from "lucide-react";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { router } from "@inertiajs/react";

export function DocumentCard({ doc, projectId, icon, permission, isOwner }: {
    doc: DocType;
    projectId: string;
    permission: string;
    isOwner: boolean
    icon: React.ReactNode;
}) {
    const canEdit = permission == "edit" || isOwner;
    return (
        <Card className="hover:shadow-md transition-shadow h-full flex flex-col group">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-muted">
                            {icon}
                        </div>
                        <div>
                            <CardTitle className="text-base line-clamp-1">{doc.title}</CardTitle>
                            <CardDescription className="capitalize">
                                {doc.type.replace('-', ' ')}
                            </CardDescription>
                        </div>
                    </div>
                    <Badge variant={
                        doc.status === 'published' ? 'default' :
                            doc.status === 'generating' ? 'secondary' :
                                'outline'
                    }>
                        {doc.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span>Last updated: {new Date(`${doc?.updated_at}`).toLocaleDateString()}</span>
                        {doc.wordCount && (
                            <span className="text-xs">{doc.wordCount} words</span>
                        )}
                    </div>
                    {doc.status === 'generating' && doc.progress !== undefined && (
                        <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Generating...</span>
                                <span>{doc.progress}%</span>
                            </div>
                            <Progress value={doc.progress} className="h-2" />
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-2">
                <Button onClick={() => router.visit(`/document/${doc.id}/view`)} variant="outline" size="sm" className="flex-1">
                    View
                </Button>
                {canEdit &&
                    <Button
                        onClick={() => router.visit(`/document/${doc.id}/edit`)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled={doc.status === 'generating'}
                    >
                        Edit
                    </Button>
                }
                <Button variant="ghost" size="sm" className="px-2">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}