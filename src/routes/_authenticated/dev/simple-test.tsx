import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dev/simple-test")({
  component: () => (
    <div className="rounded-lg border border-gray-300 bg-white p-6">
      <h1 className="text-xl font-bold">Simple Test</h1>
      <p className="mt-2 text-sm text-gray-500">Development / testing page.</p>
      <div className="mt-4 rounded border border-gray-200 bg-gray-50 p-4 text-center text-xs font-medium text-gray-600">
        Development route health check
      </div>
    </div>
  ),
});
