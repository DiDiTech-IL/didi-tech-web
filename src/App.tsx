import { Github, Globe, Linkedin, Plug2, School, Twitter } from "lucide-react";
import LogoUrl from "./assets/didi_tech_logo.svg";
import ProfileUrl from "./assets/profile.png";
import CTAButton from "./components/cta-button";
import SocialLinks from "./components/social-links";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./components/ui/card";
function App() {
  const socialLinks = [
    { href: "https://x.com/didi_dev_il", label: "Twitter", icon: <Twitter /> },
    { href: "https://www.linkedin.com/in/yedidyanewlander", label: "LinkedIn", icon: <Linkedin /> },
    { href: "https://github.com/didinewlander", label: "GitHub", icon: <Github /> },
  ];

  return (
    <div dir="rtl" className="bg-slate-950 h-min-screen flex flex-col align-middle items-center p-12">
      <div>
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-auto"></div>

        <Card className="bg-transparent font-rubik w-[400px] border-slate-200/20">
          <CardHeader>
            <CardTitle className="text-white text-center flex flex-col items-center">
              <img src={LogoUrl} className="w-fit pl-4" />
              Didi Tech - פיתוח והדרכה
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      <div className="text-center">

        <div className="my-10 flex items-center justify-center">
          <CTAButton> דברו איתי</CTAButton>
        </div>
      </div>
      <div id="hero">
        <Card className="bg-transparent font-assistant sm:w-[400px] md:w-[600px] border-slate-50/10">
          <CardContent className="flex flex-2 text-white">
            <div className="w-2/3 py-4">
              <CardTitle className="text-center flex flex-col items-center font-rubik">
                נעים להכיר
              </CardTitle>
              <p>
                קוראים לי ידידיה נוילנדר, אני מפתח פולסטאק ומדריך מחשבים בעל ניסיון של כ-3 שנים בתחום
              </p>
            </div>
            <img src={ProfileUrl} className="w-1/3 object-cover rounded-full p-4" />
          </CardContent>
          <CardFooter>
            <div className="place-items-end">
              <CTAButton>צרו קשר כדי לגלות עוד</CTAButton>
            </div>
          </CardFooter>
        </Card>
      </div>
      <div className="mt-10">
        <Card className="bg-transparent font-assistant sm:w-[400px] md:w-[600px] border-slate-50/10 p-4">
          <CardContent className="text-white flex flex-3 justify-between gap-4 space-x-4 items-center">
            <div>
              <CardTitle className="text-center flex flex-col items-center font-rubik">
                פיתוח
              </CardTitle>
              <ul className="list-disc py-2">
                <li>פיתוח אתרים ומערכות</li>
                <li>פיתוח שרתים ו-API</li>
                <li>פיתוח אוטומציות (בקרוב)</li>
              </ul>
              <CTAButton type={"link"}>בואו לעבוד איתי</CTAButton>
            </div>
            <div className="shrink-0 bg-slate-200 mt-4 h-[100px] w-[1px]">{'\u00A0'}</div>
            <div >
              <CardTitle className="text-center flex flex-col items-center font-rubik">
                הדרכה
              </CardTitle>
              <ul className="list-disc py-2">
                <li>פיתוח פולסטאק ב-MERN ו-Next.js</li>
                <li>עבודה עם כלי Deploy וענן</li>
                <li>מגוון קורסים דיגיטליים</li>
              </ul>
              <CTAButton type={"link"}>להרשמה ופרטים נוספים</CTAButton>

            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-between w-full px-20 m-4">
        <div className="rounded-full p-6 w-20 h-20 bg-red-300 flex justify-center "><Globe /></div>
        <div className="rounded-full p-6 w-20 h-20 bg-green-300  flex justify-center"><Plug2 /></div>
        <div className="rounded-full p-6 w-20 h-20 bg-blue-300  flex justify-center"><School /></div>
      </div>
      <SocialLinks links={socialLinks} />
    </div>

  );
}

export default App;
