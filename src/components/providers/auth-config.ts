export type AuthConfiguration = {
  authority?: string;
  clientId?: string;
  convexUrl?: string;
};

export function hasAuthConfiguration(config: AuthConfiguration): boolean {
  const values = [config.authority, config.clientId, config.convexUrl];
  return values.every((value) => {
    if (!value) return false;
    return !/example|localhost|\.local(?:\/|$)/i.test(value);
  });
}
