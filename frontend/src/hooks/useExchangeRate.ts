// src/hooks/useExchangeRate.ts
import { useState, useEffect } from 'react';
import { fetchUsdRate } from '../services/exchangeService';

export const useExchangeRate = () => {
  const [rate, setRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getRate = async () => {
      setIsLoading(true);
      try {
        const currentRate = await fetchUsdRate();
        setRate(currentRate);
      } catch (err) {
        setError('No se pudo cargar la cotización actual.');
      } finally {
        setIsLoading(false);
      }
    };

    getRate();
    // Podríamos agregar un setInterval aquí para actualizar cada X horas
  }, []);

  return { rate, isLoading, error };
};