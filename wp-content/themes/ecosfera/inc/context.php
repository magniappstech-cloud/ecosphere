<?php

declare(strict_types=1);

function ecosfera_decode_text(string $value): string
{
    return html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

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
                'title' => ecosfera_decode_text((string) $item->title),
                'url' => $item->url,
                'target' => $item->target ?: '_self',
                'parent' => (int) $item->menu_item_parent,
            ];
        },
        $items
    );
}

function ecosfera_resolve_menu(array $locations): array
{
    foreach ($locations as $location) {
        $items = ecosfera_menu_tree($location);

        if ($items !== []) {
            return $items;
        }
    }

    return [];
}

function ecosfera_normalize_choice_field(string $field_name, int $post_id): array
{
    $value = '';
    $label = '';

    if (function_exists('get_field')) {
        $raw = get_field($field_name, $post_id);

        if (is_array($raw)) {
            $value = (string) ($raw['value'] ?? $raw['label'] ?? '');
            $label = (string) ($raw['label'] ?? $raw['value'] ?? '');
        } else {
            $value = (string) $raw;
        }
    }

    if ($value === '') {
        $value = (string) get_post_meta($post_id, $field_name, true);
    }

    if ($label === '' && function_exists('get_field_object')) {
        $field_object = get_field_object($field_name, $post_id, false, false);

        if (is_array($field_object)) {
            $choices = $field_object['choices'] ?? [];

            if (is_array($choices) && $value !== '' && isset($choices[$value])) {
                $label = (string) $choices[$value];
            }
        }
    }

    if ($label === '') {
        $label = $value;
    }

    return [
        'value' => ecosfera_decode_text($value),
        'label' => ecosfera_decode_text($label),
    ];
}

function ecosfera_normalize_file_field(mixed $field_value): array
{
    if (is_array($field_value)) {
        return [
            'id' => (int) ($field_value['ID'] ?? $field_value['id'] ?? 0),
            'url' => (string) ($field_value['url'] ?? ''),
            'mime' => (string) ($field_value['mime_type'] ?? $field_value['mime'] ?? ''),
            'title' => (string) ($field_value['title'] ?? ''),
            'filename' => (string) ($field_value['filename'] ?? ''),
        ];
    }

    if (is_numeric($field_value)) {
        $attachment_id = (int) $field_value;

        return [
            'id' => $attachment_id,
            'url' => (string) wp_get_attachment_url($attachment_id),
            'mime' => (string) get_post_mime_type($attachment_id),
            'title' => (string) get_the_title($attachment_id),
            'filename' => (string) basename((string) get_attached_file($attachment_id)),
        ];
    }

    if (is_string($field_value) && $field_value !== '') {
        return [
            'id' => 0,
            'url' => $field_value,
            'mime' => '',
            'title' => '',
            'filename' => basename($field_value),
        ];
    }

    return [
        'id' => 0,
        'url' => '',
        'mime' => '',
        'title' => '',
        'filename' => '',
    ];
}

function ecosfera_get_file_field(string $field_name, int $post_id): array
{
    $value = function_exists('get_field')
        ? get_field($field_name, $post_id)
        : get_post_meta($post_id, $field_name, true);

    return ecosfera_normalize_file_field($value);
}

function ecosfera_get_text_field(string $field_name, int $post_id): string
{
    $value = function_exists('get_field')
        ? get_field($field_name, $post_id)
        : get_post_meta($post_id, $field_name, true);

    if (is_array($value)) {
        return '';
    }

    return ecosfera_decode_text(trim((string) $value));
}

function ecosfera_get_oembed_html(string $url): string
{
    if ($url === '') {
        return '';
    }

    $embed = wp_oembed_get($url, ['width' => 1280]);

    return is_string($embed) ? $embed : '';
}

function ecosfera_get_author_name(int $author_id): string
{
    return ecosfera_decode_text((string) get_the_author_meta('display_name', $author_id));
}

function ecosfera_get_reading_time(WP_Post $post): int
{
    $words = str_word_count(wp_strip_all_tags($post->post_content));

    return max(1, (int) ceil($words / 200));
}

