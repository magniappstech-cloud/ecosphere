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

    register_rest_route(
        'ecosfera/v1',
        '/article-submissions',
        [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => static function (WP_REST_Request $request): WP_REST_Response|WP_Error {
                if (!is_user_logged_in()) {
                    return new WP_Error('ecosfera_forbidden', __('Authentication required.', 'ecosfera'), ['status' => 401]);
                }

                $title = sanitize_text_field((string) $request->get_param('title'));
                $excerpt = sanitize_textarea_field((string) $request->get_param('excerpt'));
                $content = wp_kses_post((string) $request->get_param('content'));

                if ($title === '' || trim(wp_strip_all_tags($content)) === '') {
                    return new WP_Error('ecosfera_invalid_submission', __('Title and content are required.', 'ecosfera'), ['status' => 422]);
                }

                $post_id = wp_insert_post(
                    [
                        'post_type' => 'article',
                        'post_status' => 'pending',
                        'post_title' => $title,
                        'post_excerpt' => $excerpt,
                        'post_content' => $content,
                        'post_author' => get_current_user_id(),
                    ],
                    true
                );

                if (is_wp_error($post_id)) {
                    return $post_id;
                }

                return new WP_REST_Response(
                    [
                        'success' => true,
                        'message' => __('Article submitted for moderation.', 'ecosfera'),
                        'postId' => $post_id,
                    ],
                    201
                );
            },
            'permission_callback' => static function (): bool {
                return is_user_logged_in();
            },
        ]
    );
}

add_action('rest_api_init', 'ecosfera_register_api_routes');
