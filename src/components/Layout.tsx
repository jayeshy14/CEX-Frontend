import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col min-h-screen bg-bg">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export default Layout;
