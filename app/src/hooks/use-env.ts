const env = import.meta.env;

// TODO: apply Joy or Envalid or similar

export const useEnv = () => {
  return {
    isDev: env.MODE === "development",
  };
};
