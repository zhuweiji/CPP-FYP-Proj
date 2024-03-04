import { useCallback } from "react";

export const useCapitalizer = () => {
  const capitalizeWords = useCallback((text) => {
    return text
      .split(" ")
      .map((word) => {
        return word[0].toUpperCase() + word.substring(1);
      })
      .join(" ");
  }, []);

  return { capitalizeWords };
};
