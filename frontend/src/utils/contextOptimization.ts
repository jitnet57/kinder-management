/**
 * ============================================================
 * 📌 Context 최적화 가이드 및 유틸리티
 * 📋 목적: React Context의 리바운딩 문제를 방지하고 성능 향상
 * 🎯 효과: 불필요한 리렌더링 제거, 메모리 효율 개선
 * 📅 작성일: 2026-04-27
 * ============================================================
 */

/**
 * Context Provider 최적화 패턴
 *
 * 문제점:
 * - Context 값이 변경될 때마다 모든 구독자(consumer)가 리렌더링됨
 * - Provider 자체가 리렌더링되면 모든 자식도 리렌더링됨
 *
 * 해결방안:
 * 1. useMemo로 Context 값을 메모이제이션
 * 2. useCallback으로 변경 함수를 메모이제이션
 * 3. Context를 분리하여 자주 변경되는 부분과 안정적인 부분 분리
 * 4. 컨슈머를 React.memo로 감싸기
 */

/**
 * Context 값 메모이제이션 예시
 *
 * // BadPattern - 매번 새로운 객체가 생성됨
 * const value = {
 *   state: data,
 *   setState: setData,
 * };
 * return <Context.Provider value={value}>{children}</Context.Provider>;
 *
 * // GoodPattern - 메모이제이션으로 객체 재사용
 * const value = React.useMemo(() => ({
 *   state: data,
 *   setState: setData,
 * }), [data]);
 * return <Context.Provider value={value}>{children}</Context.Provider>;
 */

/**
 * 이벤트 리스너 정리 패턴
 * 메모리 누수를 방지하기 위해 컴포넌트 언마운트 시 정리
 */
export function useEventListener(
  eventName: string,
  handler: (event: any) => void,
  element: HTMLElement | Window | null = typeof window !== 'undefined' ? window : null
) {
  React.useEffect(() => {
    // 지원하는지 확인
    if (!element) return;
    const isSupported = element && (element as any).addEventListener;
    if (!isSupported) return;

    // 이벤트 리스너 추가
    (element as any).addEventListener(eventName, handler);

    // 정리 함수 (언마운트 시 실행)
    return () => {
      (element as any).removeEventListener(eventName, handler);
    };
  }, [eventName, handler, element]);
}

/**
 * 타이머 정리 패턴
 * 메모리 누수를 방지하기 위해 컴포넌트 언마운트 시 타이머 제거
 */
export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  React.useEffect(() => {
    if (delay === null) return;

    const id = setTimeout(() => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }, delay);
    return () => clearTimeout(id);
  }, [delay]);
}

/**
 * Interval 정리 패턴
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  React.useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }, delay);
    return () => clearInterval(id);
  }, [delay]);
}

/**
 * 캐시 메모리 제한 (LRU 캐시)
 * 메모리 사용량을 제한하여 성능 유지
 */
export class LRUCache<K, V> {
  private maxSize: number;
  private cache: Map<K, V>;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }

    // 최근 사용 항목으로 이동
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V) {
    // 기존 키면 제거
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // 새 항목 추가
    this.cache.set(key, value);

    // 최대 크기 초과 시 가장 오래된 항목 제거
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value as K;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
  }

  clear() {
    this.cache.clear();
  }

  getSize() {
    return this.cache.size;
  }
}

// React import (선택적)
import React from 'react';

/**
 * 성능 모니터링
 * 컴포넌트의 렌더링 성능을 측정
 */
export function useRenderTime(componentName: string) {
  React.useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // 성능 경고 (100ms 이상)
      if (renderTime > 100) {
        console.warn(
          `${componentName} 렌더링이 느림: ${renderTime.toFixed(2)}ms`
        );
      }
    };
  });
}

/**
 * 메모리 누수 감지
 * 마운트/언마운트 카운트 모니터링
 */
export function useComponentLifecycle(componentName: string) {
  React.useEffect(() => {
    console.log(`[${componentName}] 마운트됨`);

    return () => {
      console.log(`[${componentName}] 언마운트됨`);
    };
  }, [componentName]);
}
