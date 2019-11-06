import { isUndefined, isDefined } from '../helpers/mixed';
import { mixin } from '../helpers/object';
import localHooks from '../mixins/localHooks';

// Counter for checking if there is a memory leak.
let registeredMaps = 0;

/**
 * Collection of index maps having unique names.
 */
class MapCollection {
  constructor() {
    /**
     * Collection of index maps having unique names.
     *
     * @type {Map<string, IndexMap>}
     */
    this.collection = new Map();
  }

  /**
   * Register custom index map.
   *
   * @param {String} uniqueName Unique name of the index map.
   * @param {IndexMap} indexMap Index map containing miscellaneous (i.e. meta data, indexes sequence), updated after remove and insert data actions.
   * @returns {IndexMap|undefined}
   */
  register(uniqueName, indexMap) {
    if (this.collection.has(uniqueName) === false) {
      this.collection.set(uniqueName, indexMap);

      indexMap.addLocalHook('change', () => this.runLocalHooks('change', indexMap));

      registeredMaps += 1;
    }
  }

  /**
   * Unregister custom index map.
   *
   * @param {String} name Name of the index map.
   */
  unregister(name) {
    const indexMap = this.collection.get(name);

    if (isDefined(indexMap)) {
      indexMap.clearLocalHooks();
      this.collection.delete(name);

      this.runLocalHooks('change', indexMap);

      registeredMaps -= 1;
    }
  }

  /**
   * Get indexes list for provided index map name.
   *
   * @param {String} [name] Name of the index map.
   * @returns {Array|IndexMap}
   */
  get(name) {
    if (isUndefined(name)) {
      return Array.from(this.collection.values());
    }

    return this.collection.get(name);
  }

  /**
   * Get collection size.
   *
   * @returns {Number}
   */
  getLength() {
    return this.collection.size;
  }

  /**
   * Remove some indexes and corresponding mappings and update values of the others within all collection's index maps.
   *
   * @private
   * @param {Array} removedIndexes List of removed indexes.
   */
  removeFromEvery(removedIndexes) {
    this.collection.forEach((indexMap) => {
      indexMap.remove(removedIndexes);
    });
  }

  /**
   * Insert new indexes and corresponding mapping and update values of the others all collection's index maps.
   *
   * @private
   * @param {Number} insertionIndex Position inside the actual list.
   * @param {Array} insertedIndexes List of inserted indexes.
   */
  insertToEvery(insertionIndex, insertedIndexes) {
    this.collection.forEach((indexMap) => {
      indexMap.insert(insertionIndex, insertedIndexes);
    });
  }

  /**
   * Set default values to index maps within collection.
   *
   * @param {Number} length Destination length for all stored maps.
   */
  initEvery(length) {
    this.collection.forEach((indexMap) => {
      indexMap.init(length);
    });
  }
}

mixin(MapCollection, localHooks);

export default MapCollection;

export function getRegisteredMapsCounter() {
  return registeredMaps;
}
