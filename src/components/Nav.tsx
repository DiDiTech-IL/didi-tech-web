import { Menu, Search, User } from 'lucide-react';

function Nav() {
    return (
        <nav className="flex items-center justify-between w-full py-4 text-white font-assistant text-xl" >
            <div className="flex items-center cursor-pointer">
                <h1 className="mb-4 text-xl font-extrabold text-gray-900 dark:text-white md:text-2xl lg:text-3xl bg-white p-2 rounded-lg">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400 font-assistant">DiDi-Tech | דידי-טק</span></h1>

            </div>

            <div className="hidden md:flex gap-6 items-center" dir='rtl'>
                <a href="#services" className="text-white hover:text-gray-200">שירותים</a>
                <a href="#pricing" className="text-white hover:text-gray-200">מחירים</a>
                <a href="#about" className="text-white hover:text-gray-200">אודות ויצירת קשר</a>
            </div>

            <div className="flex items-center space-x-4">
                <Search className="w-6 h-6 text-white cursor-pointer hover:text-gray-200" />
                <User className="w-8 h-8 p-1 text-white bg-emerald-700 rounded-full cursor-pointer hover:bg-emerald-600" />
                <Menu className="w-6 h-6 text-white cursor-pointer md:hidden hover:text-gray-200" />
            </div>
        </nav>
    );
}

export default Nav;
