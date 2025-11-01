import { Api } from '@jellyfin/sdk';
import { Jellyfin } from '@jellyfin/sdk';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAppStore } from './app';

export const useApiStore = defineStore('api', () => {
  const apiKey = ref(undefined);
  const serverAddress = ref('http://localhost:8096');
  const validConnection = ref(false);
  const validAuth = ref(false);
  const appStore = useAppStore();

  let pluginAuthHeader: HeadersInit | undefined = undefined;

  // When we run as plugin we inject address and auth
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (window.ApiClient as any) {
    console.log('Running as Jellyfin Plugin');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    serverAddress.value = ApiClient.serverAddress();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    pluginAuthHeader = { 'MediaBrowser Token': ApiClient.accessToken() };
  }

  // Create a single Jellyfin instance
  const jellyfin = new Jellyfin({
    clientInfo: {
      name: 'Jellyfin Segment Editor',
      version: '0.5.3',
    },
    deviceInfo: {
      name: 'Web Browser',
      id: 'segment-editor-browser',
    },
  });

  // Memoized API instance
  let apiInstance: Api | null = null;

  const toApi = (): Api => {
    if (!apiInstance) {
      apiInstance = jellyfin.createApi(serverAddress.value, apiKey.value);
    }
    return apiInstance;
  }

  const fetchWithAuth = async (
    endpoint: string,
    query?: Map<string, string>,
  ) => {
    let headers: HeadersInit = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    if (pluginAuthHeader) {
      headers = Object.assign(headers, pluginAuthHeader);
    }
    const reqInit: RequestInit = {
      method: 'GET',
      headers: headers,
    };

    const response = await fetch(buildUrl(endpoint, query), reqInit);
    return response;
  };

  /**
   * Builds a final url from endpoint and query with server address and auth
   * @param endpoint endpoint to reach
   * @param query optional query
   * @returns new url
   */
  const buildUrl = (
    endpoint: string,
    query?: Map<string, string>,
  ): RequestInfo => {
    let queryString = '';
    if (!pluginAuthHeader) queryString = `&ApiKey=${apiKey.value}`;

    query?.forEach((value, key) => (queryString += `&${key}=${value}`));
    if (queryString.length > 1) queryString = '?' + queryString.slice(1);

    return `${serverAddress.value}/${endpoint}${queryString}`;
  };

  /**
   * Send post message to server
   * @param body the body to post
   * @param query the query
   */
  const postJson = async (
    endpoint: string,
    body?: string | any,
    query?: Map<string, string>,
  ) => {
    let headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    if (body) {
      body = JSON.stringify(body);
    }

    if (pluginAuthHeader) {
      headers = Object.assign(headers, pluginAuthHeader);
    }

    const reqInit: RequestInit = {
      method: 'POST',
      headers: headers,
      body: body,
    };
    const response = await fetch(buildUrl(endpoint, query), reqInit);

    // filter for broken access
    if (response.status == 401) {
      validAuth.value = false;
    }

    // filter for broken request
    if (response.status == 400) {
      appStore.notify({ type: 'negative', message: 'Bad Request' });
      return false;
    }

    if (response.status === 404) {
      let customMessage = "Resource not found";
      try {
        const jsonData = await response.json();
        if (jsonData && jsonData.message && jsonData.message.trim() !== "") {
          customMessage = jsonData.message;
        }
      } catch (error) {
        console.error("Failed to parse JSON from a 404 response", error);
      }
      appStore.notify({ type: 'negative', message: customMessage });
      return false;
    }

    let jsonData;
    try {
      jsonData = await response.json();
    } catch (error) {
      appStore.notify({ type: 'negative', message: 'Failed to parse JSON from a 200 response' });
    }
    appStore.notify({ type: 'positive', message: 'Segment created successfully' });
    return jsonData;
  };

  /**
   * Send delete message to server. Accepts an object body (e.g. { ItemId, Type })
   * @param endpoint endpoint to call
   * @param body optional object to include as JSON body
   * @param query optional query
   */
  const deleteJson = async (
    endpoint: string,
    body?: any,
    query?: Map<string, string>,
  ) => {
    let headers: HeadersInit = {};
    // If we have a body, ensure content-type
    if (body !== undefined) {
      body = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
    }

    if (pluginAuthHeader) {
      headers = Object.assign(headers, pluginAuthHeader);
    }

    const reqInit: RequestInit = {
      method: 'DELETE',
      body: body,
      headers: headers,
    };
    const response = await fetch(buildUrl(endpoint, query), reqInit);

    // filter for broken access
    if (response.status == 401) {
      validAuth.value = false;
    }

    validConnection.value = response.ok;

    // Try to parse JSON if present
    try {
      const text = await response.text();
      if (text && text.length > 0) {
        return JSON.parse(text);
      }
    } catch (error) {
      // ignore parse errors
    }

    return response.ok;
  };

  // Test if connection and auth is valid
  const testConnection = async () => {
    let response;
    try {
      response = await fetchWithAuth('System/Info');
    } catch (error) {
      console.error('testConnection Error', error);
      validConnection.value = false;
      validAuth.value = false;
      return false;
    }

    validAuth.value = response.status != 401;
    validConnection.value = response.ok;

    return response.ok && validAuth.value;
  };

  const fetchWithAuthJson = async (
    endpoint: string,
    query?: Map<string, string>,
  ) => {
    const response = await fetchWithAuth(endpoint, query);
    // filter for broken access
    if (response.status == 401) {
      validAuth.value = false;
      return [];
    }
    // plugin endpoint tests
    if (response.status === 404) {
      return false;
    }

    const jsonData = await response.json();
    return jsonData;
  };

  return {
    apiKey,
    serverAddress,
    validConnection,
    validAuth,
    toApi,
    fetchWithAuthJson,
    fetchWithAuth,
    testConnection,
    postJson,
    deleteJson,
    buildUrl,
  };
});
