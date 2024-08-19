import Main from "./components/Main";
import Nav from "./components/Nav";

function App() {
  return (
    <div className="relative p-4 md:p-8 lg:p-16">
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-b from-blue-500 to-slate-200 z-[-1]"></div>
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-[url('/path/to/mesh-bg.svg')] opacity-20 z-[-1]"></div>

      <Nav />
      <Main />
    </div>
  );
}

export default App;
