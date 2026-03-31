<?php

declare(strict_types=1);

function ecosfera_menu_tree(string $location): array
{
    $locations = get_nav_menu_locations();

    if (!isset($locations[$location])) {
        return [];
    }

    $items = wp_get_nav_menu_items($locations[$location]);

    if (!is_array($items)) {
        return [];
    }

    return array_map(
        static function (WP_Post $item): array {
            return [
                'id' => (int) $item->ID,
                'title' => $item->title,
                'url' => $item->url,
                'target' => $item->target ?: '_self',
                'parent' => (int) $item->menu_item_parent,
            ];
        },
        $items
    );
}

function ecosfera_format_post(WP_Post $post): array
{
    return [
        'id' => (int) $post->ID,
        'title' => get_the_title($post),
        'excerpt' => wp_strip_all_tags(get_the_excerpt($post)),
        'content' => apply_filters('the_content', $post->post_content),
        'type' => $post->post_type,
        'slug' => $post->post_name,
        'url' => get_permalink($post),
        'date' => get_the_date('c', $post),
        'featuredImage' => get_the_post_thumbnail_url($post, 'large') ?: '',
    ];
}

function ecosfera_query_cards(string $post_type, int $limit = 6): array
{
    $query = new WP_Query(
        [
            'post_type' => $post_type,
            'posts_per_page' => $limit,
            'post_status' => 'publish',
            'no_found_rows' => true,
        ]
    );

    return array_map('ecosfera_format_post', $query->posts);
}

function ecosfera_build_frontend_context(): array
{
    global $post;

    $current_post = $post instanceof WP_Post ? ecosfera_format_post($post) : null;

    return [
        'site' => [
            'name' => get_bloginfo('name'),
            'description' => get_bloginfo('description'),
            'url' => home_url('/'),
            'language' => determine_locale(),
        ],
        'navigation' => [
            'primary' => ecosfera_menu_tree('primary'),
            'footer' => ecosfera_menu_tree('footer'),
        ],
        'current' => [
            'template' => is_front_page() ? 'front-page' : (
                is_home() ? 'home' : (
                    is_singular() ? 'singular' : (
                        is_archive() ? 'archive' : (
                            is_search() ? 'search' : (
                                is_404() ? '404' : 'index'
                            )
                        )
                    )
                )
            ),
            'post' => $current_post,
        ],
        'collections' => [
            'posts' => ecosfera_query_cards('post'),
            'projects' => ecosfera_query_cards('project'),
            'initiatives' => ecosfera_query_cards('initiative'),
            'art' => ecosfera_query_cards('artwork'),
            'pages' => ecosfera_query_cards('page', 8),
        ],
        'rest' => [
            'root' => esc_url_raw(rest_url()),
            'nonce' => wp_create_nonce('wp_rest'),
            'bootstrap' => esc_url_raw(rest_url('ecosfera/v1/bootstrap')),
        ],
    ];
}
