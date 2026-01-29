'use client';

import { useState } from 'react';
import { addExpense } from '@/app/actions/expenses';
import { Button } from '@/components/ui/Button';

// Categorías definidas en el esquema de base de datos
const CATEGORIES = [
    'Comida',
    'Transporte',
    'Oficina',
    'Software',
    'Servicios',
    'Otros'
];

export const AddExpenseForm = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMessage(null);

        try {
            const result = await addExpense(formData);

            if (result?.error) {
                setMessage({ type: 'error', text: result.error });
            } else {
                setMessage({ type: 'success', text: '¡Gasto registrado correctamente!' });
                // Reset form manually since we are using client component wrapper
                // Or better, use a ref to form, but for simplicity:
                const form = document.querySelector('form') as HTMLFormElement;
                form?.reset();
            }
        } catch (e) {
            setMessage({ type: 'error', text: 'Ocurrió un error inesperado.' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Registrar Nuevo Gasto</h2>

            {message && (
                <div className={`p-3 mb-4 text-sm rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {message.text}
                </div>
            )}

            <form action={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Descripción */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción
                        </label>
                        <input
                            type="text"
                            name="description"
                            id="description"
                            required
                            placeholder="Ej: Almuerzo de trabajo"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                    </div>

                    {/* Monto */}
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                            Monto
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">$</span>
                            <input
                                type="number"
                                name="amount"
                                id="amount"
                                required
                                step="0.01"
                                min="0"
                                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Fecha */}
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha
                        </label>
                        <input
                            type="date"
                            name="date"
                            id="date"
                            required
                            defaultValue={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                    </div>

                    {/* Categoría */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                            Categoría
                        </label>
                        <select
                            name="category"
                            id="category"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                        >
                            <option value="">Selecciona una categoría</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="pt-2">
                    <Button type="submit" disabled={loading} className="w-full md:w-auto">
                        {loading ? 'Guardando...' : 'Guardar Gasto'}
                    </Button>
                </div>
            </form>
        </div>
    );
};
