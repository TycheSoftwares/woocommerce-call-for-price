/**
 * src/screens/ProductTypes.js
 *
 * Single "Product Types" screen with horizontal sub-tabs.
 * Each sub-tab renders the shared ProductTypeScreen for that type.
 *
 * Sub-tab active state is local — switching types stays on /product-types.
 * Adding a new product type only requires adding an entry to PRODUCT_TYPES.
 */
import { useState } from '@wordpress/element';
import {
	__experimentalVStack  as VStack,
	__experimentalHeading as Heading,
	__experimentalText    as Text,
	ExternalLink,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ProductTypeScreen from '../components/ProductTypeScreen';

// ── Product type definitions ───────────────────────────────────────────────────
// key        must match the section key used in PHP Settings + REST API
// label      shown in the sub-tab button and as the card title
// isVariable passes the extra "variation" view row to ProductTypeScreen

const getProductTypes = () => [
	{ key: 'simple',   label: __( 'Simple',   'woocommerce-call-for-price' ), isVariable: false },
	{ key: 'variable', label: __( 'Variable', 'woocommerce-call-for-price' ), isVariable: true  },
	{ key: 'grouped',  label: __( 'Grouped',  'woocommerce-call-for-price' ), isVariable: false },
	{ key: 'external', label: __( 'External', 'woocommerce-call-for-price' ), isVariable: false },
];

export default function ProductTypes() {
	const productTypes = getProductTypes();
	const [ active, setActive ] = useState( productTypes[ 0 ] );

	return (
		<VStack spacing={ 4 }>
			{ /* ── Page heading ── */ }
			<VStack spacing={ 1 }>
				<Heading level={ 3 } style={ { margin: 0 } }>{ __( 'Product Types', 'woocommerce-call-for-price' ) }</Heading>
				<Text style={ { color: '#646970' } }>
					{ __( 'Configure call for price settings for each product type. ', 'woocommerce-call-for-price' ) }
					<ExternalLink href="https://www.tychesoftwares.com/products/woocommerce-call-for-price-plugin/?utm_source=cfplite&utm_medium=notice&utm_campaign=upgrade">
						{ __( 'Upgrade to Pro', 'woocommerce-call-for-price' ) }
					</ExternalLink>
					{ __( ' to change default texts except for single product page texts.', 'woocommerce-call-for-price' ) }
				</Text>
			</VStack>

			{ /* ── Sub-tab bar — mirrors PGBF gateway tab pattern ── */ }
			<div style={ {
				display     : 'flex',
				flexWrap    : 'wrap',
				borderBottom: '1px solid #ddd',
				marginBottom: '-1px',
			} }>
				{ productTypes.map( ( type ) => {
					const isActive = active.key === type.key;
					return (
						<button
							key={ type.key }
							type="button"
							onClick={ () => setActive( type ) }
							className={ `cfp-pro-tab${ isActive ? ' is-active' : '' }` }
							style={ {
								background  : 'none',
								borderTop   : 'none',
								borderRight : 'none',
								borderLeft  : 'none',
								marginBottom: '-1px',
								cursor      : 'pointer',
							} }
						>
							{ type.label }
						</button>
					);
				} ) }
			</div>

			{ /* ── Active product type settings ── */ }
			{ /* key prop forces remount when type changes, resetting the form */ }
			<ProductTypeScreen
				key={ active.key }
				typeKey={ active.key }
				label={ active.label + ' ' + __( 'Products', 'woocommerce-call-for-price' ) }
				isVariable={ active.isVariable }
			/>
		</VStack>
	);
}
