import type { Metadata } from 'next';
import '@xyflow/react/dist/style.css';
import '../styles/original-ui.css';
import '../styles.css';
import '../styles/tailwind.css';
import '../styles/replica.css';

export const metadata: Metadata = {
  title: 'Unlimited Works',
  description: 'AI 驱动的创意工作流',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
