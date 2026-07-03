/**
 * src/screens/PerProduct.js
 *
 * Per-product info screen — PGBF-style SectionCard layout.
 */
import {
	__experimentalVStack as VStack,
	__experimentalText   as Text,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSettings } from '../context/SettingsContext';
import ProNotice from '../components/ProNotice';

const UPGRADE_URL = 'https://www.tychesoftwares.com/products/woocommerce-call-for-price-plugin/?utm_source=cfplite&utm_medium=notice&utm_campaign=upgrade';

export default function PerProduct() {
	const { settings } = useSettings();
	const enabled = settings?.general?.per_product_enabled;

	return (
		<VStack spacing={ 4 }>
			<VStack spacing={ 1 }>
				<Heading level={ 3 } style={ { margin: 0 } }>{ __( 'Per Product Settings', 'woocommerce-call-for-price' ) }</Heading>
				<Text style={ { color: '#646970' } }>
					{ __( 'Override Call for Price settings on any individual product.', 'woocommerce-call-for-price' ) }
				</Text>
			</VStack>

			{ /* Status banner */ }
			<ProNotice feature={ __( 'Per Product Settings', 'woocommerce-call-for-price' ) } />

			{ /* Status banner (alternate version with <a> instead of ExternalLink) */ }

			{ /* How it works */ }
			<div style={ {
				background  : '#fff',
				border      : '1px solid #e0e0e0',
				borderRadius: '8px',
				padding     : '24px',
			} }>
				<Text style={ { fontWeight: 600, fontSize: '14px', color: '#1d2327', display: 'block', marginBottom: '12px' } }>
					{ __( 'How it works', 'woocommerce-call-for-price' ) }
				</Text>
				<ol style={ { margin: '0 0 0 20px', padding: 0 } }>
					{ [
						<>
							<strong>{ __( 'Enable per-product settings', 'woocommerce-call-for-price' ) }</strong> { __( 'in the', 'woocommerce-call-for-price' ) }{ ' ' }
							<a href="#/general" style={ { color: '#2271b1' } }>{ __( 'General tab', 'woocommerce-call-for-price' ) }</a>.
						</>,
						<><strong>{ __( 'Open any product', 'woocommerce-call-for-price' ) }</strong> { __( 'in WooCommerce → Products.', 'woocommerce-call-for-price' ) }</>,
						<>{ __( 'Find the', 'woocommerce-call-for-price' ) } <strong>{ __( 'Call for Price', 'woocommerce-call-for-price' ) }</strong> { __( 'metabox and configure the override for that product.', 'woocommerce-call-for-price' ) }</>,
						<>{ __( 'Set', 'woocommerce-call-for-price' ) } <strong>{ __( 'Enable', 'woocommerce-call-for-price' ) }</strong> { __( 'to', 'woocommerce-call-for-price' ) } <em>{ __( 'No', 'woocommerce-call-for-price' ) }</em> { ' ' }{ __( 'to inherit the global / product-type settings.', 'woocommerce-call-for-price' ) }</>,
					].map( ( item, i ) => (
						<li key={ i } style={ { padding: '4px 0', fontSize: '13px', color: '#3c434a', listStyle: 'decimal' } }>
							{ item }
						</li>
					) ) }
				</ol>
			</div>

			{ /* Field reference */ }
			<div style={ {
				background  : '#fff',
				border      : '1px solid #e0e0e0',
				borderRadius: '8px',
				padding     : '24px',
			} }>
				<Text style={ { fontWeight: 600, fontSize: '14px', color: '#1d2327', display: 'block', marginBottom: '8px' } }>
					{ __( 'Available per-product fields', 'woocommerce-call-for-price' ) }
				</Text>
				<Text style={ { fontSize: '13px', color: '#646970', display: 'block', marginBottom: '12px' } }>
					{ __( 'These fields are available in the metabox on each product edit page:', 'woocommerce-call-for-price' ) }
				</Text>
				<table className="wp-list-table widefat striped" style={ { fontSize: '13px' } }>
					<thead>
						<tr>
							<th style={ { fontWeight: 600 } }>{ __( 'Field', 'woocommerce-call-for-price' ) }</th>
							<th style={ { fontWeight: 600 } }>{ __( 'Description', 'woocommerce-call-for-price' ) }</th>
						</tr>
					</thead>
					<tbody>
						{ [
							[ __( 'Enable', 'woocommerce-call-for-price' ),               __( 'Yes / No — override enable flag. No inherits global settings.', 'woocommerce-call-for-price' ) ],
							[ __( 'Contact Channel', 'woocommerce-call-for-price' ),      __( 'Text, Phone Call, WhatsApp, Email, or Custom Link — overrides the global call type.', 'woocommerce-call-for-price' ) ],
							[ __( 'Custom Value', 'woocommerce-call-for-price' ),          __( 'Phone number, WhatsApp number, email address, or URL depending on call type.', 'woocommerce-call-for-price' ) ],
							[ __( 'WhatsApp Template', 'woocommerce-call-for-price' ),     __( 'Message pre-filled in WhatsApp. Supports {product_name}, {store_name}, {product_url}.', 'woocommerce-call-for-price' ) ],
							[ __( 'Email Subject', 'woocommerce-call-for-price' ),         __( 'Email subject line template. Same placeholder tokens supported.', 'woocommerce-call-for-price' ) ],
							[ __( 'Email Content', 'woocommerce-call-for-price' ),         __( 'Email body template. Same placeholder tokens supported.', 'woocommerce-call-for-price' ) ],
							[ __( 'Text (all views)', 'woocommerce-call-for-price' ),       __( 'HTML label shown wherever the product price appears. Overrides global text.', 'woocommerce-call-for-price' ) ],
							[ __( 'Request Forms', 'woocommerce-call-for-price' ),         __( 'None, Contact Form 7, Gravity Form, or Other — shows a contact form on the product page.', 'woocommerce-call-for-price' ) ],
							[ __( 'Shortcode', 'woocommerce-call-for-price' ),             __( 'Form shortcode string. Used when Request Forms is set to Other Forms.', 'woocommerce-call-for-price' ) ],
						].map( ( [ field, desc ] ) => (
							<tr key={ field }>
								<td><code>{ field }</code></td>
								<td>{ desc }</td>
							</tr>
						) ) }
					</tbody>
				</table>
				<Text style={ { fontSize: '12px', color: '#646970', display: 'block', marginTop: '12px' } }>
					{ __( 'Per-product settings are stored in a single consolidated meta key', 'woocommerce-call-for-price' ) }{ ' ' }
					<code>_cfp_pro_product_settings</code>.
				</Text>
			</div>
		</VStack>
	);
}
