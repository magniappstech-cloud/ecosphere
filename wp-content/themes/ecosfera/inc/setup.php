<?php

declare(strict_types=1);

function ecosfera_theme_setup(): void
{
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('custom-logo');
    add_theme_support('editor-styles');
    add_theme_support(
        'html5',
        [
            'search-form',
            'comment-form',
            'comment-list',
            'gallery',
            'caption',
            'style',
            'script',
        ]
    );

    register_nav_menus(
        [
            'header_primary' => __('Header primary menu', 'ecosfera'),
            'primary' => __('Primary menu (legacy)', 'ecosfera'),
            'footer_platform' => __('Footer platform menu', 'ecosfera'),
            'footer_community' => __('Footer community menu', 'ecosfera'),
            'footer_resources' => __('Footer resources menu', 'ecosfera'),
            'footer' => __('Footer menu (legacy)', 'ecosfera'),
        ]
    );
}

add_action('after_setup_theme', 'ecosfera_theme_setup');
