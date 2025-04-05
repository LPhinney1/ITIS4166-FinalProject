import {
    ColumnType,
    Generated,
    Insertable,
    Selectable,
    Updateable,
} from 'kysely';

export interface Database {
    users: UserTable;
}

export interface UserTable {
    id: Generated<number>;
    name: string;
    created_at: ColumnType<Date, string | undefined>;
}

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;
