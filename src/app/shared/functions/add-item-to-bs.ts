import { BehaviorSubject } from 'rxjs';

export function addItemToBs<T>(bs: BehaviorSubject<T[]>, item: T): void {
  const items: T[] = bs.getValue() || [];
  items.push(item);
  bs.next(items);
}
