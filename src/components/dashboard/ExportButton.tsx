'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Expense {
    id: string;
    description: string;
    amount: number;
    date: string;
    category: string;
}

interface ExportButtonProps {
    expenses: Expense[];
}

export const ExportButton: React.FC<ExportButtonProps> = ({ expenses }) => {
    const handleExport = () => {
        if (!expenses || expenses.length === 0) {
            alert('No hay datos para exportar.');
            return;
        }

        // Definir encabezados
        const headers = ['Fecha', 'Descripción', 'Categoría', 'Monto'];

        // Mapear datos a filas CSV
        const rows = expenses.map(expense => [
            expense.date,
            `"${expense.description.replace(/"/g, '""')}"`, // Escapar comillas
            expense.category,
            expense.amount.toFixed(2)
        ]);

        // Unir todo con comas y saltos de línea
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Crear Blob y link de descarga
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `gastos_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Button
            onClick={handleExport}
            // variant="secondary" // Asumiendo que existe o default
            className="w-full sm:w-auto flex items-center gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
        >
            <Download className="w-4 h-4" />
            Exportar Excel
        </Button>
    );
};
