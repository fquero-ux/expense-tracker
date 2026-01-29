'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export const DateFilter = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Default to empty strings initially, will populate from URL or defaults in useEffect
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const start = searchParams.get('startDate');
        const end = searchParams.get('endDate');

        if (start) setStartDate(start);
        if (end) setEndDate(end);

        // If no params, we could set local defaults for display, 
        // but the server handles the actual default filtering.
        // Let's set the inputs to the current month bounds if URL is empty for better UX
        if (!start && !end) {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString('en-CA');
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toLocaleDateString('en-CA');
            setStartDate(firstDay);
            setEndDate(lastDay);
        }
    }, [searchParams]);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);
        router.push(`/?${params.toString()}`);
    };

    return (
        <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-2 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm w-full sm:w-auto">
            <div>
                <label htmlFor="startDate" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Desde</label>
                <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <label htmlFor="endDate" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Hasta</label>
                <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <button
                type="submit"
                className="w-full sm:w-auto bg-gray-900 dark:bg-gray-700 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors h-[34px]"
            >
                Filtrar
            </button>
        </form>
    );
};
