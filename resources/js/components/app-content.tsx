import * as React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';

type Props = React.ComponentProps<'main'> & {
    variant?: 'header' | 'sidebar';
};

export function AppContent({ variant = 'header', children, className = '', ...props }: Props) {
    if (variant === 'sidebar') {
        return (
            <SidebarInset className={`!p-0 !mx-0 !max-w-none w-full flex flex-col h-svh overflow-hidden ${className}`} {...props}>
                {children}
            </SidebarInset>
        );
    }

    return (
        <main
            className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl"
            {...props}
        >
            {children}
        </main>
    );
}