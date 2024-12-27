'use client';

import { useRouter } from 'next/navigation';
import styles from '../../app/blog/[slug]/blog-post.module.scss';

export default function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    try {
      // Check if there's history
      if (window.history.length > 2) {
        router.back();
      } else {
        // If no history or coming from external site, go to home
        router.push('/');
      }
    } catch {
      // Fallback to home if any issues
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