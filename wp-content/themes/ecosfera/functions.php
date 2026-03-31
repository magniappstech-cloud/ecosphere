<?php

declare(strict_types=1);

$ecosfera_includes = [
    '/inc/setup.php',
    '/inc/content-types.php',
    '/inc/context.php',
    '/inc/assets.php',
    '/inc/api.php',
];

foreach ($ecosfera_includes as $ecosfera_file) {
    $ecosfera_path = get_template_directory() . $ecosfera_file;

    if (file_exists($ecosfera_path)) {
        require_once $ecosfera_path;
    }
}

