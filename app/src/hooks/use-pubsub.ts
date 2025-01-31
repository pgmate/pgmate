import { useEffect, useState } from "react";
import EventEmitter from "eventemitter3";
export const bus = new EventEmitter();

const stableStringify = (obj: any): string =>
  JSON.stringify(obj, (_, value) =>
    typeof value === "object" && value !== null
      ? Object.keys(value)
          .sort()
          .reduce<Record<string, any>>((acc, k) => {
            acc[k] = value[k];
            return acc;
          }, {})
      : value
  );

export const usePubSub = () => bus;

export const useSubscribe = (
  event: string,
  callback: (...args: any[]) => void
) => {
  useEffect(() => {
    bus.on(event, callback);
    return () => {
      bus.off(event, callback);
    };
  }, [event, callback]);
};

export const useEventData = <T = any>(event: string) => {
  const [data, setData] = useState<T | null>(null);
  useSubscribe(event, setData);
  return data;
};

export const useEmit = (event: string, data: any, delay = 0) => {
  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        bus.emit(event, data);
      }, delay);
      return () => {
        clearTimeout(timer);
      };
    } else {
      bus.emit(event, data);
    }
  }, [event, stableStringify(data)]);
};
