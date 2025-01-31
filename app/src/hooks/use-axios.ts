import { useContext, useEffect, useState, useRef, useCallback } from "react";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { AuthContext } from "providers/AuthProvider";
import { usePubSub } from "hooks/use-pubsub";

const API_PREFIX = import.meta.env.VITE_API_PREFIX == "/" ? "" : "/api";

interface RequestState<T> {
  loading: boolean;
  data: T | null;
  error: any | null;
}

interface UseGetOptions {
  lazy?: boolean;
}

// interface UsePostOptions {}

export const useAxios = () => {
  const bus = usePubSub();
  const { secret } = useContext(AuthContext);

  const instance = axios.create({
    baseURL: `${API_PREFIX}/admin/v1`,
  });

  // Decorate headers with the admin secret:
  instance.interceptors.request.use((config: any) => {
    if (secret) {
      config.headers["x-pgmate-admin-secret"] = secret;
    }
    return config;
  });

  // Force logout on 401 errors
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle 401 errors
      if (error?.response.status === 401) {
        console.error("Unauthorized: Invalid admin secret");
        bus.emit("auth.error", error);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export const useGet = <T = any>(url: string, options: UseGetOptions = {}) => {
  const axios = useAxios();
  const [state, setState] = useState<RequestState<T>>({
    loading: options.lazy ? false : true,
    data: null,
    error: null,
  });

  const urlRef = useRef<string | null>(null);

  const fetch = useCallback(() => {
    return axios
      .get(url)
      .then((res) => {
        setState({ loading: false, data: res.data, error: null });
      })
      .catch((err) => {
        setState({ loading: false, data: null, error: err });
      });
  }, [url]);

  const refetch = useCallback(() => {
    setState({ loading: true, data: null, error: null });
    return fetch();
  }, [fetch]);

  useEffect(() => {
    // Skip if lazy
    if (options.lazy) return;

    // Debounce request
    if (urlRef.current === url) return;
    urlRef.current = url;

    // Run first load data
    fetch();
  }, [url, fetch, options.lazy]);

  return {
    ...state,
    refetch,
  };
};

export const usePost = <TBody = any, TResponse = any>(
  url: string
  // options: UsePostOptions = {}
): [any, any] => {
  const axios = useAxios();
  const [state, setState] = useState<RequestState<TResponse>>({
    loading: false,
    data: null,
    error: null,
  });

  const fetch = useCallback(
    async (
      body: TBody,
      headers?: Record<string, string>,
      additionalOptions?: AxiosRequestConfig
    ): Promise<AxiosResponse | any> => {
      try {
        const res = await axios.post(url, body, {
          headers,
          ...additionalOptions, // Spread additional Axios options here
        });
        setState({ loading: false, data: res.data, error: null });
        return res;
      } catch (err) {
        setState({ loading: false, data: null, error: err });
        return err;
      }
    },
    [url]
  );

  const refetch = useCallback(
    (
      body: TBody,
      headers?: Record<string, string>,
      additionalOptions?: AxiosRequestConfig
    ) => {
      setState({ loading: true, data: null, error: null });
      return fetch(body, headers, additionalOptions);
    },
    [fetch]
  );

  return [
    refetch,
    {
      ...state,
      refetch,
    },
  ];
};
