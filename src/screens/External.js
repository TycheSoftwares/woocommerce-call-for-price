/**
 * src/screens/External.js
 */
import { __ } from '@wordpress/i18n';
import ProductTypeScreen from '../components/ProductTypeScreen';

export default function External() {
	return (
		<ProductTypeScreen
			typeKey="external"
			label={ __( 'External Products', 'woocommerce-call-for-price' ) }
			isVariable={ false }
		/>
	);
}
