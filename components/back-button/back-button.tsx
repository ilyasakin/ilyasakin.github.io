'use client';

import { useRouter } from 'next/navigation';
import styles from '../../app/blog/[slug]/blog-post.module.scss';

export default function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
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