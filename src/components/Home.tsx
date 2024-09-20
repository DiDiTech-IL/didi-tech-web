import { useRef } from 'react';
import { Button } from './ui/button';

function Home() {
    const mainRef = useRef<HTMLDivElement>(null);
    const scrollToMain = () => {
        if (mainRef.current) {
            mainRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
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
    )
}

export default Home