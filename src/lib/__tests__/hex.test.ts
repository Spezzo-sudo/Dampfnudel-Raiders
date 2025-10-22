import { axialDistance } from '@/lib/hex';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

if (process.env.NODE_ENV === 'test') {
  assert(axialDistance({ q: 0, r: 0 }, { q: 0, r: 0 }) === 0, 'Distanz zu sich selbst ist 0');
  assert(axialDistance({ q: 0, r: 0 }, { q: 1, r: 0 }) === 1, 'Direkter Nachbar hat Distanz 1');
  assert(axialDistance({ q: 0, r: 0 }, { q: 1, r: -1 }) === 1, 'Diagonaler Nachbar hat Distanz 1');
  assert(axialDistance({ q: -2, r: 3 }, { q: 4, r: -1 }) === 6, 'Größere Distanz korrekt berechnet');
}
