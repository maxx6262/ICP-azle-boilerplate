import { v4 as uuidv4 } from 'uuid';
import { StableBTreeMap, Vec, Result, ic , Opt} from "azle";
import e from "express";

/**
 * `userStorage` - it's a key-value datastructure that is used to store users.
 * {@link StableBTreeMap} is a self-balancing tree that acts as a durable data storage that keeps data across canister upgrades.
 * For the sake of this contract we've chosen {@link StableBTreeMap} as a storage for the next reasons:
 * - `insert`, `get` and `remove` operations have a constant time complexity - O(1)
 * - data stored in the map survives canister upgrades unlike using HashMap where data is stored in the heap and it's lost after the canister is upgraded
 *
 * Brakedown of the `StableBTreeMap(string, User)` datastructure:
 * - the key of map is a `userId`
 * - the value in this map is a message itself `Message` that is related to a given key (`userId`)
 *
 * Constructor values:
 * 1) 0 - memory id where to initialize a map.
 */

/**
 * This type represents an user than can be loaded
 */
class User {
    id:                         string;
    pseudo:                     string;
    name:                       string;
    createdAt:                  Date;
    updatedAt:                  Date;
}
class UserPayload {
    pseudo:                     string;
    name:                       string;
}

const usersStorage = StableBTreeMap<string, User>(0);

/**
 * CRUD Functions
 *  - getters
 *  - setters
 *  - add
 *  - remove
 *  - check
 */

/**
 * @name getUsers
 * @description return all users recorded on usersStorage
 * @return Vec<User>
 */
export function getUsers(): Vec<User> {
    return usersStorage.values();
}

/**
 * @name getUser
 * @param id //string
 * @description load User matching id
 * @return Opt<User>
 */
export function getUser(id: string): Opt<User> {
    return usersStorage.get(id);
}

/**
 * @name checkUserId
 * @param id: string
 * @description check existence of user matching id
 * @return boolean
 */
export function checkUser(id: string): boolean {
    return  usersStorage.containsKey(id);
}

/**
 * @name checkPseudo
 * @param pseudo //string
 * @return boolean
 * @description It returns existence of pseudo from storedUsers
 */
export function checkPseudo(pseudo: string): boolean {
    for (let user of usersStorage.values()) {
        if (user.pseudo === pseudo) {
            return true;
        }
    }
    return false;
}

/**
 * @name addUser
 * @param user //UserPayload
 * @description add new User on storage
 * @return User
 */
export function addUser(user: UserPayload): User {
    const newUser: User = {
        id:     uuidv4(),
        ...user,
        createdAt: getCurrentDate(),
        updatedAt: getCurrentDate()
    };
    usersStorage.insert(newUser.id, newUser);
    return newUser;
}

/**
 * @name updateUser
 * @param {id: string, user: UserPayload}
 * @description update user data matching id
 * @return Opt<User>
 */
export function updateUser(id: string, user: UserPayload): Opt<User> {
    const storedUser = usersStorage.get(id);
    if (storedUser.Some) {
        const updatedUser: User = {
            ...storedUser.Some,
            ...user,
            updatedAt: getCurrentDate()
        };
        usersStorage.insert(updatedUser.id, updatedUser);
    }
    return usersStorage.get(id);
}

/**
 * @name removeUser
 * @param id: string
 * @description delete user matching id from data storage
 * @return deletedUser: User
 */
export function removeUser(id: string): Opt<User> {
    return usersStorage.remove(id);
}

/**
 * Internal functions
 */
function getCurrentDate(): Date {
    const timestamp = new Number(ic.time());
    return new Date(timestamp.valueOf() / 100_000);
}
