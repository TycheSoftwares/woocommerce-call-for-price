<?php
/**
 * Frontend
 *
 * Builds the Call for Price label or action-button HTML and returns it
 * in place of (or alongside) the product price HTML.
 *
 * Handles all scenarios from the live 4.1.0 class-alg-wc-call-for-price.php:
 *  - Standard empty-price products
 *  - Forced-CFP products (all / out-of-stock / taxonomy / price-range)
 *  - Per-product overrides (call type, value, template, text)
 *  - "for_all_products_text" — appends CFP label alongside the existing price
 *  - Exclusion lists (products / categories)
 *  - Elementor Pro CSS
 *
 * @package WooCommerce-Call-For-Price-Lite
 */

namespace TycheSoftwares\CallForPrice\Lite;

defined( 'ABSPATH' ) || exit;

/**
 * Class Frontend
 */
class Frontend {

	/**
	 * Main price HTML filter callback — hooked on woocommerce_get_price_html
	 * and woocommerce_variation_price_html at PHP_INT_MAX.
	 *
	 * @param string      $price_html Original price HTML.
	 * @param \WC_Product $product    Current product.
	 * @return string
	 */
	public static function filter_price_html( string $price_html, \WC_Product $product ): string {
		$product_id = $product->is_type( 'variation' ) ? $product->get_parent_id() : $product->get_id();
		$price      = $product->get_price();

		$force     = Compatibility::get_setting( 'general', 'force', array() );
		$force_all = ! empty( $force['all_products'] );
		$is_empty  = '' === (string) $price;

		// Always honour the exclusion list — even when force_all is on.
		if ( self::is_excluded( $product_id ) ) {
			return $price_html;
		}

		// "for_all_products_text" — append CFP label alongside existing price.
		// Only applies when the product has a real non-empty price and is not
		// already being replaced by a forced-CFP condition.
		$for_all_text = ! empty( $force['for_all_products_text'] );
		if ( $for_all_text && ! $is_empty && ! $force_all && ! self::is_forced( $product_id, $force, $price ) ) {
			$type = $product->get_type();
			if ( ! in_array( $type, array( 'simple', 'variable', 'grouped', 'external' ), true ) ) {
				$type = 'simple';
			}
			if ( Compatibility::get_setting( $type, 'enabled', true ) ) {
				$view = self::current_view( $product_id );
				if ( Compatibility::get_setting( $type, array( 'views', $view, 'enabled' ), true ) ) {
					$extra = self::build_output( $product, $type, $view );
					return $price_html . '<br>' . $extra;
				}
			}
			return $price_html;
		}

		// Determine whether this product should show CFP.
		if ( ! $force_all && ! $is_empty ) {
			if ( ! self::is_forced( $product_id, $force, $price ) ) {
				return $price_html;
			}
		}

		// Determine product type.
		$type = $product->get_type();
		if ( ! in_array( $type, array( 'simple', 'variable', 'grouped', 'external' ), true ) ) {
			$type = 'simple';
		}

		// Type-level enabled flag.
		if ( ! Compatibility::get_setting( $type, 'enabled', true ) ) {
			return $price_html;
		}

		// View-level enabled flag.
		$view = self::current_view( $product_id );
		if ( ! Compatibility::get_setting( $type, array( 'views', $view, 'enabled' ), true ) ) {
			return $price_html;
		}

		// User role restriction.
		if ( ! self::user_can_see( $product_id ) ) {
			return $price_html;
		}

		// Build the label / button.
		return self::build_output( $product, $type, $view );
	}