function ecosfera_get_project_country_name(int $post_id): string
{
    $terms = wp_get_post_terms($post_id, 'project_country', ['fields' => 'names']);

    if (is_array($terms) && $terms !== []) {
        return ecosfera_decode_text((string) $terms[0]);
    }

    $acf_country = ecosfera_get_text_field('country', $post_id);

    if ($acf_country !== '') {
        return $acf_country;
    }

    $meta_country = ecosfera_decode_text(trim((string) get_post_meta($post_id, 'country', true)));

    if ($meta_country !== '') {
        return $meta_country;
    }

    return 'Россия';
}

function ecosfera_get_site_stats(): array
{
    $users = count_users();
    $projects_query = new WP_Query(
        [
            'post_type' => 'project',
            'posts_per_page' => -1,
            'post_status' => 'publish',
            'fields' => 'ids',
            'no_found_rows' => true,
        ]
    );

    $project_ids = array_map('intval', $projects_query->posts);
    $countries = [];

    foreach ($project_ids as $project_id) {
        $country_name = ecosfera_get_project_country_name($project_id);
        $countries[mb_strtolower($country_name)] = $country_name;
    }

    return [
        'participants' => (int) ($users['total_users'] ?? 0),
        'projects' => count($project_ids),
        'countries' => count($countries),
    ];
}

function ecosfera_format_dashboard_item(WP_Post $post): array
{
    $item = ecosfera_format_post($post);
    $item['postStatus'] = $post->post_status;
    $item['editLabel'] = $post->post_status === 'draft' ? 'Продолжить' : 'Открыть';

    return $item;
}

function ecosfera_get_recent_activity(array $posts, string $type, array &$months): void
{
    foreach ($posts as $post) {
        if (!$post instanceof WP_Post) {
            continue;
        }

        $month_key = wp_date('Y-m', strtotime($post->post_date_gmt ?: $post->post_date));

        if (!isset($months[$month_key])) {
            continue;
        }

        $months[$month_key][$type]++;
    }
}

function ecosfera_get_user_dashboard_data(int $user_id): array
{
    if ($user_id <= 0) {
        return [
            'articles' => [
                'publishedCount' => 0,
                'pendingCount' => 0,
                'draftCount' => 0,
                'published' => [],
                'pending' => [],
                'drafts' => [],
            ],
            'projects' => [
                'count' => 0,
                'publishedCount' => 0,
                'pendingCount' => 0,
                'draftCount' => 0,
                'items' => [],
            ],
            'activity' => [],
        ];
    }

    $query_args = [
        'author' => $user_id,
        'post_status' => ['publish', 'pending', 'draft'],
        'posts_per_page' => -1,
        'orderby' => 'date',
        'order' => 'DESC',
        'no_found_rows' => true,
    ];

    $article_posts = get_posts(
        array_merge(
            $query_args,
            [
                'post_type' => 'article',
            ]
        )
    );

    $project_posts = get_posts(
        array_merge(
            $query_args,
            [
                'post_type' => 'project',
            ]
        )
    );

    $published_articles = array_values(array_filter($article_posts, static fn (WP_Post $post): bool => $post->post_status === 'publish'));
    $pending_articles = array_values(array_filter($article_posts, static fn (WP_Post $post): bool => $post->post_status === 'pending'));
    $draft_articles = array_values(array_filter($article_posts, static fn (WP_Post $post): bool => $post->post_status === 'draft'));

    $published_projects = array_values(array_filter($project_posts, static fn (WP_Post $post): bool => $post->post_status === 'publish'));
    $pending_projects = array_values(array_filter($project_posts, static fn (WP_Post $post): bool => $post->post_status === 'pending'));
    $draft_projects = array_values(array_filter($project_posts, static fn (WP_Post $post): bool => $post->post_status === 'draft'));

    $months = [];

    for ($offset = 5; $offset >= 0; $offset--) {
        $timestamp = strtotime("-{$offset} months");
        $month_key = wp_date('Y-m', $timestamp);
        $months[$month_key] = [
            'label' => ecosfera_decode_text(wp_date('M', $timestamp)),
            'articles' => 0,
            'projects' => 0,
        ];
    }

    ecosfera_get_recent_activity($article_posts, 'articles', $months);
    ecosfera_get_recent_activity($project_posts, 'projects', $months);

    return [
        'articles' => [
            'publishedCount' => count($published_articles),
            'pendingCount' => count($pending_articles),
            'draftCount' => count($draft_articles),
            'published' => array_map('ecosfera_format_dashboard_item', array_slice($published_articles, 0, 24)),
            'pending' => array_map('ecosfera_format_dashboard_item', array_slice($pending_articles, 0, 24)),
            'drafts' => array_map('ecosfera_format_dashboard_item', array_slice($draft_articles, 0, 24)),
        ],
        'projects' => [
            'count' => count($project_posts),
            'publishedCount' => count($published_projects),
            'pendingCount' => count($pending_projects),
            'draftCount' => count($draft_projects),
            'items' => array_map('ecosfera_format_dashboard_item', array_slice($project_posts, 0, 24)),
        ],
        'activity' => array_values($months),
    ];
}

