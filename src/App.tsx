import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";
import bgimage from "./assets/44009.jpg";
import Nav from "./components/Nav";
const queryClient = new QueryClient();


function App() {

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
          <Outlet />
        </main>
      </QueryClientProvider>
    </div>
  );
}

export default App;