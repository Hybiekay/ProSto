import { DocCategory } from "@/types";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

export function NewDocCard({ projectId, onGenerate, disabled }: {
    projectId: string;
    onGenerate: (projectId: string, docType: DocCategory) => void;
    disabled: boolean;
}) {
    const docTypes: { type: DocCategory; label: string }[] = [
        { type: 'technical', label: 'Technical Docs' },
        { type: 'ui-ux', label: 'UI/UX Docs' },
        { type: 'product', label: 'Product Docs' },
        { type: 'collaboration', label: 'Collaboration' },
        { type: 'client', label: 'Client Docs' },
        { type: 'testing', label: 'Testing Docs' },
        { type: 'security', label: 'Security Docs' },
        { type: 'operations', label: 'Operations Docs' },
    ];

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="h-full min-h-[120px] flex flex-col items-center justify-center gap-2 hover:border-primary"
                    disabled={disabled}
                >
                    <Plus className="h-6 w-6" />
                    <span>Add Documentation</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Generate New Documentation</DialogTitle>
                    <DialogDescription>
                        Select the type of documentation to generate
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    {docTypes.map(({ type, label }) => {
                        const readyFeatures = type === 'technical' || type === 'ui-ux';

                        return (
                            <Button
                                key={type}
                                variant="outline"
                                className="h-24 flex flex-col gap-1 items-center justify-center text-center relative"
                                onClick={() => onGenerate(projectId, type)}
                                disabled={disabled}
                            >
                                <span>{label}</span>
                                {!readyFeatures && (
                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                                        Coming Soon
                                    </span>
                                )}
                            </Button>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}