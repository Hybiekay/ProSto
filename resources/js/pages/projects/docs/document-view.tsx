import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types'
import { Head } from '@inertiajs/react'
import React from 'react'

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Docs View',
        href: '/Document-view',
    },
]

export default function DocumentView({ document }: { document: any }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Docs View" />
            <div className="flex justify-center px-4 sm:px-6 lg:px-8 py-8">
                <div className="prose prose-neutral dark:prose-invert max-w-4xl w-full bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-md dark:shadow-lg transition-colors">
                    <div dangerouslySetInnerHTML={{ __html: document.content }} />
                </div>
            </div>
        </AppLayout>
    )
}
