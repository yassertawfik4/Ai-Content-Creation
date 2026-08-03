export function LoadingScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#fffaff]" role="status">
      <span className="size-7 animate-spin rounded-full border-2 border-[#d8cde0] border-t-[#4f378a]" />
      <span className="sr-only">Loading page</span>
    </div>
  )
}
