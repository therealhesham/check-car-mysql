export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    let accessToken = localStorage.getItem('accessToken');
  
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };
  
    let response = await fetch(url, { ...options, headers });
  
    if (response.status === 403) {
      // محاولة تجديد التوكن
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        const refreshResponse = await fetch('/api/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
  
        const refreshData = await refreshResponse.json();
        if (refreshData.accessToken) {
          localStorage.setItem('accessToken', refreshData.accessToken);
          headers.Authorization = `Bearer ${refreshData.accessToken}`;
          response = await fetch(url, { ...options, headers });
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }
  
    return response;
  }