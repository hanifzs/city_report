/**
 * AuthModal / LoginModal Re-export & Adapter
 * Menghubungkan AuthModal dengan LoginModal agar mendukung penamaan fleksibel
 * dan kompatibilitas penuh di seluruh komponen CityReport.
 */

import { LoginModal } from './LoginModal';
import type { LoginModalProps } from './LoginModal';

export const AuthModal = LoginModal;
export type AuthModalProps = LoginModalProps;

export { LoginModal };
export type { LoginModalProps };
export default LoginModal;
