export const isVideoAvailableByLocation = (
  video: {
    allowed_countries?: VcmsIntegrationCountry[];
    restricted_countries?: VcmsIntegrationCountry[];
  },
  countryCode: string,
): boolean => {
  if (!video) {
    return true;
  }
  const { allowed_countries = [], restricted_countries = [] } = video;
  const allowedCountriesCodes = allowed_countries.map(c => c.code);
  const restrictedCountriesCodes = restricted_countries.map(c => c.code);

  if (allowedCountriesCodes.length) {
    return allowedCountriesCodes.includes(countryCode);
  }
  if (restrictedCountriesCodes.length) {
    return !restrictedCountriesCodes.includes(countryCode);
  }

  return true;
};

interface VcmsIntegrationCountry {
  id: number;
  name: string;
  code: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}