	/**
	 * Build the CFP label or action-button HTML for a product.
	 *
	 * @param \WC_Product $product Product object.
	 * @param string      $type    Product type slug.
	 * @param string      $view    View context slug.
	 * @return string
	 */
	private static function build_output( \WC_Product $product, string $type, string $view ): string {
		$product_id   = $product->is_type( 'variation' ) ? $product->get_parent_id() : $product->get_id();
		$product_name = $product->get_name();
		$store_name   = get_bloginfo( 'name' );
		$product_url  = get_permalink( $product_id );

		// Per-product override takes precedence over type-level settings.
		$per_product = Compatibility::get_product_meta( $product_id );
		$is_per      = 'yes' === ( $per_product['enabled'] ?? 'no' );

		if ( $is_per ) {
			$call_type         = $per_product['call_type']         ?? 'text';
			$call_value        = $per_product['custom_value']      ?? '';
			$whatsapp_template = $per_product['whatsapp_template'] ?? '';
			$email_subject     = $per_product['email_subject']     ?? '';
			$email_content     = $per_product['email_content']     ?? '';
			$label             = ! empty( $per_product['text_all_views'] )
				? $per_product['text_all_views']
				: Compatibility::get_setting( $type, array( 'views', $view, 'text' ), '<strong>Call for Price</strong>' );
		} else {
			$call_type         = Compatibility::get_setting( $type, 'call_type', 'text' );
			$call_value        = Compatibility::get_setting( $type, 'call_type_value', '' );
			$whatsapp_template = Compatibility::get_setting( $type, 'whatsapp_template', '' );
			$email_subject     = Compatibility::get_setting( $type, 'email_subject', '' );
			$email_content     = Compatibility::get_setting( $type, 'email_content', '' );
			$label             = Compatibility::get_setting( $type, array( 'views', $view, 'text' ), '<strong>Call for Price</strong>' );
		}

		$label = do_shortcode( $label );

		// Elementor Pro compatibility: load the stylesheet on product pages.
		if ( is_product() ) {
			$elementor = 'elementor-pro/elementor-pro.php';
			$active    = apply_filters( 'active_plugins', get_option( 'active_plugins', array() ) );
			$network   = is_multisite() ? get_site_option( 'active_sitewide_plugins', array() ) : array();
			if ( in_array( $elementor, $active, true ) || array_key_exists( $elementor, $network ) ) {
				wp_enqueue_style( 'cfp-elementor', CFP_LITE_PLUGIN_URL . 'assets/css/cfp-elementor.css', array(), CFP_LITE_VERSION );
			}
		}

		if ( 'text' === $call_type ) {
			/**
			 * Filter the CFP label HTML for text‑type contact method.
			 *
			 * @param string $label      The label HTML.
			 * @param int    $product_id Product ID.
			 * @param string $type       Product type slug.
			 * @param string $view       View context slug.
			 */
			return apply_filters( 'cfp_pro_label_html', $label, $product_id, $type, $view );
		}

		// Build action button.
		$href = '#';

		switch ( $call_type ) {
			case 'phone':
				$href = 'tel:' . esc_attr( preg_replace( '/\s/', '', $call_value ) );
				break;

			case 'whatsapp':
				$message = str_replace(
					array( '{product_name}', '{store_name}', '{product_url}' ),
					array( $product_name, $store_name, $product_url ),
					$whatsapp_template
				);
				$number = preg_replace( '/\D/', '', $call_value );
				$href   = 'https://wa.me/' . $number . '?text=' . rawurlencode( $message );
				break;

			case 'email':
				$subject = str_replace(
					array( '{product_name}', '{store_name}', '{product_url}' ),
					array( $product_name, $store_name, $product_url ),
					$email_subject
				);
				$body = str_replace(
					array( '{product_name}', '{store_name}', '{product_url}' ),
					array( $product_name, $store_name, $product_url ),
					$email_content
				);
				$href = 'mailto:' . rawurlencode( $call_value )
					. '?subject=' . rawurlencode( $subject )
					. '&body=' . rawurlencode( $body );
				break;

			case 'custom_link':
				$href = esc_url( $call_value );
				break;
		}

		$button_html = sprintf(
			'<a href="%s" class="button cfp-pro-btn cfp-pro-btn--%s">%s</a>',
			esc_url( $href ),
			esc_attr( $call_type ),
			wp_kses_post( $label )
		);

		/**
		 * Filter the complete button HTML for non‑text contact methods.
		 *
		 * @param string $button_html The button HTML.
		 * @param string $call_type   Contact type.
		 * @param string $call_value  Contact value (phone, email, URL).
		 * @param string $label       Button label.
		 * @param int    $product_id  Product ID.
		 */
		return apply_filters( 'cfp_pro_button_html', $button_html, $call_type, $call_value, $label, $product_id );
	}

