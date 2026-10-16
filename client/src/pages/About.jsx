import { CartIcon, HeartIcon, SearchIcon } from '../components/Icons.jsx';

// Simple plate illustrations stand in for the food photos in the design.
function Plate({ rim, food }) {
  return (
    <svg viewBox="0 0 100 100" className="h-24 w-24 shrink-0 sm:h-28 sm:w-28" role="img" aria-label="Plate of food">
      <circle cx="50" cy="50" r="48" fill={rim} />
      <circle cx="50" cy="50" r="38" fill="#FFF8F0" />
      <circle cx="40" cy="42" r="12" fill={food[0]} />
      <circle cx="60" cy="46" r="12" fill={food[1]} />
      <circle cx="48" cy="62" r="12" fill={food[2]} />
    </svg>
  );
}

const FEATURES = [
  [SearchIcon, 'bg-gold', 'Easy Discovery', 'Find restaurants and cuisines easily.'],
  [HeartIcon, 'bg-brand', 'Great Choices', 'Explore different restaurants and food options.'],
  [CartIcon, 'bg-rust', 'Simple Ordering', 'Choose your food and prepare your order.'],
];

export default function About() {
  return (
    <div className="page">
      <section className="rounded-3xl bg-maroon px-6 py-10 text-center text-white">
        <h1 className="text-4xl font-extrabold">About Orderly</h1>
        <div className="mt-6 flex items-center justify-center gap-6 sm:gap-12">
          <Plate rim="#6AA6A0" food={['#E8B84B', '#7BAA4B', '#C4883C']} />
          <p className="max-w-xs text-sm leading-relaxed">Discover great restaurants and delicious food all in one convenient place.</p>
          <Plate rim="#F0E0D0" food={['#C4883C', '#8B3A1E', '#D9A24E']} />
        </div>
      </section>

      <section className="mt-10 px-2">
        <h2 className="text-2xl font-bold">Our Mission</h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-maroon/80">
          Orderly makes it easier for people to discover restaurants, explore different cuisines, and choose their next meal.
        </p>
      </section>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {FEATURES.map(([Icon, bg, title, text]) => (
          <section key={title} className="card flex flex-col items-center p-8 text-center">
            <div className={`flex h-11 w-11 items-center justify-center rounded-full text-xl text-maroon ${bg}`}><Icon /></div>
            <h3 className="mt-4 font-bold">{title}</h3>
            <p className="mt-2 max-w-[12rem] text-xs text-maroon/70">{text}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
