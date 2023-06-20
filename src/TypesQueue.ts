/* eslint-disable @typescript-eslint/no-inferrable-types */

export class TypesQueue {
    public static SESSION_UPDATER: string = "session_updater";
    public static SESSION_VALIDATOR: string = "validate_session";

    public static DATA_GET: string = "get_data";
    public static DATA_POST: string = "save_data";

    public static EVENTS_POST: string = "save_events";

    public static SEND_LOG: string = "send_log";

    public static USER_GET: string = "get_user";

    public static PRODUCTS_GET: string = "get_products";
    public static OK_CALLBACK: string = "ok_callback";

    public static START_CONFIG_GET: string = "get_start_config";

    public static MAP_GET: string = "get_map";
    public static MAP_ENEMY_GET: string = "get_enemy";
    public static MAP_ATTACK: string = "attack";
    public static MAP_GET_MY_COORDS: string = "get_my_coords";
}

