export function sanitizeSearchString(search: string): string {
    if (!search) return '';
    // Escape standard SQL wildcards: %, _, and \
    return search.replace(/[\\%_]/g, '\\$&');
}

export function buildFuzzySearchPattern(search: string): string {
    if (!search) return '';
    const sanitized = sanitizeSearchString(search);
    // Split into non-whitespace characters and join with %
    const chars = sanitized.split('').filter(c => c.trim().length > 0);
    return `%${chars.join('%')}%`;
}
