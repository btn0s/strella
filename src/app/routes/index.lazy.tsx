import { createLazyFileRoute } from '@tanstack/react-router';

import Editor from '@/app/components/editor';

export const Route = createLazyFileRoute('/')({
  component: Index,
});

function Index() {
  return <Editor />;
}

export default Index;
