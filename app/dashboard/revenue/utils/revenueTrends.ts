import { useState, useEffect } from 'react';

interface RevenueTrend {
  amount: number;
  date: string;
  growthRate: number;
}

export function useRevenueTrends(months: number) {
  const [data, setData] = useState<RevenueTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRevenueTrends = async () => {
      try {
        const response = await fetch(`/api/revenue/trends?months=${months}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer test_token`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        setData(json.data || []);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsLoading(false);
      }
    };

    fetchRevenueTrends();
  }, [months]);

  return { data, isLoading, error };
}
