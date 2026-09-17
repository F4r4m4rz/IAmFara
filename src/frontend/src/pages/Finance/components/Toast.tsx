/** A brief, auto-dismissing pill — deliberately not a modal/dialog per "avoid disruptive success dialogs". */
export default function Toast({ message }: { message: string }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30 flex justify-center">
      <div
        role="status"
        className="animate-pop-in rounded-full bg-finance-surfaceElevated px-4 py-2 text-sm text-finance-text shadow-lg"
      >
        {message}
      </div>
    </div>
  );
}
