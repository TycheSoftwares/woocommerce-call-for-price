/**
 * src/App.js
 *
 * Root shell — WP Card + icon tab navigation + Routes.
 * Tab order: Dashboard | General | Product Types | Per Product
 */
import {
	Card,
	CardHeader,
	CardBody,
	CardFooter,
	Spinner,
	ExternalLink,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	__experimentalText   as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { useSettings } from './context/SettingsContext';

import Dashboard     from './screens/Dashboard';
import General       from './screens/General';
import ProductTypes  from './screens/ProductTypes';
import PerProduct    from './screens/PerProduct';

// ── SVG icon components ───────────────────────────────────────────────────────

const SVG_PROPS = {
	xmlns         : 'http://www.w3.org/2000/svg',
	width         : 18,
	height        : 18,
	viewBox       : '0 0 24 24',
	fill          : 'none',
	stroke        : 'currentColor',
	strokeWidth   : 2,
	strokeLinecap : 'round',
	strokeLinejoin: 'round',
	style         : { flexShrink: 0 },
};

const IconDashboard = () => (
	<svg { ...SVG_PROPS }>
		<rect width="7" height="9"  x="3"  y="3"  rx="1" />
		<rect width="7" height="5"  x="14" y="3"  rx="1" />
		<rect width="7" height="9"  x="14" y="12" rx="1" />
		<rect width="7" height="5"  x="3"  y="16" rx="1" />
	</svg>
);

const IconSettings = () => (
	<svg { ...SVG_PROPS }>
		<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
		<circle cx="12" cy="12" r="3" />
	</svg>
);

const IconProductTypes = () => (
	<svg { ...SVG_PROPS }>
		<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
		<path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
		<path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
	</svg>
);

const IconTag = () => (
	<svg { ...SVG_PROPS }>
		<path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
		<path d="M7 7h.01" />
	</svg>
);

const IconKey = () => (
	<svg { ...SVG_PROPS }>
		<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
		<path d="m21 2-9.6 9.6" />
		<circle cx="7.5" cy="15.5" r="5.5" />
	</svg>
);

const TABS = [
	{ to: '/',              label: __( 'Dashboard',     'woocommerce-call-for-price' ), Icon: IconDashboard,    end: true },
	{ to: '/general',       label: __( 'General',       'woocommerce-call-for-price' ), Icon: IconSettings               },
	{ to: '/product-types', label: __( 'Product Types', 'woocommerce-call-for-price' ), Icon: IconProductTypes           },
	{ to: '/per-product',   label: __( 'Per Product',   'woocommerce-call-for-price' ), Icon: IconTag                    },
];

export default function App() {
	const { loading } = useSettings();

	return (
		<Card>
			<CardHeader>
				<VStack spacing={ 1 }>
					<Heading level={ 4 }>
						{ __( 'Call for Price', 'woocommerce-call-for-price' ) }
					</Heading>
					<Text>
						{ __( 'Configure call for price settings for your WooCommerce products', 'woocommerce-call-for-price' ) }
					</Text>
				</VStack>
			</CardHeader>

			<CardBody style={ { paddingTop: '0px' } }>
				<VStack>
					{ /* ── Tab navigation ── */ }
					<HStack style={ { borderBottom: '1px solid #e5e5e5', flexWrap: 'wrap' } }>
						<div className="cfp-pro-tabs">
							{ TABS.map( ( { to, label, Icon, end } ) => (
								<NavLink
									key={ to }
									to={ to }
									end={ end }
									className={ ( { isActive } ) =>
										'cfp-pro-tab' + ( isActive ? ' is-active' : '' )
									}
								>
									<Icon />
									<span>{ label }</span>
								</NavLink>
							) ) }
						</div>
					</HStack>

					{ /* ── Screen content — spinner until initial settings load ── */ }
					{ loading ? (
						<div style={ { padding: '60px', textAlign: 'center' } }>
							<Spinner style={ { width: 28, height: 28 } } />
						</div>
					) : (
						<Routes>
							<Route path="/"              element={ <Dashboard    /> } />
							<Route path="/general"       element={ <General      /> } />
							<Route path="/product-types" element={ <ProductTypes /> } />
							<Route path="/per-product"   element={ <PerProduct   /> } />
							<Route path="*"              element={ <Navigate to="/" replace /> } />
						</Routes>
					) }
				</VStack>
			</CardBody>

			<CardFooter justify="center">
				<VStack style={ { padding: '20px 0' } }>
					<HStack justify="center" style={ { marginBottom: '12px' } }>
						<ExternalLink href="https://support.tychesoftwares.com/help/2285384554/">
							{ __( 'Need support?', 'woocommerce-call-for-price' ) }
						</ExternalLink>
						<Text style={ { fontWeight: 'bold' } }>
							{ __( "We're always happy to help you.", 'woocommerce-call-for-price' ) }
						</Text>
					</HStack>
					<HStack justify="center">
						<Text>{ __( 'If this plugin helped you,', 'woocommerce-call-for-price' ) }</Text>
						<ExternalLink href="https://www.tychesoftwares.com/submit-review/">
							{ __( 'please rate it', 'woocommerce-call-for-price' ) }
						</ExternalLink>
						<Text style={ { fontSize: '17px', color: '#FFBA00' } }>★★★★★</Text>
					</HStack>
				</VStack>
			</CardFooter>
		</Card>
	);
}
