import { Link } from "react-router-dom";

function Error() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-5xl font-bold text-red-600 mb-4">Error Page</h1>
            <p className="text-lg text-gray-700">Sorry, an error occurred.</p>
            <Link to="/" className="text-sm font-medium underline underline-offset-4">
                Go back to home
            </Link>
        </div>
    );
}

export default Error;
