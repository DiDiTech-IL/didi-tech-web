import project1 from "../assets/44009.jpg"
import project2 from "../assets/Leonardo_Phoenix_A_dazzling_3D_toolbox_shines_with_popular_tec_2.jpg"
import { Badge } from "./ui/badge";
function Projects() {
    const projects = [{
        title: "מערכת למידה דיגיטלית",
        image: project1,
        description:
            "בהזדמנות אספר וארחיב",
        technologies: [],
    },
    {
        title: "בוט ללינקדאין",
        image: project2,
        description:
            "חשבתי שזה מגניב, אז עשיתי את זה",
        technologies: [],
    }];
    return (
        <div className="border-b border-slate-800 pb-24" dir="rtl" >
            <h1 className="my-20 text-center text-4xl font-heebo">מהפרויקטים שנבנו בדידי-טק</h1>

            <div dir="rtl" >

                {projects.map((project, index) => (
                    <div className="mb-8 flex flex-wrap lg:justify-center text-right" key={index}>
                        <div className="w-full lg:w-1/4">
                            <img className="w-36 h-36 object-cover mb-6 rounded" src={project.image} alt={project.title} />
                        </div>
                        <div className="w-full max-w-xl lg:w-3/4 text-right" dir="rtl" >
                            <h6 className="mb-2 font-semibold">{project.title}</h6>
                            <p className="mb-4 text-neutral-400">{project.description}</p>
                            <div className="flex gap-2" dir="rtl" >
                                {project.technologies.map((tech, index) => (
                                    <Badge key={tech + index}>{tech}</Badge>
                                ))}
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    )
}

export default Projects


import React from 'react';
import { motion } from 'framer-motion';

const partners = [
    {
        name: 'Microsoft',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
        link: 'https://microsoft.com'
    },
    {
        name: 'Amazon Web Services',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
        link: 'https://aws.amazon.com'
    },
    {
        name: 'Google Cloud',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg',
        link: 'https://cloud.google.com'
    },
    {
        name: 'MongoDB',
        logo: 'https://webimages.mongodb.com/_com_assets/cms/mongodb_logo1-76twgcu2dm.png',
        link: 'https://mongodb.com'
    },
    {
        name: 'Vercel',
        logo: 'https://assets.vercel.com/image/upload/front/assets/design/vercel-triangle-black.svg',
        link: 'https://vercel.com'
    }
];

export const Partners: React.FC = () => {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-4xl font-bold mb-4">Trusted Partners</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Working with industry leaders to deliver enterprise-grade solutions.
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center">
                    {partners.map((partner, index) => (
                        <motion.a
                            key={partner.name}
                            href={partner.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full max-w-[200px] h-20 relative group"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className="absolute inset-0 flex items-center justify-center">
                                <img
                                    src={partner.logo}
                                    alt={partner.name}
                                    className="max-h-full max-w-full object-contain filter grayscale opacity-50 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100"
                                />
                            </div>
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );
};