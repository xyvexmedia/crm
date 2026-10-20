import ClientDetailPage from './ClientDetailClient';

export function generateStaticParams() {
  return [
    { id: 'c1' },
    { id: 'c2' },
    { id: 'c3' },
    { id: 'c4' },
  ];
}

export default function Page() {
  return <ClientDetailPage />;
}
