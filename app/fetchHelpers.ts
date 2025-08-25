// fetchHelpers.ts

// تعريف نوع مخصص متوافق مع HeadersInit
type CustomHeaders = Record<string, string> & {
    'Content-Type'?: string;
    Authorization?: string;
  };
  
  export const getAuthHeaders = (): CustomHeaders => {
    const headers: CustomHeaders = {
      'Content-Type': 'application/json',
    };
    return headers;
  };
  
  export const fetchWithAuth = async (
    url: string,
    options: RequestInit = {},
    includeAuth: boolean = false // تعطيل التوكن افتراضيًا
  ): Promise<Response> => {
    const headers: CustomHeaders = getAuthHeaders();
    if (includeAuth) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      console.log('Token in fetchWithAuth:', token);
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        console.log('Authorization Header:', headers.Authorization);
      } else {
        console.warn('لم يتم العثور على التوكن في localStorage.');
      }
    }
    console.log('Fetch Headers for', url, ':', headers);
    const fetchOptions: RequestInit = {
      ...options,
      headers,
    };
    const response = await fetch(url, fetchOptions);
    console.log('Response Status for', url, ':', response.status);
    return response;
  };