
import { NavItemType } from '../components/ui/BottomNav';

export const MERCHANDISER_NAV_ITEMS: NavItemType[] = [
    { icon: 'grid', label: 'Overview', route: '/merchandiser/dashboard' },
    { icon: 'list', label: 'Reports', route: '/merchandiser/reports' },
    { icon: 'storefront', label: 'GMS', route: '/merchandiser/gms' },
    { icon: 'flash', label: 'Events', route: '/merchandiser/events' },
    { icon: 'person', label: 'Profile', route: '/merchandiser/profile' },
];

export const SUPERVISOR_NAV_ITEMS: NavItemType[] = [
    { icon: 'grid', label: 'Overview', route: '/supervisor/dashboard' },
    { icon: 'people', label: 'Team', route: '/supervisor/team' },
    { icon: 'storefront', label: 'GMS', route: '/supervisor/gms' },
    { icon: 'calendar', label: 'Planning', route: '/supervisor/planning' },
    { icon: 'person', label: 'Profile', route: '/supervisor/profile' },
];

export const ADMIN_NAV_ITEMS: NavItemType[] = [
    { icon: 'grid', label: 'Overview', route: '/admin/dashboard' },
    { icon: 'people', label: 'Users', route: '/admin/users' },
    { icon: 'storefront', label: 'GSM', route: '/admin/gsm' },
    { icon: 'calendar', label: 'Planning', route: '/admin/planning' },
    { icon: 'person', label: 'Profile', route: '/admin/profile' },
];
