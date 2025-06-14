import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';


const steps = ['projectInfo', 'projectIdea', 'features', 'docType'];

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Product',
        href: '/product',
    },
];
type ValidationRule = (value: string) => true | string;
type ValidationRules = {
    projectInfo: {
        name: ValidationRule;
        description: ValidationRule;
    };
    projectIdea: {
        idea: ValidationRule;
    };
    features: {
        features: ValidationRule;
    };
    docType: {
        docType: ValidationRule;
    };
};

type FormData = {
    name: string;
    description: string;
    idea: string;
    docType: string;
    features: string;
};
export default function ProjectWizard() {
    const [stepIndex, setStepIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        idea: '',
        docType: 'docs',
        features: '',
    });

    type FormDataKey = keyof FormData;


    const validationRules: ValidationRules = {
        projectInfo: {
            name: (value: string) => value.trim().length > 0 || 'Project name is required',
            description: (value: string) => value.trim().length > 10 || 'Description must be at least 10 characters'
        },
        projectIdea: {
            idea: (value: string) => value.trim().length > 20 || 'Please provide a detailed idea (at least 20 characters)'
        },
        features: {
            features: (value: string) => value.trim().length > 0 || 'Please list at least one feature'
        },
        docType: {
            docType: (value: string) => ['docs', 'enhance'].includes(value) || 'Invalid documentation type'
        }
    };

    const validateCurrentStep = (): boolean => {
        const currentStep = steps[stepIndex] as keyof ValidationRules;
        const stepRules = validationRules[currentStep];
        const newErrors: Record<string, string> = {};

        // Type-safe way to iterate through rules
        for (const field in stepRules) {
            if (Object.prototype.hasOwnProperty.call(stepRules, field)) {
                const validator = stepRules[field as keyof typeof stepRules] as ValidationRule;
                const value = formData[field as FormDataKey];
                const error = validator(value);
                if (error !== true) {
                    newErrors[field] = error;
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const goNext = () => {
        if (validateCurrentStep()) {
            setStepIndex((i) => Math.min(i + 1, steps.length - 1));
            setErrors({}); // Clear errors when moving forward
        }
    };

    const goBack = () => {
        setStepIndex((i) => Math.max(i - 1, 0));
        setErrors({}); // Clear errors when moving back
    };
    const updateForm = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };


    const handleSubmit = () => {

        // Validate all steps first
        let allValid = true;
        const allErrors: Record<string, string> = {};

        steps.forEach((step) => {
            const stepKey = step as keyof ValidationRules;
            const stepRules = validationRules[stepKey];

            (Object.entries(stepRules) as Array<[keyof typeof stepRules, ValidationRule]>).forEach(([field, validator]) => {
                const value = formData[field as keyof FormData];
                const error = validator(value);
                if (error !== true) {
                    allErrors[field as string] = error;
                    allValid = false;
                }
            });
        });

        setErrors(allErrors);

        if (!allValid) {
            // Jump to the first step with errors
            const firstErrorStep = steps.find(step => {
                const stepKey = step as keyof ValidationRules;
                return Object.keys(validationRules[stepKey]).some(field => allErrors[field]);
            });
            setStepIndex(steps.indexOf(firstErrorStep || steps[0]));
            toast.error('Please fix all validation errors before submitting');
            return;
        }


        setLoading(true);
        router.post('/project', formData, {
            onStart: () => console.log("Submitting..."),
            onSuccess: () => {
                setLoading(false);
                console.log("Project created!");
            },
            onError: (errors) => {
                setLoading(false);

                for (const key in errors) {
                    if (Object.prototype.hasOwnProperty.call(errors, key)) {
                        const element = errors[key];
                        toast.error(element);
                    }
                }
                console.error("Validation failed", errors);
            },

        });

    };

    // Temporary mock submit for testing without backend
    // const handleSubmit = () => {
    //    
    //     setTimeout(() => {
    //         setLoading(false);
    //         alert('Mock submit successful!\n' + JSON.stringify(formData, null, 2));
    //         // Optionally reset form or navigate
    //     }, 5000);
    // };

    const renderStep = () => {
        switch (steps[stepIndex]) {
            case 'projectInfo':
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">🛠 Project Details</h2>
                            <p className="text-muted-foreground">Give your project a name and a short description.</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <Input
                                    placeholder="Project Name"
                                    value={formData.name}
                                    required
                                    onChange={(e) => updateForm('name', e.target.value)}
                                />
                                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}</div>
                            <div>
                                <Textarea
                                    placeholder="Project Description"
                                    value={formData.description}
                                    className="min-h-[120px]"

                                    onChange={(e) => updateForm('description', e.target.value)}
                                />
                                {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}</div>
                        </div>
                    </div>
                );

            case 'projectIdea':
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">💡 Your Idea</h2>
                            <p className="text-muted-foreground">Explain your product idea so the AI can understand it better.</p>
                        </div>
                        <Textarea
                            placeholder="Describe your project idea..."
                            value={formData.idea}
                            required
                            onChange={(e) => updateForm('idea', e.target.value)}
                            className="min-h-[160px]"
                        />
                    </div>
                );

            case 'docType':
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">📄 Documentation Preference</h2>
                            <p className="text-muted-foreground">Choose how you want the AI to help you document this project.</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Button
                                variant={formData.docType === 'docs' ? 'default' : 'outline'}
                                onClick={() => updateForm('docType', 'docs')}
                            >
                                Just Generate Docs (I have a full idea)
                            </Button>
                            <Button
                                variant={formData.docType === 'enhance' ? 'default' : 'outline'}
                                onClick={() => updateForm('docType', 'enhance')}
                            >
                                Let AI Enhance & Suggest Stack
                            </Button>
                        </div>
                    </div>
                );

            case 'features':
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">🧩 Key Features</h2>
                            <p className="text-muted-foreground">List the main features or requirements for this product.</p>
                        </div>
                        <Textarea
                            placeholder="List the key features you want..."
                            value={formData.features}
                            onChange={(e) => updateForm('features', e.target.value)}
                            className="min-h-[120px]"
                        />
                    </div>
                );

            default:
                return null;
        }
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Product" />
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl text-center space-y-4"
                    >
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            AI is generating the best idea doc for you...
                        </h2>
                        <p className="text-sm text-muted-foreground">Hold tight, this may take a few seconds.</p>
                    </motion.div>
                </div>
            )}


            <div className="w-full h-full px-4 py-10 md:px-8 max-w-4xl mx-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={stepIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Card className="w-full h-full shadow-md">
                            <CardContent className="p-6 space-y-6">{renderStep()}</CardContent>
                            <CardFooter className="flex justify-between border-t p-4">
                                <Button
                                    onClick={goBack}
                                    disabled={stepIndex === 0}
                                    variant="ghost"
                                >
                                    Back
                                </Button>
                                <Button onClick={stepIndex === steps.length - 1 ? handleSubmit : goNext}>
                                    {stepIndex === steps.length - 1 ? 'Finish & Submit' : 'Next'}
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </div>
        </AppLayout>
    );
}
