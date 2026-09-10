import { LocationCard } from './LocationCard.tsx';
import type { Location } from '../data/types.ts';

interface LocationListProps {
  locations: Location[];
  onOpen: (id: string) => void;
}

/** Popis kartica lokacija. */
export function LocationList({ locations, onOpen }: LocationListProps) {
  return (
    <ul className="results__grid">
      {locations.map((location) => (
        <li key={location.id}>
          <LocationCard location={location} onOpen={onOpen} />
        </li>
      ))}
    </ul>
  );
}
