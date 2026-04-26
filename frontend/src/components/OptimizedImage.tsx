/**
 * ============================================================
 * 📌 최적화된 이미지 컴포넌트
 * 📋 목적: Lazy loading 및 WebP 형식 지원으로 이미지 성능 최적화
 * 🎯 효과: 이미지 로드 시간 단축, 네트워크 트래픽 감소
 * 📅 작성일: 2026-04-27
 * ============================================================
 */

import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  webpSrc?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
}

/**
 * Intersection Observer를 사용한 Lazy Loading 이미지 컴포넌트
 * 이미지가 뷰포트에 들어올 때만 로드하여 초기 페이지 로드 성능 향상
 */
export const OptimizedImage = React.memo(
  ({
    src,
    webpSrc,
    alt,
    width,
    height,
    className = '',
    loading = 'lazy',
    onLoad,
  }: OptimizedImageProps) => {
    const [imageSrc, setImageSrc] = useState<string>(
      loading === 'eager' ? src : ''
    );
    const [supportsWebP, setSupportsWebP] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    // WebP 지원 여부 확인
    useEffect(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      setSupportsWebP(
        canvas
          .toDataURL('image/webp')
          .indexOf('image/webp') === 5
      );
    }, []);

    // Intersection Observer로 Lazy Loading 구현
    useEffect(() => {
      if (loading !== 'lazy') return;

      const img = imgRef.current;
      if (!img) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // WebP 지원 여부에 따라 최적의 형식 선택
              const optimizedSrc = supportsWebP && webpSrc ? webpSrc : src;
              setImageSrc(optimizedSrc);

              // 관찰자 제거 (이미지 로드 완료)
              observer.unobserve(img);
            }
          });
        },
        {
          // 뷰포트에서 200px 이전부터 로드 시작
          rootMargin: '200px',
        }
      );

      observer.observe(img);

      return () => {
        observer.unobserve(img);
      };
    }, [src, webpSrc, supportsWebP, loading]);

    return (
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onLoad={onLoad}
        // placeholder 효과를 위해 투명도 설정
        style={{
          opacity: imageSrc ? 1 : 0.5,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
    );
  }
);

OptimizedImage.displayName = 'OptimizedImage';

/**
 * 반응형 이미지 컴포넌트
 * 다양한 해상도의 이미지를 제공하여 기기별 최적화
 */
interface ResponsiveImageProps extends OptimizedImageProps {
  srcSet?: string;
  sizes?: string;
}

export const ResponsiveImage = React.memo(
  ({
    src,
    webpSrc,
    alt,
    width,
    height,
    className = '',
    loading = 'lazy',
    srcSet,
    sizes,
    onLoad,
  }: ResponsiveImageProps) => {
    const [imageSrc, setImageSrc] = useState<string>(
      loading === 'eager' ? src : ''
    );
    const [supportsWebP, setSupportsWebP] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    // WebP 지원 여부 확인
    useEffect(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      setSupportsWebP(
        canvas
          .toDataURL('image/webp')
          .indexOf('image/webp') === 5
      );
    }, []);

    // Intersection Observer로 Lazy Loading 구현
    useEffect(() => {
      if (loading !== 'lazy') return;

      const img = imgRef.current;
      if (!img) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const optimizedSrc = supportsWebP && webpSrc ? webpSrc : src;
              setImageSrc(optimizedSrc);
              observer.unobserve(img);
            }
          });
        },
        {
          rootMargin: '200px',
        }
      );

      observer.observe(img);

      return () => {
        observer.unobserve(img);
      };
    }, [src, webpSrc, supportsWebP, loading]);

    return (
      <img
        ref={imgRef}
        src={imageSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onLoad={onLoad}
        style={{
          opacity: imageSrc ? 1 : 0.5,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
    );
  }
);

ResponsiveImage.displayName = 'ResponsiveImage';
