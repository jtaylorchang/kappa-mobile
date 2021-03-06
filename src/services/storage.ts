import { log } from '@services/logService';
import { castToString, castTo } from '@services/utils';

export type TExternalSetItem = (key: string, value: string) => Promise<void>;
export type TSetItem = (key: string, value: any) => Promise<{ key: string; value: string } | undefined>;
export type TExternalGetItem = (key: string) => Promise<string>;
export type TGetItem = (key: string) => Promise<{ key: string; value: string } | undefined>;
export type TExternalDeleteItem = (key: string) => Promise<void>;
export type TDeleteItem = (key: string) => Promise<{ key: string; value: string } | undefined>;

/**
 * Set an item in storage by key-value.
 */
export const setItemTemplate = async (f: TExternalSetItem, key: string, value: any) => {
  try {
    await f(key, castToString(value));

    return {
      key,
      value
    };
  } catch (error) {
    log(error);
    return undefined;
  }
};

/**
 * Set a JSON object in storage by key.
 */
export const setJsonTemplate = async (f: TExternalSetItem, key: string, data: any) => {
  try {
    await f(key, JSON.stringify(data));

    return {
      [key]: data
    };
  } catch (error) {
    log(error);
    return undefined;
  }
};

/**
 * Set a batch of items from a given object with a parent key.
 */
export const setBatchTemplate = async (f: TSetItem, parent: string, data: any) => {
  const promises = [];

  for (const [key, value] of Object.entries(data)) {
    promises.push(f(`${parent}.${key}`, value));
  }

  try {
    await Promise.all(promises);

    log('Batch saved', data);
    return data;
  } catch (error) {
    log(error);
    return undefined;
  }
};

/**
 * Get an item from storage by key.
 */
export const getItemTemplate = async (f: TExternalGetItem, key: string) => {
  try {
    const res = await f(key);

    return {
      key,
      value: res
    };
  } catch (error) {
    log(error);
    return undefined;
  }
};

/**
 * Get a JSON object from storage by key.
 */
export const getJsonTemplate = async (f: TExternalGetItem, key: string) => {
  try {
    const res = await f(key);

    return {
      [key]: JSON.stringify(res)
    };
  } catch (error) {
    log(error);
    return undefined;
  }
};

/**
 * Get a batch object from storage by parent key with defaults.
 */
export const getBatchTemplate = async (f: TGetItem, parent: string, defaultData: any, force: boolean = false) => {
  const promises = [];

  const loaded: typeof defaultData = {};

  for (const [key, defaultValue] of Object.entries(defaultData)) {
    promises.push(
      new Promise<void>((resolve, reject) => {
        f(`${parent}.${key}`).then((res) => {
          if (res && res.value) {
            loaded[key] = castTo(res.value, typeof defaultValue);
            resolve();
          } else if (force) {
            loaded[key] = defaultValue;
            resolve();
          } else {
            reject(`${parent}.${key} not found`);
          }
        });
      })
    );
  }

  try {
    await Promise.all(promises);

    log('Batch retrieved full', { [parent]: loaded });
    return loaded;
  } catch (error) {
    log('Batch retrieved partial', { [parent]: loaded });
    log(error);

    return undefined;
  }
};

/**
 * Delete an item from storage by key.
 */
export const deleteItemTemplate = async (f: TExternalDeleteItem, key: string) => {
  try {
    await f(key);

    return {
      key,
      value: undefined
    };
  } catch (error) {
    log(error);
    return undefined;
  }
};

/**
 * Delete a batch of items from storage by parent key.
 */
export const deleteBatchTemplate = async (f: TDeleteItem, parent: string, data: any) => {
  const promises = [];

  for (const key of Object.keys(data)) {
    promises.push(f(`${parent}.${key}`));
  }

  try {
    await Promise.all(promises);

    log('Batch deleted', { [parent]: data });
    return data;
  } catch (error) {
    log(error);
    return undefined;
  }
};
