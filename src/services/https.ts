

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const http = axios.create({ baseURL: API_BASE_URL });

http.interceptors.request.use((config) => {
    const session:AuthSession | null = authStorage.get();
    if (session?.token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${session.token}`;
    }
    return config;
})

http.interceptors.response.use( (response) => response, (error) => {
    if (error.response.status === 401) {
        authStorage.clear();
        window.location.href = '/login';
    }
    return Promise.reject(error);
})