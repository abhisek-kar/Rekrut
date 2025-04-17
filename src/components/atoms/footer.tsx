"use client";

import { FC } from "react";
import { useAppConfig } from "@/hooks/useAppConfig";

interface FooterProps {
  className?: string;
  showCopyright?: boolean;
  showCompanyName?: boolean;
  showYear?: boolean;
  additionalText?: string;
}

const Footer: FC<FooterProps> = ({
  className = "",
  showCopyright = true,
  showCompanyName = true,
  showYear = true,
  additionalText = "All rights reserved.",
}) => {
  const { appConfig } = useAppConfig();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`text-center text-xs text-gray-500 ${className}`}>
      {showCopyright && "© "}
      {showYear && `${currentYear} `}
      {showCompanyName && appConfig.COMPANY_NAME}
      {additionalText && ` ${additionalText}`}
    </footer>
  );
};

export default Footer;

export const AppFooter: FC<{ className?: string }> = ({
  className = "mt-6",
}) => {
  return (
    <Footer
      className={className}
      showCopyright={true}
      showCompanyName={true}
      showYear={true}
    />
  );
};
