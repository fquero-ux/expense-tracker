'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addExpense(formData: FormData) {
    const supabase = await createClient()

    // 1. Verificar Autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        // SECURITY: Early return if no user. 
        // RLS would block it anyway, but this gives a better error message.
        return { error: 'Usuario no autenticado. Inicia sesión.' }
    }

    // 2. Extraer y Validar Datos
    const description = formData.get('description')?.toString()
    const amountRaw = formData.get('amount')?.toString()
    const category = formData.get('category')?.toString()
    const date = formData.get('date')?.toString()

    if (!description || !amountRaw || !category || !date) {
        return { error: 'Todos los campos son requeridos' }
    }

    const amount = parseFloat(amountRaw)
    if (isNaN(amount)) {
        return { error: 'El monto debe ser un número válido' }
    }

    // 3. Insertar en Supabase
    const { error } = await supabase
        .from('expenses')
        .insert({
            description,
            amount,
            category,
            date,
            user_id: user.id
        })

    if (error) {
        console.error('Error Inserting Expense:', error)
        return { error: 'Error al registrar el gasto en la base de datos' }
    }

    // 4. Actualizar la UI
    revalidatePath('/')
    return { success: true }
}

export async function deleteExpense(id: string) {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: 'Usuario no autenticado' }
    }

    const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting expense:', error)
        return { error: 'Error al eliminar el gasto' }
    }

    revalidatePath('/')
    return { success: true }
}

export async function updateExpense(id: string, formData: FormData) {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: 'Usuario no autenticado' }
    }

    const description = formData.get('description')?.toString()
    const amountRaw = formData.get('amount')?.toString()
    const category = formData.get('category')?.toString()
    const date = formData.get('date')?.toString()

    if (!description || !amountRaw || !category || !date) {
        return { error: 'Todos los campos son requeridos' }
    }

    const amount = parseFloat(amountRaw)
    if (isNaN(amount)) {
        return { error: 'El monto debe ser un número válido' }
    }

    const { error } = await supabase
        .from('expenses')
        .update({
            description,
            amount,
            category,
            date
        })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error updating expense:', error)
        return { error: 'Error al actualizar el gasto' }
    }

    revalidatePath('/')
    return { success: true }
}
