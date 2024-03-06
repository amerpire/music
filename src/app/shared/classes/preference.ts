import { GetResult, Preferences } from '@capacitor/preferences';

/**
 * From the Ghastly Eyrie I can see to the ends of the world,
 * and from this vantage point I declare with utter certainty
 * that this one is the Preference class.
 */
export class Preference<T> {

  constructor(private readonly key: string) {
  }

  /** Parses the given data string to T. */
  private parse(data: string): T {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(`[Preference] ${this.key} failed to parse.`);
      throw e;
    }
  }

  /** Stringify the given data. */
  private stringify(data: T): string {
    return JSON.stringify(data);
  }

  /** Save the given data for this preference. */
  public async save(data: T): Promise<boolean> {
    try {
      await Preferences.set({
        key: this.key,
        value: this.stringify(data),
      });
      console.debug(`[Preference] Saved ${this.key} to preferences.`);
      return true;
    } catch {
      console.error(`[Preference] ${this.key} failed to save.`);
      return false;
    }
  }

  /** Load the data from this preference. */
  public async load(): Promise<T | null> {
    const result: GetResult = await Preferences.get({ key: this.key });
    if (result.value) {
      console.debug(`[Preference] Loaded ${this.key} from preferences.`);
      return this.parse(result.value);
    }
    return null;
  }
}
