/**
 * Small reusable icon button with a consistent Apple-esque touch target and
 * a required `label` used as both the accessible name and the tooltip.
 *
 * @param {{
 *   icon: React.ComponentType<{size?:number, className?:string}>,
 *   label: string,
 *   onClick?: () => void,
 *   disabled?: boolean,
 *   active?: boolean
 * }} props
 */
export default function IconButton({ icon: Icon, label, onClick, disabled = false, active = false }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={[
        'flex h-10 w-10 items-center justify-center rounded-full transition-all',
        'disabled:cursor-not-allowed disabled:opacity-30',
        active
          ? 'bg-neutral-900 text-white shadow-md'
          : 'bg-white/70 text-neutral-700 hover:bg-white active:scale-95',
      ].join(' ')}
    >
      <Icon size={18} />
    </button>
  );
}
