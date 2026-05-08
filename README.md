# CEX-Frontend

React + Vite frontend for the centralized exchange. Pairs with [CEX-Backend](https://github.com/jayeshy14/CEX-Backend).

---

## Features

- Email + password auth with Google OAuth and password reset flows
- Wallet integration (Solana wallet adapter)
- Trading UI — order book view, place/cancel orders, trade history
- Deposit / withdrawal across the chains the backend supports

## Stack

- React + Vite
- TailwindCSS + shadcn/ui + Material UI primitives
- Framer Motion
- React Router
- `@solana/wallet-adapter-react` for Solana wallet flows
- `@react-oauth/google` for Google sign-in

## Run locally

Prerequisites: Node 20+, the [CEX-Backend](https://github.com/jayeshy14/CEX-Backend) running on `:3000`.

```bash
npm install
npm run dev
```

Defaults to `http://localhost:5173`.

## Project structure

```
src/
├── main.jsx              App entry
├── App.jsx               Root layout
├── Routes.jsx            Route table
├── api/                  Backend client (auth, orders, wallets)
├── components/           Reusable UI (forms, charts, modals, layout)
├── pages/                Route-level pages
├── context/              Auth + global state providers
├── utils/                Helpers (formatters, validation)
└── assets/
```

## License

MIT
