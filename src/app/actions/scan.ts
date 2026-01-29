'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function scanReceipt(formData: FormData) {
    const file = formData.get('receipt') as File;

    if (!file) {
        return { error: 'No se subió ninguna imagen.' };
    }

    if (!process.env.GEMINI_API_KEY) {
        return { error: 'Clave de API de Gemini no configurada.' };
    }

    try {
        console.log('Server Action: scanReceipt called');
        console.log(`File: ${file.name}, Size: ${file.size}, Type: ${file.type}`);
        console.log(`API Key configured: ${!!process.env.GEMINI_API_KEY}`);

        // Convertir File a Base64
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        console.log('Image converted to base64');

        // Configurar modelo - Usando 2.0 ya que 1.5 puede estar deprecado en 2026
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `
            Analiza esta imagen de una boleta o recibo.
            Extrae la siguiente información en formato JSON estricto (sin markdown):
            {
                "description": "Una descripción corta de qué es (ej: Almuerzo MacDonalds)",
                "amount": 123.45 (solo el número),
                "date": "YYYY-MM-DD" (la fecha de la boleta, si no hay usa la fecha de hoy),
                "category": "Una de estas: Comida, Transporte, Oficina, Software, Servicios, Otros"
            }
            Si no puedes identificar algo, usa valores por defecto razonables o null.
        `;

        console.log('Sending request to Gemini...');
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64,
                    mimeType: file.type
                }
            }
        ]);

        console.log('Response received from Gemini');
        const response = await result.response;
        const text = response.text();
        console.log(`Raw response text: ${text}`);

        // Limpiar JSON (a veces Gemini devuelve ```json ... ```)
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonString);
        console.log(`Parsed data: ${JSON.stringify(data)}`);

        return { success: true, data };

    } catch (error: any) {
        console.error('Error scanning receipt:', error);

        // Handle Rate Limiting (429)
        if (error.message?.includes('429') || error.status === 429) {
            return { error: 'Cuota de IA excedida. Por favor espera un minuto e intenta de nuevo.' };
        }

        return { error: 'Error al analizar la boleta con IA.' };
    }
}
