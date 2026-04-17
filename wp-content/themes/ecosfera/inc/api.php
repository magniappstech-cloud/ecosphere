<?php

declare(strict_types=1);

function ecosfera_update_field_or_meta(int $post_id, string $field_name, mixed $value): void
{
    if (function_exists('update_field')) {
        update_field($field_name, $value, $post_id);
    }

    update_post_meta($post_id, $field_name, $value);
}

function ecosfera_normalize_uploaded_files(mixed $file_param): array
{
    if (!is_array($file_param) || !isset($file_param['name'])) {
        return [];
    }

    if (!is_array($file_param['name'])) {
        return [$file_param];
    }

    $files = [];
    $count = count($file_param['name']);

    for ($index = 0; $index < $count; $index++) {
        $files[] = [
            'name' => $file_param['name'][$index] ?? '',
            'type' => $file_param['type'][$index] ?? '',
            'tmp_name' => $file_param['tmp_name'][$index] ?? '',
            'error' => $file_param['error'][$index] ?? UPLOAD_ERR_NO_FILE,
            'size' => $file_param['size'][$index] ?? 0,
        ];
    }

    return $files;
}

function ecosfera_handle_uploaded_media(array $files, int $post_id): array
{
    if ($files === []) {
        return [];
    }

    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';

    $attachment_ids = [];

    foreach ($files as $file) {
        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK || empty($file['tmp_name'])) {
            continue;
        }

        $upload = wp_handle_sideload(
            $file,
            [
                'test_form' => false,
            ]
        );

        if (!is_array($upload) || isset($upload['error'])) {
            continue;
        }

        $attachment_id = wp_insert_attachment(
            [
                'post_mime_type' => (string) ($upload['type'] ?? ''),
                'post_title' => sanitize_file_name(pathinfo((string) ($file['name'] ?? ''), PATHINFO_FILENAME)),
                'post_content' => '',
                'post_status' => 'inherit',
            ],
            (string) $upload['file'],
            $post_id,
            true
        );

        if (is_wp_error($attachment_id)) {
            continue;
        }

        $metadata = wp_generate_attachment_metadata($attachment_id, (string) $upload['file']);

        if (is_array($metadata)) {
            wp_update_attachment_metadata($attachment_id, $metadata);
        }

        $attachment_ids[] = (int) $attachment_id;
    }

    return $attachment_ids;
}

function ecosfera_generate_unique_username(string $full_name, string $email): string
{
    $email_base = sanitize_user(strtok($email, '@') ?: '', true);
    $name_base = sanitize_user($full_name, true);
    $base = $name_base !== '' ? $name_base : ($email_base !== '' ? $email_base : 'ecosfera_user');
    $candidate = $base;
    $suffix = 1;

    while (username_exists($candidate)) {
        $candidate = $base . $suffix;
        $suffix++;
    }

    return $candidate;
}

function ecosfera_resolve_login_username(string $login): string
{
    if (is_email($login)) {
        $user = get_user_by('email', $login);

        if ($user instanceof WP_User) {
            return $user->user_login;
        }
    }

    return $login;
}

