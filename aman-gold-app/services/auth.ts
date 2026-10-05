export type AuthenticationIntent = "login" | "register";

export interface AuthenticationRequest {
  intent: AuthenticationIntent;
  mobile: string;
  name?: string;
  fail?: boolean;
}

export interface AuthenticationResult {
  mobile: string;
  name?: string;
}

/**
 * Local prototype boundary only. This deliberately performs no network request and
 * models no credential, token, OTP, or session mechanism. Replace it only after an
 * authentication provider and policy are approved.
 */
export async function runDemoAuthentication(request: AuthenticationRequest): Promise<AuthenticationResult> {
  await new Promise((resolve) => setTimeout(resolve, 900));
  if (request.fail) throw new Error("AUTH_DEMO_FAILED");
  return { mobile: request.mobile, name: request.name?.trim() || undefined };
}
