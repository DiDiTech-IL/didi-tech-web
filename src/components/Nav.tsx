import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { ArrowLeft, Heart, HeartPulse, Terminal } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { ListItem } from "./ui/list-item";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
const training: { title: string; href: string; description: string, color: string }[] = [
  {
    title: "תוכנית הארגז",
    href: "/learn/dev-toolbox",
    description:
      "תוכנית פיתוח מוצר מקצה לקצה לג'וניורים ובוגרי תואר.",
    color: "bg-sky-50",
  },
  {
    title: "קורס Fullstack",
    href: "/learn/fullstack",
    description:
      "פיתוח פולסטאק בסביבת web מהבסיס ועד לבניית מוצר מלא",
    color: "bg-sky-50",
  },
  {
    title: "ללמד קוד - בלי באגים",
    href: "/learn/tutorials",
    description:
      "איך ללמד נושאים בקוד ובפיתוח. מתאים לסטודנטים, מורים פרטיים ומרצים.",
    color: "bg-sky-50",
  },
  {
    title: "ללמוד כלי חדש - בלי לקרוס",
    href: "/learn/new-tools",
    description: "עולם הפיתוח משתנה כל הזמן, איך מתמודדים עם זה בשפיות?",
    color: "bg-sky-50",
  }
]

const services: { title: string; href: string; description: string, color: string }[] = [
  {
    title: "פיתוח אתרים",
    href: "/services/web-dev",
    description: "הרמת אתר בהתאמה ובעיצוב אישי מקצה לקצה",
    color: "bg-emerald-50",
  },
  {
    title: "קורסים דיגיטליים",
    href: "/services/online-courses",
    description:
      "הדרכה לבניית קורסים דיגיטליים מקצה לקצה - כולל מערכת למידה ותשלומים",
    color: "bg-emerald-50",
  },
  {
    title: "ייעוץ לינקדאין",
    href: "/services/linkedin",
    description:
      "למצוא עבודה יכול לקחת זמן, בואו לשפר את הפרופיל המקצועי שלכם ב-LinkedIn",
    color: "bg-emerald-50",
  },
  {
    title: "מאמרים מקצועיים",
    href: "/services/articles",
    description: "לא רוצים סרטון? הכל טוב, יש מאמרים, ולא רק על תכנות",
    color: "bg-emerald-50",
  }
]
const navigationMenuTriggerStyle = cva(
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
)
function Nav() {

  return (
    <header dir="rtl" className="fixed top-0 w-full h-18 bg-white dark:bg-gray-800 z-50 shadow-md font-sans px-4 lg:px-6">
      <Alert variant={"destructive"} className="absolute bg-white mx-10 my-20 w-90">
        <HeartPulse className="h-4 w-4" />
        <AlertTitle>שימו לב!</AlertTitle>
        <AlertDescription>
          האתר בבנייה כרגע - אין להתייחס לתוכן האתר
        </AlertDescription>
      </Alert>
      <div className="flex items-center justify-between w-full h-full">
        <Logo />
        <nav className="flex gap-4 sm:gap-6">
          <NavigationMenu dir="rtl">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>דידי-טק</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavLink to="/" className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                      >
                        <NavigationMenuLink asChild>
                          <>
                            <div className="mb-2 mt-4 text-lg font-medium">
                              דידי-טק
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              בית תוכנה להדרכה ופיתוח מקצועיים בזירת האינטרנט. להיות מפתח, כל אחד יכול. לקבל את הכלים והיכולות החזקים והעדכניים בשוק, זה כבר יותר מורכב
                            </p>
                          </>
                        </NavigationMenuLink>
                      </NavLink>
                    </li>
                    <ListItem href="/about" title="אודות" className="bg-amber-50">
                      קצת על דידי-טק ומה עושים פה בתכל'ס
                    </ListItem>
                    <ListItem href="/learn" title="ללמוד לבד - להתמקצע כמו בחברה" className="bg-sky-50">
                      קורסים שיתנו לכם כל מה שתצטרכו כדי להיות ברמה הגבוהה ביותר
                    </ListItem>
                    <ListItem href="/services" title="שירותים מקצועיים ללקוחות ועסקים" className="bg-emerald-50">
                      שירותי בנייה ופיתוח של אתרים, מערכות וכלים לשוק העבודה
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>למידה</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                    {training.map((component) => (
                      <ListItem
                        key={component.title}
                        title={component.title}
                        href={component.href}
                        className={component.color}
                      >
                        {component.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>שירותים</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                    {services.map((component) => (
                      <ListItem
                        key={component.title}
                        title={component.title}
                        href={component.href}
                        className={component.color}
                      >
                        {component.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavLink to="/support">
                  <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "group")}
                  >
                    יצירת קשר
                  </NavigationMenuLink>
                </NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavLink to="/login">
                  <NavigationMenuLink asChild>
                    <Button
                      className="flex items-center gap-1 hover:gap-2 transition-all duration-300 ease-in-out"
                      variant={"outline"}
                    >
                      <span>אזור אישי</span>
                      <ArrowLeft size={16} />
                    </Button>
                  </NavigationMenuLink>
                </NavLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>
      </div>
    </header>
  );
}

export default Nav;
