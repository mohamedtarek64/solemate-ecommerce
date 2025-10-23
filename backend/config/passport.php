<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Encryption Keys
    |--------------------------------------------------------------------------
    |
    | Passport uses encryption keys to generate secure access tokens. By
    | default, the keys are stored as local files but can be set via
    | environment variables when that is more convenient.
    |
    */

    'private_key' => env('PASSPORT_PRIVATE_KEY'),

    'public_key' => env('PASSPORT_PUBLIC_KEY'),

    /*
    |--------------------------------------------------------------------------
    | Client UUIDs
    |--------------------------------------------------------------------------
    |
    | By default, Passport uses auto-incrementing primary keys when assigning
    | IDs to clients. However, if Passport is installed on a server already
    | using UUIDs, you may enable this option to use UUIDs instead.
    |
    */

    'client_uuids' => false,

    /*
    |--------------------------------------------------------------------------
    | Personal Access Client
    |--------------------------------------------------------------------------
    |
    | If you enable client UUIDs, you should also set the personal access
    | client UUID in your environment file. The value should be the UUID of
    | the client you will use to create personal access tokens.
    |
    */

    'personal_access_client' => [
        'id' => env('PASSPORT_PERSONAL_ACCESS_CLIENT_ID'),
        'secret' => env('PASSPORT_PERSONAL_ACCESS_CLIENT_SECRET'),
    ],

];
