'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import styles from '../../app/blog/[slug]/blog-post.module.scss';

export default function BackButton() {
  const router = useRouter();

  useEffect(() => {
    // Prefetch the homepage
    router.prefetch('/');
  }, [router]);

  const handleBack = () => {
    try {
      if (window.history.length > 2) {
        router.back();
      } else {
        router.push('/');
      }
    } catch {
      router.push('/');
    }
  };

  return (
    <button 
      onClick={handleBack}
      className={styles.backLink}
      type="button"
    >
      ← Back to home
    </button>
  );
} 