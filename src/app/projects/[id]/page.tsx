import ProjectDetailPage from './ProjectDetailClient';

export function generateStaticParams() {
  return [
    { id: 'p1' },
    { id: 'p2' },
    { id: 'p3' },
    { id: 'p4' },
  ];
}

export default function Page() {
  return <ProjectDetailPage />;
}
