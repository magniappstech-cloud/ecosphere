<?php

declare(strict_types=1);

function ecosfera_get_vite_manifest(): array
{
    $manifest_path = get_template_directory() . '/assets/build/.vite/manifest.json';

    if (!file_exists($manifest_path)) {
        return [];
    }

    $manifest = json_decode((string) file_get_contents($manifest_path), true);

    return is_array($manifest) ? $manifest : [];
}

function ecosfera_enqueue_theme_assets(): void
{
    $theme_version = wp_get_theme()->get('Version');
    $theme_uri = get_template_directory_uri();
    $theme_dir = get_template_directory();
    $context = ecosfera_build_frontend_context();
    $dev_server = defined('ECOSFERA_VITE_DEV_SERVER') ? ECOSFERA_VITE_DEV_SERVER : '';
    $manifest = $dev_server ? [] : ecosfera_get_vite_manifest();

    if ($dev_server) {
        wp_enqueue_script('ecosfera-vite-client', untrailingslashit($dev_server) . '/@vite/client', [], null, true);
        wp_enqueue_script('ecosfera-app', untrailingslashit($dev_server) . '/src/main.jsx', [], null, true);
        wp_script_add_data('ecosfera-vite-client', 'type', 'module');
        wp_script_add_data('ecosfera-app', 'type', 'module');
    } else {
        if (isset($manifest['src/main.jsx']['file'])) {
            $entry = $manifest['src/main.jsx'];

            if (!empty($entry['css']) && is_array($entry['css'])) {
                foreach ($entry['css'] as $index => $css_file) {
                    wp_enqueue_style(
                        'ecosfera-app-' . $index,
                        $theme_uri . '/assets/build/' . ltrim($css_file, '/'),
                        [],
                        $theme_version
                    );
                }
            }

            wp_enqueue_script(
                'ecosfera-app',
                $theme_uri . '/assets/build/' . ltrim($entry['file'], '/'),
                [],
                $theme_version,
                true
            );
            wp_script_add_data('ecosfera-app', 'type', 'module');
        } else {
            wp_enqueue_style(
                'ecosfera-theme',
                $theme_uri . '/frontend/src/app.css',
                [],
                filemtime($theme_dir . '/frontend/src/app.css')
            );
            wp_enqueue_script(
                'ecosfera-app',
                $theme_uri . '/frontend/src/fallback.js',
                [],
                filemtime($theme_dir . '/frontend/src/fallback.js'),
                true
            );
        }
    }

    wp_add_inline_script(
        'ecosfera-app',
        'window.ecosferaData = ' . wp_json_encode($context, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . ';',
        'before'
    );
}

add_action('wp_enqueue_scripts', 'ecosfera_enqueue_theme_assets');
