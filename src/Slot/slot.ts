import { v4 as uuidv4 } from 'uuid';
import {StableBTreeMap, ic, nat64, Vec, Opt} from 'azle';
import '../User/user';
import '../Stuff/stuff';
import {checkUser} from "../User/user";
import {checkStuffId} from "../Stuff/stuff";

/********************************************************************************************************
 * @name Slot                                                                                           *
 * @description                                                                                         *
 *  A slot may represent renting contract. It's considered as a link Object than references:            *
 *      - "Stuff": It may be anything than is                                                           *
 *          *** Unique *** -> Stuff must be identifiable with unique id                                 *
 *          *** Ownable *** -> Owner is identifiable and has the right to transfer/sell/rent Stuff      *
 *          *** Rentable *** -> Stuff allow Owner to rent Stuff for limited time                        *
 *      - "Supplier": Stuff owner than take Stuff into Rent offers marketplace                          *
 *      - "DateTime": Period of rent auction                                                            *
 *      - "Owner" : When slot being owned, it represents final customer for Stuff during slot           *
 ********************************************************************************************************
 */
    // StableBTreeMap is durable data storage used for Slot
/**
 * `slotsStorage` - it's a key-value data-storage that is used to store slots.
 * {@Link StableBTreeMap} is a self-balancing tree that acts as a durable data storage that keeps data
 *      across canisters upgrades.
 * For the sake of this contract, we've chosen {@Link StabeBTreeMap} as a storage for next reasons:
 * - `insert` , `get` and `remove` operations have a constant time complexity - O(1)
 * - data stored in the map survives canisters upgrades unlike using HashMap where data is stored in
 *      the heap and it's lost after the canister is upgraded.
 * Brakedown of the `StableBTreeMap<string, Slot>` datastructure:
 * - the key of the map is a `slotId`
 * - the value in the map is a slot itself `Slot` that is related to a given key (`slotId`)
 *
 * Constructor values:
 * 1) 0 - memory id where to initialize a map
 */

/**
 * This class represents a Slot
 */
class Slot {
    id:                                 string;
    description:                        string;
    stuffId:                            string;
    ownerId:                            string;
    beginAt:                            nat64;
    endAt:                              nat64;
    available:                          boolean;
    createdAt:                          nat64;
    updatedAt:                          nat64;
}
class SlotPayload {
    description:                        string;
    stuffId:                            string;
    ownerId:                            string;
    beginAt:                            nat64;
    endAt:                              nat64;
    available:                          boolean;
}

const slotsStorage = StableBTreeMap<string, Slot>(0);

/**
 * CRUD functions to manage data-storage
 */

/**
 * @name getSlpots
 * @description {`get All stored Slots`}
 * @returns Vec<Slot>
 */
export function getSlots(): Vec<Slot> {
    return slotsStorage.values();
}

/**
 * @name getSlot
 * @param: id //string
 * @description load Slot matching id
 * @returns Opt<Slot>
 */
export function getSlot(id: string): Opt<Slot> {
    return slotsStorage.get(id);
}

/**
 * @name checkSlotId
 * @param id //string
 * @description {`check existence of slotId`}
 * @returns boolean
 */
export function checkSlotId(id: string): boolean {
    return slotsStorage.containsKey(id);
}

/**
 * @name addSlot
 * @param payload //SlotPayload
 * @description {'Store slot into data-storage'}
 * @returns Opt<Slot>
 */
export function addSlot(payload: SlotPayload): Slot | string {
    if (!checkUser(payload.ownerId)) {
        return `Can't create slot: no user found matching id=${payload.ownerId}`;
    }
    if (checkStuffId(payload.stuffId)) {
        return `Can't create slot: no stuff matching id=${payload.stuffId}`;
    }
    const slot: Slot = {
        id:             uuidv4(),
        ...payload,
        createdAt:      ic.time(),
        updatedAt:      ic.time()
    };
    slotsStorage.insert(slot.id, slot);
    return slot;
}

/**
 * @name updateSlot
 * @param id //string
 * @param payload //SlotPayload
 * @description It updates slot data in data-storage
 * @returns Opt<Slot>
 */
export function updateSlot(id: string, payload: SlotPayload): Slot | string {
    const slot = slotsStorage.get(id);
    if (slot.Some) {
        if (!checkUser(payload.ownerId)) {
            return `can't update slot: no user matching id=${payload.ownerId}`;
        }
        if (!checkStuffId(payload.stuffId)) {
            return `can't update slot: no stuff matching id=${payload.stuffId}`;
        }
        const updatedSlot: Slot = {
            ...slot.Some,
            ...payload,
            updatedAt: ic.time()
        };
        slotsStorage.insert(id, updatedSlot);
        return updatedSlot;
    }
    return `can't update slot: no slot matching id=${id}`;
}

/**
 * @name removeSlot
 * @param id //string
 * @description 'delete slot from data storage'
 * @returns Opt<Slot>
 */
export function removeSlot(id: string): Opt<Slot> {
    return slotsStorage.remove(id);
}


// Internal functions
/**
 * @name getCurrentDate
 * @description 'return current date from ic'
 * @returns Date
 */
function getCurrentDate(): Date {
    const timestamp = Number(ic.time());
    return new Date(timestamp.valueOf() / 100_000);
}