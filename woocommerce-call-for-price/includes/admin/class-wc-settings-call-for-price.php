<?php
/**
 * WooCommerce Call for Price - Settings
 *
 * @version 3.2.0
 * @since   2.0.0
 * @author  Tyche Softwares
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

if ( ! class_exists( 'Alg_WC_Settings_Call_For_Price' ) ) :

class Alg_WC_Settings_Call_For_Price extends WC_Settings_Page {

	/**
	 * Constructor.
	 *
	 * @version 3.0.0
	 */
	function __construct() {
		$this->id    = 'alg_call_for_price';
		$this->label = __( 'Call for Price', 'woocommerce-call-for-price' );
		parent::__construct();
	}

	/**
	 * get_settings.
	 *
	 * @version 3.2.0
	 */
	function get_settings() {
		global $current_section;
		$settings = apply_filters( 'woocommerce_get_settings_' . $this->id . '_' . $current_section, array() );
		return array_merge( $settings, array(
			array(
				'title'     => __( 'Reset Settings', 'woocommerce-call-for-price' ),
				'type'      => 'title',
				'id'        => $this->id . '_' . $current_section . '_reset_options',
			),
			array(
				'title'     => __( 'Reset section settings', 'woocommerce-call-for-price' ),
				'desc'      => '<strong>' . __( 'Reset', 'woocommerce-call-for-price' ) . '</strong>',
				'id'        => $this->id . '_' . $current_section . '_reset',
				'default'   => 'no',
				'type'      => 'checkbox',
			),
			array(
				'type'      => 'sectionend',
				'id'        => $this->id . '_' . $current_section . '_reset_options',
			),
		) );
	}

	/**
	 * maybe_reset_settings.
	 *
	 * @version 3.1.0
	 * @since   3.1.0
	 */
	function maybe_reset_settings() {
		global $current_section;
		if ( 'yes' === get_option( $this->id . '_' . $current_section . '_reset', 'no' ) ) {
			foreach ( $this->get_settings() as $value ) {
				if ( isset( $value['default'] ) && isset( $value['id'] ) ) {
					delete_option( $value['id'] );
					$autoload = isset( $value['autoload'] ) ? ( bool ) $value['autoload'] : true;
					add_option( $value['id'], $value['default'], '', ( $autoload ? 'yes' : 'no' ) );
				}
			}
		}
	}

	/**
	 * Save settings.
	 *
	 * @version 3.1.0
	 * @since   3.1.0
	 */
	function save() {
		parent::save();
		$this->maybe_reset_settings();
	}

	/**
	 * output.
	 *
	 * @version 3.1.0
	 * @since   3.1.0
	 */
	function output() {
		parent::output();
		if ( '' != get_option( 'alg_wc_call_for_price_version', '' ) ) {
			echo '<p style="font-style:italic;float:right;">' . sprintf(
				__( 'Call for Price for WooCommerce - version %s', 'woocommerce-call-for-price' ),
				get_option( 'alg_wc_call_for_price_version', '' )
			) . '</p>';
		}
	}

}

endif;

return new Alg_WC_Settings_Call_For_Price();
