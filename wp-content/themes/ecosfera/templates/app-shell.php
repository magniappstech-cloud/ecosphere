<?php

declare(strict_types=1);
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<div id="ecosfera-app"></div>
<noscript>
    <div style="padding:24px;font-family:sans-serif;">
        Для работы интерфейса нужен JavaScript. Контент и структура уже управляются из WordPress, а фронтенд отрисовывает React.
    </div>
</noscript>
<?php wp_footer(); ?>
</body>
</html>

