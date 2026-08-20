import { redirect } from 'next/navigation';

export default function OldVouchersRedirect() {
  redirect('/account/groupons');
}
