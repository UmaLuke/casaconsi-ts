// src/services/exchangeService.ts

export interface ExchangeRateResponse {
  moneda: string;
  casa: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

export const fetchUsdRate = async (): Promise<number> => {
  try {
    // Usamos el Dólar Blue o MEP como referencia de mercado
    const response = await fetch('https://dolarapi.com/v1/dolares/blue');
    
    if (!response.ok) {
      throw new Error('Error al obtener la cotización');
    }
    
    const data: ExchangeRateResponse = await response.json();
    return data.venta; // Retornamos el valor de venta
    
  } catch (error) {
    console.error('Fallo el servicio de cotización:', error);
    // Retornamos un valor de fallback o disparamos una alerta
    return 1000; 
  }
};