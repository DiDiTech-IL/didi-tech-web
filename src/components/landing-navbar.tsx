import LogoUrl from "../assets/didi_tech_logo.svg"
import { FaGithub, FaLinkedin } from "react-icons/fa"
import { FaSquareXTwitter } from "react-icons/fa6"

function Navbar() {
    return (
        <nav className="mb-20 flex items-center justify-between py-6">
            <div className="flex flex-shrink-0 items-center">
                <img src={LogoUrl} alt="Didi Tech Logo" className="mx-2 w-10" />
            </div>
            <div className="m-4 flex items-center justify-between gap-4 text-2xl">
                <a href="https://www.linkedin.com/in/yedidyanewlander/">
                    <FaLinkedin/>
                </a>
                <a href="https://github.com/didinewlander">
                    <FaGithub />
                </a>
                <a href="https://x.com/didi_dev_il">
                    <FaSquareXTwitter />
                </a>
            </div>
        </nav>
    )
}

export default Navbar