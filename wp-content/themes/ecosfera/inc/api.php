<?php

declare(strict_types=1);

function ecosfera_register_api_routes(): void
{
    register_rest_route(
        'ecosfera/v1',
        '/bootstrap',
        [
            'methods' => WP_REST_Server::READABLE,
            'callback' => static function (): WP_REST_Response {
                return new WP_REST_Response(ecosfera_build_frontend_context());
            },
            'permission_callback' => '__return_true',
        ]
    );
}

add_action('rest_api_init', 'ecosfera_register_api_routes');
