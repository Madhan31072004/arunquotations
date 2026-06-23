import { Platform } from 'react-native';

// API Configuration
const DEV_API_URL = Platform.select({
  web: 'http://localhost:5000/api',
  android: 'http://10.0.2.2:5000/api',
  ios: 'http://localhost:5000/api',
  default: 'http://localhost:5000/api',
});

export const API_URL = DEV_API_URL;

// App constants
export const APP_NAME = 'Arun Quotations';
export const APP_TAGLINE = 'Professional Interior Design Estimates';
export const APP_VERSION = '1.0.0';

// Quotation number prefix
export const QUOTATION_PREFIX = 'AQ';

// Material categories
export const MATERIAL_CATEGORIES = [
  'Plywood',
  'Laminate',
  'Veneer',
  'Hardware',
  'Glass',
  'Paint',
  'Tile',
  'Granite',
  'Marble',
  'Fabric',
  'Wallpaper',
  'Electrical',
  'Plumbing',
  'Furniture',
  'Accessories',
  'Labour',
  'Other',
] as const;

// Unit types
export const UNIT_TYPES = [
  'sq.ft',
  'running ft',
  'nos',
  'kg',
  'set',
  'lot',
  'per unit',
  'lump sum',
] as const;

// Room/Area templates
export const AREA_TEMPLATES = [
  'Master Bedroom',
  'Bedroom 2',
  'Bedroom 3',
  'Living Room',
  'Kitchen',
  'Dining Room',
  'Bathroom',
  'Foyer / Entrance',
  'Balcony',
  'Pooja Room',
  'Study Room',
  'Walk-in Closet',
  'Utility Room',
  'Guest Room',
  'Custom',
] as const;

// Tax types
export const TAX_TYPES = [
  { label: 'No Tax', value: 'none', rate: 0 },
  { label: 'GST 5%', value: 'gst5', rate: 5 },
  { label: 'GST 12%', value: 'gst12', rate: 12 },
  { label: 'GST 18%', value: 'gst18', rate: 18 },
  { label: 'GST 28%', value: 'gst28', rate: 28 },
  { label: 'Custom', value: 'custom', rate: 0 },
] as const;

// Quotation statuses
export const QUOTATION_STATUSES = {
  draft: { label: 'Draft', color: '#64748B' },
  sent: { label: 'Sent', color: '#3B82F6' },
  approved: { label: 'Approved', color: '#10B981' },
  rejected: { label: 'Rejected', color: '#EF4444' },
  revised: { label: 'Revised', color: '#F59E0B' },
} as const;

// Currency
export const CURRENCY = {
  symbol: '₹',
  code: 'INR',
  locale: 'en-IN',
};
