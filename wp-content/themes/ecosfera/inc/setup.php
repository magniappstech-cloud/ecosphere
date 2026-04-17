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

function ecosfera_hide_admin_bar_for_non_admins(): bool
{
    return current_user_can('manage_options');
}

add_filter('show_admin_bar', 'ecosfera_hide_admin_bar_for_non_admins');

function ecosfera_block_wp_admin_for_non_admins(): void
{
    if (!is_user_logged_in()) {
        return;
    }

    if (current_user_can('manage_options') || wp_doing_ajax()) {
        return;
    }

    wp_safe_redirect(home_url('/'));
    exit;
}

add_action('admin_init', 'ecosfera_block_wp_admin_for_non_admins');
