'use client';

import { useRouter } from 'next/navigation';
import styles from '../../app/blog/[slug]/blog-post.module.scss';

export default function BackButton() {
  const router = useRouter();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    router.back();
  };

  return (
    <a 
      href="/"
      onClick={handleBack}
      className={styles.backLink}
    >
      ← Back to home
    </a>
  );
} 