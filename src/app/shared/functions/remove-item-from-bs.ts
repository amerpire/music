import { BehaviorSubject } from 'rxjs';

export function removeItemFromBs<T>(bs: BehaviorSubject<T[]>, item: T): boolean {
  const items: T[] = bs.getValue() || [];
  const index: number = items.indexOf(item);
  if (index === -1) {
    return false;
  }
  items.splice(index, 1);
  bs.next(items);
  return true;
}
