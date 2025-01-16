import { BiLogoPostgresql } from "react-icons/bi";
import { DiGit, DiNpm } from "react-icons/di";
import { FaAws, FaDocker, FaNodeJs, FaReact } from "react-icons/fa";
import { IoLogoVercel } from "react-icons/io5";
import { SiExpress, SiGooglecloud, SiMongodb, SiReactquery, SiReactrouter, SiShadcnui, SiTailwindcss, SiVite } from "react-icons/si";
import { TbBrandCpp, TbBrandNextjs, TbBrandPrisma, TbBrandPython } from "react-icons/tb";
import { OrbitingCircles } from './orbiting-circles';
function Tech() {

    const allIcons = [
        // Front End
        { Icon: FaReact, color: "text-cyan-400" },
        { Icon: SiVite, color: "text-purple-600" },
        { Icon: TbBrandNextjs, color: "text-slate-200" },
        { Icon: SiTailwindcss, color: "text-sky-500" },
        { Icon: SiReactrouter, color: "text-red-500" },
        { Icon: SiReactquery, color: "text-pink-600" },
        { Icon: SiShadcnui, color: "text-slate-100" },

        // Back End
        { Icon: FaNodeJs, color: "text-green-600" },
        { Icon: SiExpress, color: "text-slate-300" },
        { Icon: TbBrandCpp, color: "text-blue-800" },
        { Icon: TbBrandPython, color: "text-yellow-800" },

        // Databases
        { Icon: SiMongodb, color: "text-green-500" },
        { Icon: BiLogoPostgresql, color: "text-blue-600" },
        { Icon: TbBrandPrisma, color: "text-blue-300" },

        // Cloud & DevOps
        { Icon: IoLogoVercel, color: "text-slate-300" },
        { Icon: FaAws, color: "text-orange-500" },
        { Icon: SiGooglecloud, color: "text-blue-400" },
        { Icon: FaDocker, color: "text-blue-600" },
        { Icon: DiGit, color: "text-orange-600" },
        { Icon: DiNpm, color: "text-red-600" },

    ];

    const layer1 = allIcons.slice(0, 7);  // Front End
    const layer2 = allIcons.slice(7, 14); // Back End & Databases
    const layer3 = allIcons.slice(14);    // Cloud & DevOps


    return (
        <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 py-16">
            <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-teal-400 to-sky-100 font-heebo bg-clip-text text-transparent mb-12 z-10 drop-shadow-[0_0px_8px_rgba(0,0,0,1)]">
                בין הטכנולוגיות שמשתמשים בהן פה בדידי-טק
            </h1>

            {/* Orbiting Circles */}
            <OrbitingCircles iconSize={40}>
                {layer1.map(({ Icon, color }, index) => (
                    <Icon key={index} className={`w-8 h-8 ${color}`} />
                ))}
            </OrbitingCircles>
            <OrbitingCircles iconSize={40} radius={120} reverse speed={1}>
                {layer2.map(({ Icon, color }, index) => (
                    <Icon key={index} className={`w-8 h-8 ${color}`} />
                ))}
            </OrbitingCircles>
            <OrbitingCircles iconSize={40} radius={220} speed={1}>
                {layer3.map(({ Icon, color }, index) => (
                    <Icon key={index} className={`w-8 h-8 ${color}`} />
                ))}
            </OrbitingCircles>
        </div>
    );
}

export default Tech;