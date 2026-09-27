import '@testing-library/jest-dom';
import React from 'react';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder and TextDecoder for jsPDF in JSDOM
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Polyfill window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Polyfill ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Polyfill IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
};

// Polyfill window.scrollTo
window.scrollTo = jest.fn();

// Mock next/image without JSX, filtering out Next.js-specific non-DOM props
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    ...rest
  }: {
    src: string;
    alt?: string;
    [key: string]: unknown;
  }) => {
    const cleanProps = { ...rest };
    delete cleanProps.fill;
    delete cleanProps.priority;
    delete cleanProps.placeholder;
    delete cleanProps.blurDataURL;
    return React.createElement('img', { src, alt: alt || '', ...cleanProps });
  },
}));

// Mock Swiper without leaking Swiper props to DOM element
jest.mock('swiper/react', () => ({
  Swiper: ({
    children,
    className,
    id,
    'data-testid': testId,
  }: {
    children?: React.ReactNode;
    className?: string;
    id?: string;
    'data-testid'?: string;
  }) =>
    React.createElement(
      'div',
      { 'data-testid': testId || 'swiper-mock', className, id },
      children
    ),
  SwiperSlide: ({
    children,
    className,
    id,
    'aria-label': ariaLabel,
    'data-testid': testId,
  }: {
    children?: React.ReactNode;
    className?: string;
    id?: string;
    'aria-label'?: string;
    'data-testid'?: string;
  }) =>
    React.createElement(
      'div',
      {
        'data-testid': testId || 'swiper-slide-mock',
        className,
        id,
        'aria-label': ariaLabel,
      },
      children
    ),
}));

jest.mock('swiper/modules', () => ({
  Autoplay: () => null,
  Pagination: () => null,
  EffectFade: () => null,
  A11y: () => null,
}));

// Mock AOS
jest.mock('aos', () => ({
  init: jest.fn(),
  refresh: jest.fn(),
  refreshHard: jest.fn(),
}));

// Mock jsPDF save to prevent writing to disk and allow assertion
export const mockPdfSave = jest.fn();

jest.mock('jspdf', () => {
  const actual = jest.requireActual('jspdf');
  class MockJsPDF extends actual.jsPDF {
    save = mockPdfSave;
  }
  return {
    ...actual,
    jsPDF: MockJsPDF,
    mockPdfSave,
  };
});
