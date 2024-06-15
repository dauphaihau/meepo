import type { ClassArray } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { EnumLike } from 'zod';

export function cn(...inputs: ClassArray) {
  return twMerge(clsx(inputs));
}

export function formatTextWithHashTags(text: string) {
  if (!text) {
    return text;
  }
  return text.replace(/#\w+/g, '<router-link class="text-[#4a99e9] hover:underline hover:underline-offset-2 cursor-pointer" to="/">$&</router-link>');
}

export const mapKeyEnum = (enumObj: EnumLike) => {
  return Object.keys(enumObj)
    .filter(v => isNaN(Number(v)));
};

export const truncateText = (text: string, limit: number, suffix = '') => {
  if (typeof text !== 'string') return text;
  if (text.length > limit) {
    return text.substring(0, limit) + suffix;
  }
  return text;
};

export const toUpperCaseFirstL = (str: string) => {
  if (typeof str !== 'string') {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const debounce = <F extends (...args: Parameters<F>) => ReturnType<F>>(
  fn: F, delay = 300
) => {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<F>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

export function parseJSON<T>(value: string | null): T | undefined {
  try {
    return JSON.parse(value);
  }
  catch {
    return undefined;
  }
}
