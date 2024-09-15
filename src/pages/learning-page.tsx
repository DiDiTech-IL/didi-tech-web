import CourseCard from '@/components/course-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCourses } from '@/lib/data';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader } from 'lucide-react'; // Loader for the spinner
import { useRef, useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce'; // Import debounce hook

function Learning() {
  const { data: courses, isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false); // Track if the user is typing
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // Debounce the search input
  const [filteredCourses, setFilteredCourses] = useState(courses || []);

  const mainRef = useRef<HTMLDivElement>(null);

  const scrollToMain = () => {
    if (mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (searchQuery) {
      setIsSearching(true);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedSearchQuery) {
      setIsSearching(false);
    }

    if (debouncedSearchQuery && courses) {
      setFilteredCourses(
        courses.filter((course) =>
          course.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          course.category.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          course.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredCourses(courses || []);
    }
  }, [debouncedSearchQuery, courses]);

  if (isLoading) return <div className="text-center py-20">טוען...</div>;
  if (error) return <div className="text-center py-20">התרחשה שגיאה.</div>;

  return (
    <div className="bg-gray-50 flex flex-col w-full min-h-screen">
      <header className="relative bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
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
            ללמוד פיתוח בפשטות ובבהירות
          </h1>
          <p className="text-2xl font-assistant mb-8">
            הצטרפו לתוכניות הלימוד השונות שיעניקו לכם יתרון משמעותי בעולם התוכנה
          </p>
          <Button variant="default" className="font-heebo" size="lg" onClick={scrollToMain}>
            יאללה, בואו נלמד
          </Button>
        </div>
      </header>

      <section className="bg-white py-16" ref={mainRef}>
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-rubik font-bold mb-12 text-center mt-4">
            הקורסים שלנו
          </h2>

          <div className="flex flex-col w-full md:flex-row items-center justify-center mb-12">
            <div className="relative w-full md:w-auto">

              {isSearching ? (
                <Loader className="absolute left-3 top-3 h-4 w-4 text-slate-600 animate-spin" />
              ) : (
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
              )}
              <Input
                onChange={(e) => setSearchQuery(e.target.value)}
                value={searchQuery}
                className="w-full md:w-[300px] rounded-full bg-slate-100 pl-9 focus-visible:ring-slate-200"
                placeholder="חפש קורס"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses?.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Learning;
