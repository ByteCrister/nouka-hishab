export function sanitizeSearchString(search: string): string {
    if (!search) return '';
    // Escape standard SQL wildcards: %, _, and \
    return search.replace(/[\\%_]/g, '\\$&');
}
