import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { fetchCryptocurrencies } from '../api/cryptocurrencies';

interface Crypto {
  _id: string;
  name: string;
  symbol: string;
  current_price: number;
}

interface FetchResponse {
  status: string;
  data?: { cryptocurrencies: Crypto[] };
}

const CryptocurrenciesPage = () => {
  const navigate = useNavigate();
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = (await fetchCryptocurrencies()) as FetchResponse;
        if (data.status === 'success' && data.data?.cryptocurrencies) {
          setCryptos(data.data.cryptocurrencies);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const filtered = cryptos.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.symbol.toLowerCase().includes(query.toLowerCase())
  );

  const isStable = (symbol: string) => symbol === 'USDT' || symbol === 'USDC';

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Markets</h1>
          <p className="text-text-secondary text-sm mt-0.5">{cryptos.length} assets available</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search asset..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-bg-elevated border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent w-64 transition-colors"
          />
        </div>
      </div>

      <div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bg-elevated text-text-secondary text-xs uppercase tracking-wide">
              <th className="px-6 py-3 text-left">#</th>
              <th className="px-6 py-3 text-left">Asset</th>
              <th className="px-6 py-3 text-right">Price (USD)</th>
              <th className="px-6 py-3 text-right">24h</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-t border-border">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-bg-elevated rounded animate-pulse w-28" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-text-muted">
                  No assets match &ldquo;{query}&rdquo;
                </td>
              </tr>
            ) : (
              filtered.map((c, i) => (
                <tr
                  key={c._id}
                  onClick={() => !isStable(c.symbol) && navigate(`/token/${c.symbol}/USDT`)}
                  className="border-t border-border hover:bg-bg-elevated/50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-text-muted">{i + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-bg-elevated flex items-center justify-center text-xs font-bold text-accent shrink-0">
                        {c.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-text-primary font-medium">{c.name}</p>
                        <p className="text-text-muted text-xs">{c.symbol}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-text-primary">
                    ${c.current_price < 0.01
                      ? c.current_price.toFixed(8)
                      : c.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right text-text-muted font-mono text-xs">—</td>
                  <td className="px-6 py-4 text-right">
                    {isStable(c.symbol) ? (
                      <span className="text-text-muted text-xs">Stable</span>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/token/${c.symbol}/USDT`); }}
                        className="bg-accent-muted text-accent hover:bg-accent hover:text-bg text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Trade
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CryptocurrenciesPage;
