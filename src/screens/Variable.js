/**
 * src/screens/Variable.js
 */
import { __ } from '@wordpress/i18n';
import ProductTypeScreen from '../components/ProductTypeScreen';

export default function Variable() {
	return (
		<ProductTypeScreen
			typeKey="variable"
			label={ __( 'Variable Products', 'woocommerce-call-for-price' ) }
			isVariable={ true }
		/>
	);
}
