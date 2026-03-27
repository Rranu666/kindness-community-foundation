export default function LoadingSpinner({ fullPage = false }) {
  const spinner = (
    <div className="flex flex-col items-center gap-2">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500">Loading...</p>
    </div>
  );
  if (fullPage) return <div className="min-h-screen flex items-center justify-center">{spinner}</div>;
  return <div className="flex items-center justify-center py-16">{spinner}</div>;
}
