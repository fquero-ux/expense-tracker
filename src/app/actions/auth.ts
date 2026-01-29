'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // 1. Get data
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // 2. Auth with Supabase
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: 'Credenciales inválidas. Verifica tu email y contraseña.' }
    }

    // 3. User logged in, refresh path and redirect
    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    // 1. Get data
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // 2. Register with Supabase
    const { error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        return { error: 'Error al registrar: ' + error.message }
    }

    // 3. Depends on email confirmation settings, but usually safe to redirect
    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()

    // Redirect to login after logout
    revalidatePath('/', 'layout')
    redirect('/login')
}
