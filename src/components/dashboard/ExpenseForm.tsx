'use client';

import { useState, useRef } from 'react';
import { addExpense, updateExpense } from '@/app/actions/expenses';
import { scanReceipt } from '@/app/actions/scan';
import { Button } from '@/components/ui/Button';
import { Camera, Loader2 } from 'lucide-react';

// Categorías definidas (se podrían mover a una constante global)
const CATEGORIES = [
    'Comida',
    'Transporte',
    'Oficina',
    'Software',
    'Servicios',
    'Otros'
];

interface Expense {
    id: string;
    description: string;
    amount: number;
    date: string;
    category: string;
}

interface ExpenseFormProps {
    expense?: Expense;
    onSuccess?: () => void;
}

export const ExpenseForm = ({ expense, onSuccess }: ExpenseFormProps) => {
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isEditing = !!expense;

    const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setScanning(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('receipt', file);

        try {
            const result = await scanReceipt(formData);

            if (result.error) {
                setMessage({ type: 'error', text: result.error });
            } else if (result.data) {
                // Auto-fill form
                const form = document.querySelector('form') as HTMLFormElement;
                if (form) {
                    const descInput = form.elements.namedItem('description') as HTMLInputElement;
                    const amountInput = form.elements.namedItem('amount') as HTMLInputElement;
                    const dateInput = form.elements.namedItem('date') as HTMLInputElement;
                    const catSelect = form.elements.namedItem('category') as HTMLSelectElement;

                    if (descInput) descInput.value = result.data.description || '';
                    if (amountInput) amountInput.value = result.data.amount || '';
                    if (dateInput) dateInput.value = result.data.date || new Date().toISOString().split('T')[0];
                    if (catSelect) {
                        catSelect.value = result.data.category;
                    }
                    setMessage({ type: 'success', text: '¡Boleta analizada! Revisa los datos.' });
                }
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error de conexión con el escáner.' });
        } finally {
            setScanning(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMessage(null);

        try {
            let result;

            if (isEditing && expense) {
                result = await updateExpense(expense.id, formData);
            } else {
                result = await addExpense(formData);
            }

            if (result?.error) {
                setMessage({ type: 'error', text: result.error });
            } else {
                setMessage({
                    type: 'success',
                    text: isEditing ? '¡Gasto actualizado!' : '¡Gasto registrado!'
                });

                if (!isEditing) {
                    const form = document.querySelector('form') as HTMLFormElement;
                    form?.reset();
                }

                if (onSuccess) {
                    setTimeout(() => onSuccess(), 1000);
                }
            }
        } catch (e) {
            setMessage({ type: 'error', text: 'Ocurrió un error inesperado.' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={!isEditing ? "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700" : ""}>
            {!isEditing && (
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 h-full my-auto">Registrar Nuevo Gasto</h2>

                    {/* Scan Button */}
                    <div>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleScan}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={scanning || loading}
                            className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-md transition-colors"
                        >
                            {scanning ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Camera className="w-4 h-4" />
                            )}
                            {scanning ? 'Analizando...' : 'Escanear Boleta'}
                        </button>
                    </div>
                </div>
            )}

            {message && (
                <div className={`p-3 mb-4 text-sm rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {message.text}
                </div>
            )}

            <form action={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Monto (Primero) */}
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Monto
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">$</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                name="amount"
                                id="amount"
                                required
                                defaultValue={expense?.amount}
                                placeholder="0"
                                className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700"
                            />
                        </div>
                    </div>

                    {/* Descripción */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Descripción
                        </label>
                        <input
                            type="text"
                            name="description"
                            id="description"
                            required
                            defaultValue={expense?.description}
                            placeholder="Ej: Almuerzo de trabajo"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Fecha */}
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Fecha
                        </label>
                        <input
                            type="date"
                            name="date"
                            id="date"
                            required
                            defaultValue={expense?.date || new Date().toLocaleDateString('en-CA')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700"
                        />
                    </div>

                    {/* Categoría (Custom) */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Categoría
                        </label>
                        <input
                            list="categories-list"
                            name="category"
                            id="category"
                            required
                            defaultValue={expense?.category}
                            placeholder="Escribe o selecciona..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                        />
                        <datalist id="categories-list">
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat} />
                            ))}
                        </datalist>
                    </div>
                </div>

                <div className="pt-2">
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? 'Guardando...' : (isEditing ? 'Actualizar Gasto' : 'Guardar Gasto')}
                    </Button>
                </div>
            </form>
        </div>
    );
};
