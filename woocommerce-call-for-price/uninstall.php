<?php
/**
 * Currency Per Product Pro Uninstall
 *
 * Deletes all the settings for the plugin from the database when plugin is uninstalled.
 *
 * @author      Tyche Softwares
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

if( file_exists( WP_PLUGIN_DIR . 'woocommerce-call-for-price-pro/woocommerce-call-for-price-pro.php' ) ) {
    return;
}

global $wpdb;

$global_settings = "SELECT option_name FROM `" . $wpdb->prefix . "options` WHERE option_name LIKE 'alg_wc_call_for_price%' OR option_name LIKE 'alg_call_for_price%'";
$results = $wpdb->get_results( $global_settings );
foreach ( $results as $key => $value ) {
    delete_option( $value->option_name );
}