function ecosfera_format_post(WP_Post $post): array
{
    $status = ecosfera_normalize_choice_field('status', $post->ID);
    $format = ecosfera_normalize_choice_field('format', $post->ID);
    $topics = wp_get_post_terms($post->ID, 'ecosfera_topic', ['fields' => 'names']);
    $city = $post->post_type === 'project' ? ecosfera_get_text_field('city', $post->ID) : '';

    return [
        'id' => (int) $post->ID,
        'title' => ecosfera_decode_text(get_the_title($post)),
        'excerpt' => ecosfera_decode_text(wp_strip_all_tags(get_the_excerpt($post))),
        'content' => apply_filters('the_content', $post->post_content),
        'type' => $post->post_type,
        'slug' => $post->post_name,
        'url' => get_permalink($post),
        'date' => get_the_date('c', $post),
        'dateDisplay' => ecosfera_decode_text(get_the_date('', $post)),
        'featuredImage' => get_the_post_thumbnail_url($post, 'large') ?: '',
        'authorName' => ecosfera_get_author_name((int) $post->post_author),
        'readingTime' => ecosfera_get_reading_time($post),
        'topics' => is_array($topics) ? array_map('ecosfera_decode_text', $topics) : [],
        'status' => $status['value'],
        'statusLabel' => $status['label'],
        'format' => $format['value'],
        'formatLabel' => $format['label'],
        'city' => $city,
    ];
}

function ecosfera_format_audio_post(WP_Post $post): array
{
    $base = ecosfera_format_post($post);
    $audio_file = ecosfera_get_file_field('audio_file', $post->ID);

    return array_merge(
        $base,
        [
            'artist' => ecosfera_get_text_field('artist', $post->ID),
            'duration' => ecosfera_get_text_field('duration', $post->ID),
            'audioFile' => $audio_file['url'],
            'audioMime' => $audio_file['mime'],
        ]
    );
}

function ecosfera_format_video_post(WP_Post $post): array
{
    $base = ecosfera_format_post($post);
    $video_file = ecosfera_get_file_field('video_file', $post->ID);
    $video_url = ecosfera_get_text_field('video_url', $post->ID);

    return array_merge(
        $base,
        [
            'author' => ecosfera_get_text_field('video_author', $post->ID),
            'meta' => ecosfera_get_text_field('video_meta', $post->ID),
            'videoFile' => $video_file['url'],
            'videoMime' => $video_file['mime'],
            'videoUrl' => $video_url,
            'embedHtml' => ecosfera_get_oembed_html($video_url),
        ]
    );
}

function ecosfera_format_story_post(WP_Post $post): array
{
    $base = ecosfera_format_post($post);

    return array_merge(
        $base,
        [
            'cardLabel' => ecosfera_get_text_field('card_label', $post->ID),
        ]
    );
}

function ecosfera_format_news_post(WP_Post $post): array
{
    $base = ecosfera_format_post($post);
    $categories = wp_get_post_terms($post->ID, 'news_category', ['fields' => 'names']);

    return array_merge(
        $base,
        [
            'newsCategory' => is_array($categories) && $categories !== [] ? ecosfera_decode_text((string) $categories[0]) : 'Новости',
        ]
    );
}

