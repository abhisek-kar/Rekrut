interface AppConfig {
  COMPANY_NAME: string;
}

const defaultAppConfig: AppConfig = {
  COMPANY_NAME: "Codekart Solutions Pvt. Ltd.",
};

export const useAppConfig = () => {
  return {
    appConfig: defaultAppConfig,
  };
};
