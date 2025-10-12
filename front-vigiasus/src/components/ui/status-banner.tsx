"use client";

import React from 'react';
import { Star, AlertTriangle, Info, Trash2 } from 'lucide-react';

type Variant = 'success' | 'warning' | 'danger' | 'info';

interface StatusBannerProps {
    variant?: Variant;
    title?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}

const variantStyles: Record<Variant, { container: string; icon: string } > = {
    success: { container: 'bg-green-50 border-l-4 border-green-500 text-green-900', icon: 'text-green-600' },
    warning: { container: 'bg-yellow-50 border-l-4 border-yellow-400 text-yellow-900', icon: 'text-yellow-600' },
    danger: { container: 'bg-red-50 border-l-4 border-red-500 text-red-900', icon: 'text-red-600' },
    info: { container: 'bg-blue-50 border-l-4 border-blue-400 text-blue-900', icon: 'text-blue-600' },
};

export function StatusBanner({ variant = 'info', title, children, className = '' }: StatusBannerProps) {
    const styles = variantStyles[variant];

    const Icon = variant === 'success' ? Star : variant === 'warning' ? AlertTriangle : variant === 'danger' ? Trash2 : Info;

    return (
        <div className={`${styles.container} p-4 rounded-r-lg shadow-sm space-y-3 ${className}`}>
            {title && <div className="flex items-center gap-3">
                <div className={`flex-shrink-0`}><Icon className={`w-6 h-6 ${styles.icon}`} /></div>
                <div className="min-w-0">
                    <div className="font-bold">{title}</div>
                    {/* children may include subtitle or extra content */}
                </div>
            </div>}
            {children}
        </div>
    );
}

export default StatusBanner;
