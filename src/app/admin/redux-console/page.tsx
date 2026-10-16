import type { Metadata } from 'next';
import { ReduxFormConsole } from '../../../components/admin/ReduxFormConsole';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Form Console' };

export default function AdminReduxConsolePage() {
  return <ReduxFormConsole />;
}
