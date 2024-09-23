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
        <div className="border-b border-slate-800 pb-24">
            <h1 className="my-20 text-center text-4xl font-heebo">מהפרויקטים שנבנו בדידי-טק</h1>

            <div>
                {projects.map((project, index) => (
                    <div className="mb-8 flex flex-wrap lg:justify-center" key={index}>
                        <div className="w-full lg:w-1/4">
                            <img className="w-36 h-36 object-cover mb-6 rounded" src={project.image} alt={project.title} />
                        </div>
                        <div className="w-full max-w-xl lg:w-3/4">
                            <h6 className="mb-2 font-semibold">{project.title}</h6>
                            <p className="mb-4 text-neutral-400">{project.description}</p>
                            <div className="flex gap-2">
                                {project.technologies.map((tech, index) => (
                                    <Badge key={tech+index}>{tech}</Badge>
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