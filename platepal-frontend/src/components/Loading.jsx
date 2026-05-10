export default function Loading({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
      <div className="w-12 h-12 border-4 border-surface-container-high border-t-primary-container rounded-full animate-spin" />
      <p className="text-outline text-sm font-['Manrope']">{text}</p>
    </div>
  );
}
