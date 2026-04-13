<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the website, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'ecosphere' );
//define( 'DB_NAME', 'klim14ah_ecos' );

/** Database username */
define( 'DB_USER', 'root' );
//define( 'DB_USER', 'klim14ah_ecos' );

/** Database password */
define( 'DB_PASSWORD', 'root' );
//define( 'DB_PASSWORD', '666777888qwe!' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );
//define( 'DB_HOST', 'klim14ah.beget.tech' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         '>Hw`}P)ns<KZpQSx!1X[CxpSflD;q8JEU+h8iFh|ea^RP<6;/W}@b_U>g)N@4]qg' );
define( 'SECURE_AUTH_KEY',  'Z3Jn H}-tq{i/!@l8 =HWmRH_o._]LF}9.F?xBx;bL:C<Y!w_U[)-EI%$V(^BR4X' );
define( 'LOGGED_IN_KEY',    'K #G?8Os7LbH7{s^gm/+7^WaRd5gyhnK(Je|#W t*;w~b[eC7:L85+.ui19ulQ0H' );
define( 'NONCE_KEY',        '~NUd7Jl$cRz>D7Jd@d1`xfSO5-9v6HB8]pITjP|V{MC:RL/yGE`$hD/JT-]_cdss' );
define( 'AUTH_SALT',        '()bEg4[Y>qV-ViAbG/pOkV{w2-:V!R0;N@uaF35{.-#E=gfg~8FN`#[=Y1ToQK.=' );
define( 'SECURE_AUTH_SALT', '=@Pgqt?~S5=9VCv|RTK/F3!}Y`;v2XHa}z9k5uVyB^w$*bjj0vXqM@)*6)KD>#A?' );
define( 'LOGGED_IN_SALT',   '4<fCYWzP~:RY@HbO]@N`JR5<rB)>lZEse^bvnPr-Ap{e>0MT.N;X-CX*|+iu6~,[' );
define( 'NONCE_SALT',       'im~A{[7Zs_UyH+[F|M3C>ReJ(5+(VI/M,V#|j.%6W>Q/=HA2rypbjpedx:v/d]|I' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 *
 * At the installation time, database tables are created with the specified prefix.
 * Changing this value after WordPress is installed will make your site think
 * it has not been installed.
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/#table-prefix
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */

define('WP_HOME', 'http://ecosphere');
define('WP_SITEURL', 'http://ecosphere');
//define('ECOSFERA_VITE_DEV_SERVER', 'http://localhost:5173');

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
