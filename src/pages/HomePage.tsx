import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, ArrowRight } from 'lucide-react';
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

const HomePage = () => {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = (await fetchCryptocurrencies()) as FetchResponse;
        if (data.status === 'success' && data.data?.cryptocurrencies) {
          setCryptos(data.data.cryptocurrencies.slice(0, 10));
        }
      } catch {
        // silent — table stays empty
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <div className="bg-bg">
      {/* Hero */}
      <section className="bg-gradient-to-b from-bg-surface to-bg border-b border-border">
        <div className="max-w-screen-xl mx-auto px-6 py-24 flex flex-col items-center text-center gap-6">
          <div className="flex items-center gap-2 bg-accent-muted border border-accent/20 rounded-full px-4 py-1.5 text-accent text-xs font-semibold">
            <TrendingUp size={13} />
            Live markets · 13 assets · 4 chains
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-text-primary leading-tight tracking-tight">
            Trade Crypto with<br />
            <span className="text-accent">Confidence</span>
          </h1>
          <p className="text-text-secondary text-xl max-w-xl">
            Fast. Secure. Non-custodial exchange with real-time order books and professional charts.
          </p>
          <div className="flex items-center gap-4 mt-2">
            <Link
              to="/cryptocurrencies"
              className="bg-accent hover:bg-accent-hover text-bg font-semibold px-8 py-3 rounded-xl transition-colors flex items-center gap-2"
            >
              Start Trading <ArrowRight size={16} />
            </Link>
            <Link
              to="/cryptocurrencies"
              className="border border-border hover:border-border-light text-text-primary font-medium px-8 py-3 rounded-xl transition-colors"
            >
              View Markets
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-border bg-bg-surface">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex gap-10 overflow-x-auto">
          {[
            { label: 'Assets Listed', value: '13' },
            { label: 'Supported Chains', value: '4' },
            { label: 'Order Types', value: 'Limit + Market' },
            { label: 'Settlement', value: 'On-chain' },
          ].map((s) => (
            <div key={s.label} className="shrink-0">
              <p className="text-text-muted text-xs">{s.label}</p>
              <p className="text-text-primary font-semibold text-sm">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Markets table */}
      <section className="max-w-screen-xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-text-primary font-semibold text-xl">Top Markets</h2>
          <Link to="/cryptocurrencies" className="text-accent text-sm hover:underline flex items-center gap-1">
            View all <ArrowRight size={13} />
          </Link>
        </div>

        <div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-elevated text-text-secondary text-xs uppercase">
                <th className="px-6 py-3 text-left">#</th>
                <th className="px-6 py-3 text-left">Asset</th>
                <th className="px-6 py-3 text-right">Price</th>
                <th className="px-6 py-3 text-right">24h Change</th>
                <th className="px-6 py-3 text-right">Trade</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-t border-border">
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-bg-elevated rounded animate-pulse w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : cryptos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                    No market data available
                  </td>
                </tr>
              ) : (
                cryptos.map((c, i) => {
                  const isStable = c.symbol === 'USDT' || c.symbol === 'USDC';
                  return (
                    <tr
                      key={c._id}
                      className="border-t border-border hover:bg-bg-elevated/50 transition-colors cursor-pointer"
                      onClick={() => !isStable && navigate(`/token/${c.symbol}/USDT`)}
                    >
                      <td className="px-6 py-4 text-text-muted">{i + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-xs font-bold text-accent">
                            {c.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-text-primary font-medium">{c.name}</p>
                            <p className="text-text-muted text-xs">{c.symbol}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-text-primary">
                        ${c.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: c.current_price < 0.01 ? 8 : 2 })}
                      </td>
                      <td className="px-6 py-4 text-right text-text-muted font-mono text-xs">—</td>
                      <td className="px-6 py-4 text-right">
                        {isStable ? (
                          <span className="text-text-muted text-xs">—</span>
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
