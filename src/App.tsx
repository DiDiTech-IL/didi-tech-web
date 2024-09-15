import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import bgimage from "./assets/44009.jpg";
import Content from "./components/content";
import Nav from "./components/Nav";
import { Button } from "./components/ui/button";
const queryClient = new QueryClient();


function App() {
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);
  const scrollToMain = () => {
    if (mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const renderHomeContent = () => (
    <section className="w-full h-[100vh] relative overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-50" />
      <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
        <h1 className="mb-4 flex items-center gap-2 text-3xl font-code text-gray-900 dark:text-white md:text-5xl lg:text-6xl bg-white py-6 px-10 rounded-xl animate-slidein300 opacity-0">
          <span className="text-transparent font-bold bg-clip-text bg-gradient-to-r to-emerald-700 from-sky-600">
            DiDi Tech
          </span> is here.
        </h1>
        <p className="max-w-[1000px] flex flex-col text-lg font-normal font-sans border-4 bg-opacity-30 bg-slate-100 p-4 rounded-lg text-center text-gray-800 lg:text-xl dark:text-gray-400 animate-slidein500 opacity-0">
          <span className="p-8 font-code text-2xl"> Here at <b>DiDi Tech </b>we develop products and train developers.</span>
          <span className="p-6"> Our goal is to help CS students graduate with tools for the job market</span>
        </p>

        <Button
          onClick={scrollToMain}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 py-8 text-lg font-sans text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 animate-slidein700 opacity-0"
        >
          Check out what we got
        </Button>
      </div>
    </section>
  );

  return (
    <div className="relative min-h-screen flex flex-col" dir="rtl">
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-b from-slate-200 to-blue-500 z-[-1]"></div>
      <div
        className="absolute top-0 left-0 right-0 bottom-0 bg-cover bg-center opacity-20 z-[-1]"
        style={{ backgroundImage: `url(${bgimage})` }}
      ></div>

      <Nav />
      <QueryClientProvider client={queryClient}>
        <main className="flex flex-col flex-1 font-code mt-18 pt-[4rem]">
          {location.pathname === '/' ? renderHomeContent() : <Outlet />}
          {location.pathname === '/' && <Content ref={mainRef} />}
        </main>

      </QueryClientProvider>
    </div>
  );
}

export default App;