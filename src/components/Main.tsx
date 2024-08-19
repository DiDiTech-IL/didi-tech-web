import { Button } from "./ui/button";

function Main() {
    return (
        <main className="flex flex-col items-center justify-center w-full h-screen text-center select-none font-heebo">
            <h2 className="text-4xl font-extrabold text-white sm:text-6xl">
                Innovating & Training the Future
            </h2>
            <p className="mt-4 text-lg text-white max-w-md">
                At DiDi Tech, we empower the next generation of developers through cutting-edge technology and education.
            </p>
            <div className="mt-8 space-x-4">
                <Button >
                    Get Started
                </Button>
                <Button variant={"link"}>
                    Learn More
                </Button>
            </div>
        </main>
    );
}

export default Main;
