'use client'

export default function NavLogoButton({ color }: { color: string }) {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="hover:opacity-80 transition-opacity"
    >
      <img src="/iconMain.svg" alt="CrowdIndex" className="h-9 w-auto" />
    </button>
  )
}
