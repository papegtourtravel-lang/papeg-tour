
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type Currency = "IDR" | "USD" | "EUR";

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

export default function CurrencyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currency, setCurrencyState] = useState<Currency>("IDR");

  useEffect(() => {
    const savedCurrency = localStorage.getItem("papeg-currency");

    if (
      savedCurrency === "IDR" ||
      savedCurrency === "USD" ||
      savedCurrency === "EUR"
    ) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  function setCurrency(newCurrency: Currency) {
    setCurrencyState(newCurrency);
    localStorage.setItem("papeg-currency", newCurrency);
  }

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error(
      "useCurrency harus digunakan di dalam CurrencyProvider"
    );
  }

  return context;
}
