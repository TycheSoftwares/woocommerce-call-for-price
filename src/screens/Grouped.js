/**
 * src/screens/Grouped.js
 */
import { __ } from '@wordpress/i18n';
import ProductTypeScreen from '../components/ProductTypeScreen';

export default function Grouped() {
	return (
		<ProductTypeScreen
			typeKey="grouped"
			label={ __( 'Grouped Products', 'woocommerce-call-for-price' ) }
			isVariable={ false }
		/>
	);
}
