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

    register_post_type(
        'art_audio',
        [
            'labels' => [
                'name' => __('Audio tracks', 'ecosfera'),
                'singular_name' => __('Audio track', 'ecosfera'),
            ],
            'public' => true,
            'show_in_rest' => true,
            'menu_icon' => 'dashicons-format-audio',
            'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions'],
            'has_archive' => true,
            'rewrite' => ['slug' => 'art-audio'],
        ]
    );

    register_post_type(
        'art_video',
        [
            'labels' => [
                'name' => __('Video library', 'ecosfera'),
                'singular_name' => __('Video item', 'ecosfera'),
            ],
            'public' => true,
            'show_in_rest' => true,
            'menu_icon' => 'dashicons-video-alt3',
            'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions'],
            'has_archive' => true,
            'rewrite' => ['slug' => 'art-video'],
        ]
    );

    register_post_type(
        'art_story',
        [
            'labels' => [
                'name' => __('Art stories', 'ecosfera'),
                'singular_name' => __('Art story', 'ecosfera'),
            ],
            'public' => true,
            'show_in_rest' => true,
            'menu_icon' => 'dashicons-book-alt',
            'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions'],
            'has_archive' => true,
            'rewrite' => ['slug' => 'art-stories'],
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
        ['post', 'project', 'initiative', 'artwork', 'art_audio', 'art_video', 'art_story'],
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
