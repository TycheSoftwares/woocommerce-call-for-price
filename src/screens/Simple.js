/**
 * src/screens/Simple.js
 */
import { __ } from '@wordpress/i18n';
import ProductTypeScreen from '../components/ProductTypeScreen';

export default function Simple() {
	return (
		<ProductTypeScreen
			typeKey="simple"
			label={ __( 'Simple Products', 'woocommerce-call-for-price' ) }
			isVariable={ false }
		/>
	);
}
