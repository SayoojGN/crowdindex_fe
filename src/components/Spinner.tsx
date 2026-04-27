export function Spinner({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-10 ${className ?? ''}`}>
      <div
        className="w-6 h-6 rounded-full border-2 animate-spin"
        style={{
          borderColor: 'rgba(70, 100, 255, 0.12)',
          borderTopColor: '#4664ff',
        }}
      />
    </div>
  )
}
