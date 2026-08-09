let oauthToken: string | null = null;

export function setOAuthToken(token: string | null): void {
  oauthToken = token;
}

export function getOAuthToken(): string | null {
  return oauthToken;
}

export function consumeOAuthToken(): string | null {
  const token = oauthToken;
  oauthToken = null;
  return token;
}