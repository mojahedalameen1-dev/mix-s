const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const UPLOADS_BASE_URL = import.meta.env.VITE_UPLOADS_URL || (API_BASE_URL ? API_BASE_URL.replace('/api', '') : '');

export const API_URL = (path) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    // If API_BASE_URL is set (production), use it. Otherwise use relative path for local proxy.
    return API_BASE_URL ? `${API_BASE_URL}${cleanPath}` : cleanPath;
};

export const UPLOADS_URL = (path) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    if (UPLOADS_BASE_URL) return `${UPLOADS_BASE_URL}${cleanPath}`;
    return cleanPath;
};
