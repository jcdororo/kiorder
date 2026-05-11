export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm">불러오는 중...</p>
      </div>
    </div>
  );
}