function ecosfera_split_full_name(string $full_name): array
{
    $name_parts = preg_split('/\s+/u', trim($full_name)) ?: [];
    $first_name = $name_parts[0] ?? '';
    $last_name = count($name_parts) > 1 ? implode(' ', array_slice($name_parts, 1)) : '';

    return [$first_name, $last_name];
}

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
                    return new WP_Error('ecosfera_forbidden', __('Требуется авторизация.', 'ecosfera'), ['status' => 401]);
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
                        'message' => __('Статья отправлена на модерацию.', 'ecosfera'),
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

    register_rest_route(
        'ecosfera/v1',
        '/initiative-submissions',
        [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => static function (WP_REST_Request $request): WP_REST_Response|WP_Error {
                if (!is_user_logged_in()) {
                    return new WP_Error('ecosfera_forbidden', __('Требуется авторизация.', 'ecosfera'), ['status' => 401]);
                }

                $title = sanitize_text_field((string) $request->get_param('title'));
                $category = sanitize_key((string) $request->get_param('initiativeCategory'));
                $excerpt = sanitize_textarea_field((string) $request->get_param('excerpt'));
                $problem_description = sanitize_textarea_field((string) $request->get_param('problemDescription'));
                $proposed_solution = sanitize_textarea_field((string) $request->get_param('proposedSolution'));
                $expected_result = sanitize_textarea_field((string) $request->get_param('expectedResult'));

                if ($title === '' || $category === '' || $excerpt === '' || $problem_description === '' || $proposed_solution === '') {
                    return new WP_Error(
                        'ecosfera_invalid_submission',
                        __('Заполните все обязательные поля инициативы.', 'ecosfera'),
                        ['status' => 422]
                    );
                }

                $content_sections = [
                    "Краткое описание:\n{$excerpt}",
                    "Описание проблемы:\n{$problem_description}",
                    "Предлагаемое решение:\n{$proposed_solution}",
                ];

                if ($expected_result !== '') {
                    $content_sections[] = "Ожидаемый результат:\n{$expected_result}";
                }

                $post_id = wp_insert_post(
                    [
                        'post_type' => 'initiative',
                        'post_status' => 'pending',
                        'post_title' => $title,
                        'post_excerpt' => $excerpt,
                        'post_content' => implode("\n\n", $content_sections),
                        'post_author' => get_current_user_id(),
                    ],
                    true
                );

                if (is_wp_error($post_id)) {
                    return $post_id;
                }

                ecosfera_update_field_or_meta((int) $post_id, 'initiative_category', $category);
                ecosfera_update_field_or_meta((int) $post_id, 'initiative_excerpt', $excerpt);
                ecosfera_update_field_or_meta((int) $post_id, 'problem_description', $problem_description);
                ecosfera_update_field_or_meta((int) $post_id, 'proposed_solution', $proposed_solution);
                ecosfera_update_field_or_meta((int) $post_id, 'expected_result', $expected_result);

                $uploaded_files = ecosfera_normalize_uploaded_files(
                    $request->get_file_params()['mediaFile']
                    ?? $request->get_file_params()['mediaFiles']
                    ?? null
                );
                $attachment_ids = ecosfera_handle_uploaded_media($uploaded_files, (int) $post_id);

                if ($attachment_ids !== []) {
                    $primary_attachment_id = (int) $attachment_ids[0];

                    ecosfera_update_field_or_meta((int) $post_id, 'initiative_media', $primary_attachment_id);
                    ecosfera_update_field_or_meta((int) $post_id, 'initiative_media_ids', $attachment_ids);

                    foreach ($attachment_ids as $attachment_id) {
                        if (wp_attachment_is_image($attachment_id)) {
                            set_post_thumbnail((int) $post_id, $attachment_id);
                            break;
                        }
                    }
                }

                return new WP_REST_Response(
                    [
                        'success' => true,
                        'message' => __('Инициатива отправлена на модерацию.', 'ecosfera'),
                        'postId' => $post_id,
                        'attachments' => $attachment_ids,
                    ],
                    201
                );
            },
            'permission_callback' => static function (): bool {
                return is_user_logged_in();
            },
        ]
    );

    register_rest_route(
        'ecosfera/v1',
        '/register-user',
        [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => static function (WP_REST_Request $request): WP_REST_Response|WP_Error {
                if (is_user_logged_in()) {
                    return new WP_Error('ecosfera_already_logged_in', __('Вы уже вошли в аккаунт.', 'ecosfera'), ['status' => 409]);
                }

                $full_name = sanitize_text_field((string) $request->get_param('fullName'));
                $email = sanitize_email((string) $request->get_param('email'));
                $password = (string) $request->get_param('password');
                $newsletter = rest_sanitize_boolean($request->get_param('newsletter'));

                if ($full_name === '' || $email === '' || $password === '') {
                    return new WP_Error('ecosfera_invalid_registration', __('Заполните все обязательные поля.', 'ecosfera'), ['status' => 422]);
                }

                if (!is_email($email)) {
                    return new WP_Error('ecosfera_invalid_email', __('Введите корректный email.', 'ecosfera'), ['status' => 422]);
                }

                if (email_exists($email)) {
                    return new WP_Error('ecosfera_email_exists', __('Пользователь с таким email уже существует.', 'ecosfera'), ['status' => 409]);
                }

                if (strlen($password) < 8) {
                    return new WP_Error('ecosfera_weak_password', __('Пароль должен содержать минимум 8 символов.', 'ecosfera'), ['status' => 422]);
                }

                $username = ecosfera_generate_unique_username($full_name, $email);
                $user_id = wp_create_user($username, $password, $email);

                if (is_wp_error($user_id)) {
                    return $user_id;
                }

                [$first_name, $last_name] = ecosfera_split_full_name($full_name);

                wp_update_user(
                    [
                        'ID' => $user_id,
                        'display_name' => $full_name,
                        'nickname' => $full_name,
                        'first_name' => $first_name,
                        'last_name' => $last_name,
                    ]
                );

                update_user_meta($user_id, 'ecosfera_newsletter_subscribed', $newsletter ? '1' : '0');

                wp_set_current_user($user_id);
                wp_set_auth_cookie($user_id, true);

                $user = get_user_by('id', $user_id);

                if ($user instanceof WP_User) {
                    do_action('wp_login', $user->user_login, $user);
                }

                return new WP_REST_Response(
                    [
                        'success' => true,
                        'message' => __('Регистрация успешно завершена.', 'ecosfera'),
                        'user' => [
                            'id' => $user_id,
                            'displayName' => $full_name,
                            'email' => $email,
                        ],
                    ],
                    201
                );
            },
            'permission_callback' => '__return_true',
        ]
    );

    register_rest_route(
        'ecosfera/v1',
        '/login-user',
        [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => static function (WP_REST_Request $request): WP_REST_Response|WP_Error {
                if (is_user_logged_in()) {
                    return new WP_REST_Response(
                        [
                            'success' => true,
                            'message' => __('Вы уже вошли в аккаунт.', 'ecosfera'),
                            'user' => [
                                'id' => get_current_user_id(),
                                'displayName' => wp_get_current_user()->display_name,
                            ],
                        ]
                    );
                }

                $login = sanitize_text_field((string) $request->get_param('login'));
                $password = (string) $request->get_param('password');
                $remember = rest_sanitize_boolean($request->get_param('remember'));

                if ($login === '' || $password === '') {
                    return new WP_Error('ecosfera_invalid_login', __('Введите email и пароль.', 'ecosfera'), ['status' => 422]);
                }

                $user = wp_signon(
                    [
                        'user_login' => ecosfera_resolve_login_username($login),
                        'user_password' => $password,
                        'remember' => $remember,
                    ],
                    is_ssl()
                );

                if (is_wp_error($user)) {
                    return new WP_Error('ecosfera_login_failed', __('Неверный email или пароль.', 'ecosfera'), ['status' => 401]);
                }

                wp_set_current_user($user->ID);

                return new WP_REST_Response(
                    [
                        'success' => true,
                        'message' => __('Вход выполнен успешно.', 'ecosfera'),
                        'user' => [
                            'id' => $user->ID,
                            'displayName' => $user->display_name,
                            'email' => $user->user_email,
                        ],
                    ]
                );
            },
            'permission_callback' => '__return_true',
        ]
    );

    register_rest_route(
        'ecosfera/v1',
        '/logout-user',
        [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => static function (): WP_REST_Response|WP_Error {
                if (!is_user_logged_in()) {
                    return new WP_Error('ecosfera_not_logged_in', __('You are not logged in.', 'ecosfera'), ['status' => 401]);
                }

                wp_logout();

                return new WP_REST_Response(
                    [
                        'success' => true,
                        'message' => __('Вы успешно вышли из аккаунта.', 'ecosfera'),
                    ]
                );
            },
            'permission_callback' => static function (): bool {
                return is_user_logged_in();
            },
        ]
    );

    register_rest_route(
        'ecosfera/v1',
        '/update-profile',
        [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => static function (WP_REST_Request $request): WP_REST_Response|WP_Error {
                if (!is_user_logged_in()) {
                    return new WP_Error('ecosfera_not_logged_in', __('Требуется авторизация.', 'ecosfera'), ['status' => 401]);
                }

                $user_id = get_current_user_id();
                $full_name = sanitize_text_field((string) $request->get_param('fullName'));
                $email = sanitize_email((string) $request->get_param('email'));
                $password = (string) $request->get_param('password');
                $newsletter = rest_sanitize_boolean($request->get_param('newsletter'));

                if ($full_name === '' || $email === '') {
                    return new WP_Error('ecosfera_invalid_profile', __('Заполните все обязательные поля.', 'ecosfera'), ['status' => 422]);
                }

                if (!is_email($email)) {
                    return new WP_Error('ecosfera_invalid_email', __('Введите корректный email.', 'ecosfera'), ['status' => 422]);
                }

                $existing_user = get_user_by('email', $email);

                if ($existing_user instanceof WP_User && (int) $existing_user->ID !== $user_id) {
                    return new WP_Error('ecosfera_email_exists', __('Пользователь с таким email уже существует.', 'ecosfera'), ['status' => 409]);
                }

                if ($password !== '' && strlen($password) < 8) {
                    return new WP_Error('ecosfera_weak_password', __('Пароль должен содержать минимум 8 символов.', 'ecosfera'), ['status' => 422]);
                }

                [$first_name, $last_name] = ecosfera_split_full_name($full_name);
                $userdata = [
                    'ID' => $user_id,
                    'user_email' => $email,
                    'display_name' => $full_name,
                    'nickname' => $full_name,
                    'first_name' => $first_name,
                    'last_name' => $last_name,
                ];

                if ($password !== '') {
                    $userdata['user_pass'] = $password;
                }

                $updated_user_id = wp_update_user($userdata);

                if (is_wp_error($updated_user_id)) {
                    return $updated_user_id;
                }

                update_user_meta($user_id, 'ecosfera_newsletter_subscribed', $newsletter ? '1' : '0');

                if ($password !== '') {
                    wp_set_auth_cookie($user_id, true);
                    wp_set_current_user($user_id);
                }

                return new WP_REST_Response(
                    [
                        'success' => true,
                        'message' => __('Профиль успешно обновлён.', 'ecosfera'),
                        'user' => [
                            'id' => $user_id,
                            'displayName' => $full_name,
                            'email' => $email,
                            'firstName' => $first_name,
                            'lastName' => $last_name,
                            'newsletter' => $newsletter,
                        ],
                    ]
                );
            },
            'permission_callback' => static function (): bool {
                return is_user_logged_in();
            },
        ]
    );
}

add_action('rest_api_init', 'ecosfera_register_api_routes');
