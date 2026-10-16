// The design uses flat colour blocks labelled "RESTAURANT IMAGE", so we do the same.
export default function Placeholder({ color, label = 'Restaurant image', className = '', soft = false }) {
  return (
    <div
      className={`flex items-center justify-center text-center text-xs ${soft ? 'text-rust' : 'uppercase tracking-wide text-white'} ${className}`}
      style={{ background: color }}
      role="img"
      aria-label={label}
    >
      {label}
    </div>
  );
}