	/**
	 * True if the product or its parent category is in the exclusion list.
	 *
	 * @param int $product_id Product ID.
	 * @return bool
	 */
	private static function is_excluded( int $product_id ): bool {
		$exclude  = Compatibility::get_setting( 'general', 'exclude', array() );
		$ex_prods = array_map( 'intval', (array) ( $exclude['products']   ?? array() ) );
		$ex_cats  = array_map( 'intval', (array) ( $exclude['categories'] ?? array() ) );

		if ( ! empty( $ex_prods ) && in_array( $product_id, $ex_prods, true ) ) {
			return true;
		}
		if ( ! empty( $ex_cats ) ) {
			foreach ( $ex_cats as $cat_id ) {
				if ( has_term( $cat_id, 'product_cat', $product_id ) ) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * Check forced-CFP conditions (out-of-stock, taxonomy, price range).
	 * `force.all_products` is handled separately in the caller.
	 *
	 * @param int   $product_id Product ID.
	 * @param array $force      General.force sub-array.
	 * @param mixed $price      Current product price.
	 * @return bool
	 */
	private static function is_forced( int $product_id, array $force, $price ): bool {
		// Zero price with for_zero_price setting.
		if ( ! empty( $force['for_zero_price'] ) && 0.0 === (float) $price && '' !== (string) $price ) {
			return true;
		}

		// Out of stock.
		if ( ! empty( $force['out_of_stock'] ) ) {
			$product = wc_get_product( $product_id );
			if ( $product && ! $product->is_in_stock() ) {
				return true;
			}
		}

		// By taxonomy.
		$by_tax = $force['by_taxonomy'] ?? array();
		if ( ! empty( $by_tax['enabled'] ) ) {
			$cats = (array) ( $by_tax['product_cat'] ?? array() );
			$tags = (array) ( $by_tax['product_tag'] ?? array() );

			if ( $cats && has_term( $cats, 'product_cat', $product_id ) ) {
				return true;
			}
			if ( $tags && has_term( $tags, 'product_tag', $product_id ) ) {
				return true;
			}
		}

		// By price range.
		$by_price = $force['by_price'] ?? array();
		if ( ! empty( $by_price['enabled'] ) && is_numeric( $price ) ) {
			$min = (float) ( $by_price['min'] ?? 0 );
			$max = (float) ( $by_price['max'] ?? 0 );
			$p   = (float) $price;

			$above_min = 0.0 === $min || $p >= $min;
			$below_max = 0.0 === $max || $p <= $max;

			if ( $above_min && $below_max ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Determine which view context the current product is being rendered in.
	 *
	 * @param int $product_id Product ID (unused, but kept for future expansion).
	 * @return string
	 */
	private static function current_view( int $product_id ): string {
		$filter = current_filter();

		if ( 'woocommerce_variation_price_html' === $filter ) {
			return 'variation';
		}
		if ( is_single( $product_id ) ) {
			return 'single';
		}
		if ( is_single() ) {
			return 'related';
		}
		if ( is_front_page() ) {
			return 'home';
		}
		if ( is_page() ) {
			return 'page';
		}
		if ( is_archive() ) {
			return 'archive';
		}
		return 'single';
	}

	/**
	 * Check whether the current user's role is allowed to see CFP.
	 * An empty allowed_roles array means all users can see it.
	 *
	 * @param int $product_id Product ID (unused, but kept for signature consistency).
	 * @return bool
	 */
	private static function user_can_see( int $product_id ): bool {
		$allowed_roles = Compatibility::get_setting( 'general', 'logged_in_only', array() );

		if ( empty( $allowed_roles ) ) {
			return true;
		}

		$current_user = wp_get_current_user();
		$current_role = $current_user->roles[0] ?? 'guest';

		return in_array( $current_role, $allowed_roles, true );
	}
}
