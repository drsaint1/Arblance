import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Web3Provider } from "@/contexts/Web3Context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 pt-24 flex-grow">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
      <Toaster position="top-right" />
    </Web3Provider>
  );
}
