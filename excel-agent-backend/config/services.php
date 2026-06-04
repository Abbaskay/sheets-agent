<?php

return [

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAuth_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'dify' => [
        'url' => env('DIFY_API_URL', ''),
        'key_excel_agent' => env('DIFY_APP_KEY_EXCEL_AGENT', ''),
        'key_excel_refiner' => env('DIFY_APP_KEY_EXCEL_REFINER', ''),
        'key_excel_web_research' => env('DIFY_APP_KEY_EXCEL_WEB_RESEARCH', ''),
    ],

];
