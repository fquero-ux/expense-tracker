'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { deleteExpense } from '@/app/actions/expenses';
import { Modal } from '@/components/ui/Modal';
import { ExpenseForm } from './ExpenseForm';

interface Expense {
    id: string;
    description: string;
    amount: number;
    date: string;
    category: string;
}

interface ExpenseTableProps {
    expenses?: Expense[];
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({ expenses = [] }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    const [showMobileTable, setShowMobileTable] = useState(false);

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este gasto?')) return;

        setIsDeleting(true);
        try {
            await deleteExpense(id);
        } catch (error) {
            alert('Error al eliminar');
        } finally {
            setIsDeleting(false);
        }
    };

    if (expenses.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">No hay movimientos recientes.</p>
                <p className="text-sm text-gray-400">Registra tu primer gasto para verlo aquí.</p>
            </div>
        );
    }

    return (
        <>
            {/* Mobile Toggle Button */}
            <div className="md:hidden mb-4 flex justify-end">
                <button
                    onClick={() => setShowMobileTable(!showMobileTable)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
                >
                    {showMobileTable ? 'Ver como Tarjetas' : 'Ver Tabla Detallada'}
                </button>
            </div>

            {/* Mobile Card View */}
            <div className={`space-y-3 md:hidden ${showMobileTable ? 'hidden' : 'block'}`}>
                {expenses.map((expense) => (
                    <div key={expense.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        {/* Top: Category + Amount */}
                        <div className="flex justify-between items-center mb-3">
                            <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-md">
                                {expense.category}
                            </span>
                            <p className="font-bold text-gray-900 dark:text-white text-xl">
                                ${Number(expense.amount).toLocaleString('es-CL', { maximumFractionDigits: 0 })}
                            </p>
                        </div>

                        {/* Middle: Description */}
                        <p className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">{expense.description}</p>

                        {/* Bottom: Date + Actions */}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-gray-400 dark:text-gray-500 text-xs">{expense.date}</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditingExpense(expense)}
                                    className="p-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                                    title="Editar"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(expense.id)}
                                    disabled={isDeleting}
                                    className="p-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                                    title="Eliminar"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop/Detailed Table */}
            <div className={`overflow-hidden rounded-lg border border-gray-200 shadow-sm ${!showMobileTable ? 'hidden md:block' : 'block overflow-x-auto'}`}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Acciones</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {expenses.map((expense) => (
                            <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                    ${Number(expense.amount).toLocaleString('es-CL', { maximumFractionDigits: 0 })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {expense.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setEditingExpense(expense)}
                                            className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                                            title="Editar"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(expense.id)}
                                            disabled={isDeleting}
                                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded disabled:opacity-50"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={!!editingExpense}
                onClose={() => setEditingExpense(null)}
                title="Editar Gasto"
            >
                {editingExpense && (
                    <ExpenseForm
                        expense={editingExpense}
                        onSuccess={() => setEditingExpense(null)}
                    />
                )}
            </Modal>
        </>
    );
};
