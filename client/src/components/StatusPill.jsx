import { STATUS_LABEL } from '../utils/format.js';

export default function StatusPill({ status }) {
  const done = status === 'delivered';
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${done ? 'bg-[#E7F0E5]' : 'bg-sand'}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${done ? 'bg-rust' : 'bg-gold'}`} aria-hidden="true" />
      {STATUS_LABEL[status] || status}
    </span>
  );
}
