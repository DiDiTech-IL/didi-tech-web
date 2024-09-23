import { Badge } from "./ui/badge"

function Experience() {
    const experiences = [
        {
            year: "2022 - היום",
            role: "מפתח פולסטאק",
            company: "עצמאי",
            description: `עובד בתחום ומלמד את התחום`,
            technologies: [],
        },
    ]
    return (
        <div className="border-b border-slate-800 pb-4">
            <h1 className="my-20 text-center text-4xl font-heebo">ציר הזמן של דידי-טק</h1>
            <div>
                {experiences.map((experience, index) => (
                    <div key={index} className="mb-8 flex flex-wrap items-center lg:justify-center">
                        <div className="w-full lg:w-1/4">
                            <p className="mb-2 text-sm text-slate-400">{experience.year}</p>
                        </div>
                        <div className="w-full max-w-xl lg:w-3/4">
                            <h6 className="mb-2 font-semibold">{experience.role} -{" "}
                                <span className="text-sm text-purple-100">{experience.company}</span>
                            </h6>
                            <p className="mb-4 text-neutral-400">{experience.description}</p>
                            <div className="flex gap-2">
                                {experience.technologies.map((tech, index) => (
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

export default Experience