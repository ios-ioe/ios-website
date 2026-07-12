import { supabase } from './supabase-config.js';

/**
 * Submit a project suggestion.
 * @param {{name?: string, category: string, description: string, contact_info: string}} suggestion
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function submitProjectSuggestion(suggestion) {
    if (!supabase) return { ok: false, error: 'Service unavailable, please try again later.' };

    const payload = {
        name: (suggestion.name || '').trim() || null,
        category: (suggestion.category || '').trim(),
        description: (suggestion.description || '').trim(),
        contact_info: (suggestion.contact_info || '').trim()
    };

    if (!payload.category || !payload.description || !payload.contact_info) {
        return { ok: false, error: 'Please fill in all required fields.' };
    }

    const { error } = await supabase.from('project_suggestions').insert(payload);

    if (error) {
        console.error('Error submitting project suggestion:', error);
        return { ok: false, error: 'Something went wrong. Please try again.' };
    }

    return { ok: true };
}