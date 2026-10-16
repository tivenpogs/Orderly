// Minus / quantity / plus control from the menu screen. Minus is gold, plus is red, as designed.
export default function Stepper({ value, onChange, label, disabled = false }) {
  return (
    <div className="flex items-center gap-3" role="group" aria-label={`Quantity for ${label}`}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={disabled || value <= 0}
        className="h-7 w-7 rounded bg-gold font-bold text-maroon disabled:opacity-50" aria-label={`Remove one ${label}`}>−</button>
      <span className="w-4 text-center text-sm" aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={disabled || value >= 20}
        className="h-7 w-7 rounded bg-brand font-bold text-white disabled:opacity-50" aria-label={`Add one ${label}`}>+</button>
    </div>
  );
}
