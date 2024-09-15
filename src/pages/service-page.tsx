import ServiceCard from '@/components/service-card';
import { Button } from '@/components/ui/button';
import { getServices } from '@/lib/data';
import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';

function Services() {
    const { data: services, isLoading, error } = useQuery({
        queryKey: ['serviecs'],
        queryFn: getServices
    });

    const mainRef = useRef<HTMLDivElement>(null);

    const scrollToMain = () => {
        if (mainRef.current) {
            mainRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (isLoading) return <div className="text-center py-20">טוען...</div>;
    if (error) return <div className="text-center py-20">התרחשה שגיאה.</div>;

    return (
        <div className="bg-gray-50 flex flex-col w-full min-h-screen">
            <header className="relative bg-gradient-to-br from-blue-600 to-sky-600 text-white">
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src="your-image-url.jpg"
                        alt="Background"
                        className="w-full h-full object-cover opacity-30"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="relative z-10 max-w-4xl mx-auto px-6 py-40 text-center">
                    <h1 className="text-6xl font-rubik font-extrabold mb-6">
                        שירותים מקצועיים ללקוחות פרטיים ועסקיים
                    </h1>
                    <p className="text-2xl font-assistant mb-8">
                        רוצים לבנות ולקדם את העסק שלכם? דידי-טק כאן בשבילכם
                    </p>
                    <Button variant="default" className="font-heebo" size="lg" onClick={scrollToMain}>
                        יאללה, בואו נבנה!
                    </Button>
                </div>
            </header>

            <section className="bg-white py-16" ref={mainRef}>
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-rubik font-bold mb-12 text-center mt-4">
                        השירותים שלנו
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services?.map((course) => (
                            <ServiceCard chaptersNum={0} progress={null} key={course.id} {...course} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Services;
