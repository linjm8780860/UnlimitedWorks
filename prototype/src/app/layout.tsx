import type { Metadata } from 'next';
import '@xyflow/react/dist/style.css';
import '../styles.css';

export const metadata: Metadata = {
  title: 'Unlimited Works',
  description: 'Unlimited Works web application',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