function ecosfera_query_posts(string $post_type, callable $formatter, int $limit = 6): array
{
    $query = new WP_Query(
        [
            'post_type' => $post_type,
            'posts_per_page' => $limit,
            'post_status' => 'publish',
            'orderby' => 'menu_order date',
            'order' => 'DESC',
            'no_found_rows' => true,
        ]
    );

    return array_map($formatter, $query->posts);
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
        'stats' => ecosfera_get_site_stats(),
        'navigation' => [
            'headerPrimary' => ecosfera_resolve_menu(['header_primary', 'primary']),
            'footerPlatform' => ecosfera_resolve_menu(['footer_platform', 'footer']),
            'footerCommunity' => ecosfera_resolve_menu(['footer_community']),
            'footerResources' => ecosfera_resolve_menu(['footer_resources']),
            'primary' => ecosfera_resolve_menu(['header_primary', 'primary']),
            'footer' => ecosfera_resolve_menu(['footer_platform', 'footer']),
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
            'posts' => ecosfera_query_posts('post', 'ecosfera_format_post'),
            'articles' => ecosfera_query_posts('article', 'ecosfera_format_post', 24),
            'esgPage' => ecosfera_query_posts('esg_pages', 'ecosfera_format_post', 24),
            'news' => ecosfera_query_posts('news_item', 'ecosfera_format_news_post', 24),
            'projects' => ecosfera_query_posts('project', 'ecosfera_format_post'),
            'initiatives' => ecosfera_query_posts('initiative', 'ecosfera_format_post'),
            'art' => ecosfera_query_posts('artwork', 'ecosfera_format_post', 24),
            'artAudio' => ecosfera_query_posts('art_audio', 'ecosfera_format_audio_post', 24),
            'artVideos' => ecosfera_query_posts('art_video', 'ecosfera_format_video_post', 24),
            'artStories' => ecosfera_query_posts('art_story', 'ecosfera_format_story_post', 24),
            'pages' => ecosfera_query_posts('page', 'ecosfera_format_post', 8),
        ],
        'user' => [
            'loggedIn' => is_user_logged_in(),
            'id' => get_current_user_id(),
            'displayName' => is_user_logged_in() ? ecosfera_get_author_name(get_current_user_id()) : '',
            'email' => is_user_logged_in() ? ecosfera_decode_text((string) wp_get_current_user()->user_email) : '',
            'firstName' => is_user_logged_in() ? ecosfera_decode_text((string) get_user_meta(get_current_user_id(), 'first_name', true)) : '',
            'lastName' => is_user_logged_in() ? ecosfera_decode_text((string) get_user_meta(get_current_user_id(), 'last_name', true)) : '',
            'newsletter' => is_user_logged_in() ? get_user_meta(get_current_user_id(), 'ecosfera_newsletter_subscribed', true) === '1' : false,
            'isAdmin' => is_user_logged_in() ? current_user_can('manage_options') : false,
        ],
        'userDashboard' => ecosfera_get_user_dashboard_data(get_current_user_id()),
        'rest' => [
            'root' => esc_url_raw(rest_url()),
            'nonce' => wp_create_nonce('wp_rest'),
            'bootstrap' => esc_url_raw(rest_url('ecosfera/v1/bootstrap')),
            'articleSubmission' => esc_url_raw(rest_url('ecosfera/v1/article-submissions')),
            'projectSubmission' => esc_url_raw(rest_url('ecosfera/v1/project-submissions')),
            'esgSubmission' => esc_url_raw(rest_url('ecosfera/v1/esg-submissions')),
            'initiativeSubmission' => esc_url_raw(rest_url('ecosfera/v1/initiative-submissions')),
            'registerUser' => esc_url_raw(rest_url('ecosfera/v1/register-user')),
            'loginUser' => esc_url_raw(rest_url('ecosfera/v1/login-user')),
            'logoutUser' => esc_url_raw(rest_url('ecosfera/v1/logout-user')),
            'updateProfile' => esc_url_raw(rest_url('ecosfera/v1/update-profile')),
        ],
    ];
}
