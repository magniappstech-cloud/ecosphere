<?php

declare(strict_types=1);

function ecosfera_register_content_types(): void
{
    register_post_type(
        'project',
        [
            'labels' => [
                'name' => __('Projects', 'ecosfera'),
                'singular_name' => __('Project', 'ecosfera'),
            ],
            'public' => true,
            'show_in_rest' => true,
            'menu_icon' => 'dashicons-chart-area',
            'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions'],
            'has_archive' => true,
            'rewrite' => ['slug' => 'projects'],
        ]
    );

    register_post_type(
        'initiative',
        [
            'labels' => [
                'name' => __('Initiatives', 'ecosfera'),
                'singular_name' => __('Initiative', 'ecosfera'),
            ],
            'public' => true,
            'show_in_rest' => true,
            'menu_icon' => 'dashicons-megaphone',
            'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions'],
            'has_archive' => true,
            'rewrite' => ['slug' => 'initiatives'],
        ]
    );

    register_post_type(
        'artwork',
        [
            'labels' => [
                'name' => __('Art', 'ecosfera'),
                'singular_name' => __('Art item', 'ecosfera'),
            ],
            'public' => true,
            'show_in_rest' => true,
            'menu_icon' => 'dashicons-art',
            'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions'],
            'has_archive' => true,
            'rewrite' => ['slug' => 'art'],
        ]
    );

    register_taxonomy(
        'project_country',
        ['project'],
        [
            'labels' => [
                'name' => __('Project countries', 'ecosfera'),
                'singular_name' => __('Project country', 'ecosfera'),
            ],
            'public' => true,
            'show_in_rest' => true,
            'hierarchical' => true,
            'rewrite' => ['slug' => 'project-country'],
        ]
    );

    register_taxonomy(
        'ecosfera_topic',
        ['post', 'project', 'initiative', 'artwork'],
        [
            'labels' => [
                'name' => __('Topics', 'ecosfera'),
                'singular_name' => __('Topic', 'ecosfera'),
            ],
            'public' => true,
            'show_in_rest' => true,
            'hierarchical' => true,
            'rewrite' => ['slug' => 'topic'],
        ]
    );
}

add_action('init', 'ecosfera_register_content_types');

