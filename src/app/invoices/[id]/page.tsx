import InvoiceDetailPage from './InvoiceDetailClient';

export function generateStaticParams() {
  return [
    { id: 'inv1' },
    { id: 'inv2' },
    { id: 'inv3' },
    { id: 'inv4' },
  ];
}

export default function Page() {
  return <InvoiceDetailPage />;
}
