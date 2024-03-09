import { v4 as uuidv4 } from 'uuid';
import { StableBTreeMap, Vec, Result, ic } from "azle";

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
 * @name checkId
 * @param id: string
 * @description check existence of user matching id
 * @return boolean
 */
export function checkUser(id: string): boolean {
    return  usersStorage.containsKey(id);
}

/**
 * @name getUser
 * @param id: string
 * @description load User matching id
 * @return Result<User, string>
 */
export function getUser(id: string): Result<any, string> {
    const user = Result.Ok(usersStorage.get(id).Some);
    if (!checkUser(id)) {
        return Result.Err(`no user found matching id=${id}`!);
    }
    return Result.Ok(user);
}

/**
 * @name addUser
 * @param user: UserPayload
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
 * @return Result<User, string>
 */
export function updateUser(id: string, user: UserPayload): Result<any, string> {
    const storedUser = usersStorage.get(id).Some;
    if (!checkUser(id)) {
        Result.Err(`no user matching id=${id} found`);
    }
    const updatedUser: User = {
        id: id,
        ...storedUser,
        ...user,
        updatedAt: getCurrentDate()
    };
    usersStorage.insert(id, updatedUser);
    return Result.Ok(updatedUser);
}



/**
 * Internal functions
 */
function getCurrentDate(): Date {
    const timestamp: Number = new Number(ic.time());
    return new Date(timestamp.valueOf() / 100_000);
}