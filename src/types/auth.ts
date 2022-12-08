export interface IAuthSession {
  user_id: string;
  profile_id: string;
  email: string;
  role: string;
  cert_thumbprint: string;
  cert_status: string;
}
