import About from "./components/about";
import { Contact } from "./components/contact";
import Experience from "./components/experience";
import Hero from "./components/hero";
import Navbar from "./components/landing-navbar";
import { Partners } from "./components/partners";
import Tech from "./components/tech";
import { Testimonials } from "./components/testimonials";
import { TimelineProjects } from "./components/timeline";
function App() {
  return (

    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <About />
      <Tech />
      <Experience />
      <Partners />
      <TimelineProjects />
      <Testimonials />
      <Contact />
    </div>
  )
}

export default App;
