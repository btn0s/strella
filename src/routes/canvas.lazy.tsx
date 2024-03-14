import { createLazyFileRoute } from '@tanstack/react-router';

function Canvas() {}

export const Route = createLazyFileRoute('/canvas')({
  component: Canvas,
});
