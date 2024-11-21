/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createSolidDataset,
  getSolidDataset,
  saveSolidDatasetAt,
} from '@inrupt/solid-client';

export const getOrCreateDataset = async (containerUri: string, fetch: any) => {
  const indexUrl = `${containerUri}index.ttl`;
  try {
    const todoList = await getSolidDataset(indexUrl, { fetch });
    return todoList;
  } catch (error: any) {
    if (error.statusCode === 404) {
      const todoList = await saveSolidDatasetAt(
        indexUrl,
        createSolidDataset(),
        {
          fetch,
        }
      );
      return todoList;
    }
  }
};
