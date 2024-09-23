import { Button } from "./ui/button"

const CTAButton: React.FC<{ children: React.ReactNode, type?: string | null }> = ({ children, type = null }) => {

    return (
        <Button asChild variant={type ? type : "gooeyRight"} className={` ${type && "text-white"} transition-all duration-300 hover:bg-primary/70 hover:ring-2 hover:ring-primary/70 hover:ring-offset-1 z-10`}>
            <a href="mailto:yedidya@didi-tech.com">
                {children}
            </a>
        </Button>
    )
}


export default CTAButton;