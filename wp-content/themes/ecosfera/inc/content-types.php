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

    register_post_type(
        'article',
        [
            'labels' => [
                'name' => __('Articles', 'ecosfera'),
                'singular_name' => __('Article', 'ecosfera'),
            ],
            'public' => true,
            'show_in_rest' => true,
            'menu_icon' => 'dashicons-media-document',
            'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'author', 'revisions'],
            'has_archive' => true,
            'rewrite' => ['slug' => 'articles'],
        ]
    );

    register_post_type(
        'news_item',
        [
            'labels' => [
                'name' => __('News', 'ecosfera'),
                'singular_name' => __('News item', 'ecosfera'),
                'menu_name' => __('News', 'ecosfera'),
                'add_new' => __('Add news item', 'ecosfera'),
                'add_new_item' => __('Add news item', 'ecosfera'),
                'edit_item' => __('Edit news item', 'ecosfera'),
                'new_item' => __('New news item', 'ecosfera'),
                'view_item' => __('View news item', 'ecosfera'),
                'search_items' => __('Search news', 'ecosfera'),
                'not_found' => __('No news found', 'ecosfera'),
                'not_found_in_trash' => __('No news found in trash', 'ecosfera'),
            ],
            'public' => true,
            'show_in_rest' => true,
            'menu_icon' => 'dashicons-megaphone',
            'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'author', 'revisions'],
            'has_archive' => true,
            'rewrite' => ['slug' => 'news'],
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
        ['post', 'project', 'initiative', 'artwork', 'art_audio', 'art_video', 'art_story', 'article'],
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

    register_taxonomy(
        'news_category',
        ['news_item'],
        [
            'labels' => [
                'name' => __('News categories', 'ecosfera'),
                'singular_name' => __('News category', 'ecosfera'),
            ],
            'public' => true,
            'show_in_rest' => true,
            'hierarchical' => true,
            'rewrite' => ['slug' => 'news-category'],
        ]
    );
}

add_action('init', 'ecosfera_register_content_types');

function ecosfera_seed_news_categories(): void
{
    $categories = [
        'ecology' => 'Экология',
        'energy' => 'Энергетика',
        'science' => 'Наука',
        'cities' => 'Города',
        'projects' => 'Проекты',
        'culture' => 'Культура',
    ];

    foreach ($categories as $slug => $name) {
        if (!term_exists($slug, 'news_category')) {
            wp_insert_term($name, 'news_category', ['slug' => $slug]);
        }
    }
}

add_action('init', 'ecosfera_seed_news_categories', 20);
