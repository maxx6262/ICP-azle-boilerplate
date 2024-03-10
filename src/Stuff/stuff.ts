import { v4 as uuidv4 } from 'uuid';
import {StableBTreeMap, Vec, Record, ic, nat64, Opt, Some, None, Result} from 'azle';
import {checkUser } from "../User/user";

/********************************************************************************************************
 * @name Stuff                                                                                          *
 * @description                                                                                         *
 *  A stuff represents any object that must match next conditions:                                      *
 *          *** Unique *** -> Stuff must be identifiable with unique id                                 *
 *          *** Ownable *** -> Owner is identifiable and has the right to transfer/sell/rent Stuff      *
 * A stuff provides unique ID, Owner.                                                                   *
 ********************************************************************************************************
 */
// StableBTreeMap is durable data storage used for Slot
/**
 * `stuffsStorage` - it's a key-value data-storage that is used to store stuffs.
 * {@Link StableBTreeMap} is a self-balancing tree that acts as a durable data storage that keeps data
 *      across canisters upgrades.
 * For the sake of this contract, we've chosen {@Link StabeBTreeMap} as a storage for next reasons:
 * - `insert` , `get` and `remove` operations have a constant time complexity - O(1)
 * - data stored in the map survives canisters upgrades unlike using HashMap where data is stored in
 *      the heap and it's lost after the canister is upgraded.
 * Brakedown of the `StableBTreeMap<string, Stuff>` datastructure:
 * - the key of the map is a `stuffId`
 * - the value in the map is a stuff itself `Stuff` that is related to a given key (`stuffId`)
 *
 * Constructor values:
 * 1) 0 - memory id where to initialize a map
 */

/**
 * This class represents a Stuff
 */
class Stuff  {
    id:                     string;
    description:            string;
    image_url:              string;
    ownerId:                string;
    createdAt:              nat64;
    updatedAt:              nat64;
}

class StuffPayload {
    description:            string;
    image_url:              string;
    ownerId:                string;
}

const stuffsStorage = StableBTreeMap<string, Stuff>(0);

/**
 * CRUD functions to manage these operations:
 *  - `getters` to get data from storage (full informations or specified fields)
 *  - `Create` to insert new stuffs into data-storage
 *  - `Update` to update stuff in data storage
 *  - `Delete` to remove stuff from data storage
 */
//***********************************************************************************
/**
 * @name getStuffs
 * @description `get all stored Stuffs`
 * @return Vec<Stuff>
 */
export function getStuffs(): Vec<Stuff> {
    return stuffsStorage.values();
}

/**
 * @name getStuff
 * @param id // string
 * @description 'It returns recorded Stuff from data-storage matching id'
 * @returns Opt<Stuff>
 */
export function getStuff(id: string): Opt<Stuff> {
    return  stuffsStorage.get(id);
}

/**
 * @name checkStuffId
 * @param id // string
 * @description 'test existence of recorded stuff matching id'
 * @returns boolean
 */
export function checkStuffId(id: string): boolean {
    return stuffsStorage.containsKey(id);
}

/**
 * @name createStuff
 * @param stuff // StuffPayload
 * @description 'add stuff into data-storage'
 * @return boolean
 */
export function createStuff(stuff: StuffPayload): Stuff {
    const newStuff: Stuff = {
        id:                 uuidv4(),
        ...stuff,
        createdAt:          ic.time(),
        updatedAt:          ic.time()
    };
    stuffsStorage.insert(newStuff.id, newStuff);
    return newStuff;
}

/**
 * @name updateStuff
 * @param id // string
 * @param payload // StuffPayload
 * @description Update stuff in data-storage
 */
export function updateStuff(id: string, payload: StuffPayload): Stuff | string {
    const stuff = stuffsStorage.get(id);
    if (stuff.Some) {
        const updatedStuff = {
            ...stuff.Some,
            ...payload,
            updatedAt: ic.time()
        };
        stuffsStorage.insert(stuff.Some.id, updatedStuff);
        return updatedStuff;
    }
    return `Stuff with id=${id} not found`;

}

/**
 * @name transferStuffOwnability
 * @params id // string
 * @params toOwnerId // string
 * @description Transfer Stuff Ownability from `fromOwnerId` to `toOwnerId`
 * @return Stuff
 */
export function transferStuffOwnability(id: string, toOwnerId: string): Stuff | string {
    const stuff = stuffsStorage.get(id);
    if (stuff.Some && checkUser(toOwnerId)) {
        const updatedStuff = {
            ...stuff.Some,
            ownerId:    toOwnerId,
            updatedAt:  ic.time()
        };
        stuffsStorage.insert(stuff.Some.id, updatedStuff);
        return updatedStuff;
    }
    return `Stuff with id=${id} not found`;
}

/**
 * @name deleteStuff
 * @param id //string
 * @description "removes recorded stuff matching id"
 * @returns Stuff
 */
export function deleteStuff(id: string): Opt<Stuff> {
    return  stuffsStorage.remove(id);
}
