import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "./ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "./ui/drawer";

export type ServiceCardProps = {
    id: string,
    title: string,
    description: string,
    imageUrl: string,
    chaptersNum: number,
    price: number,
    progress: number | null,
    category: string
}

export default function ServiceCard({
    id,
    title,
    imageUrl,
    chaptersNum,
    description,
    price,
    category
}: ServiceCardProps) {
    const [open, setOpen] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)"); // Detect if the user is on a desktop

    return (
        <Card
            key={id}
            className="transform transition-all duration-300 hover:shadow-cyan-500/50 hover:shadow-2xl hover:scale-105 rounded-lg overflow-hidden"
        >
            <CardHeader>
                <div className="relative aspect-video w-full overflow-hidden rounded-md">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="object-cover transition-transform duration-300 ease-in-out transform hover:scale-110 hover:shadow-inner"
                    />
                </div>
                <CardTitle className="flex flex-row justify-between items-center mt-4">
                    <span className="font-bold font-assistant text-xl">{title}</span>
                    <Badge
                        variant={"secondary"}
                        className="text-sm font-medium bg-gray-100 text-gray-800 transform transition-colors duration-300 hover:bg-cyan-500 hover:text-white"
                    >
                        {chaptersNum} שיעורים
                    </Badge>
                </CardTitle>
            </CardHeader>

            <CardFooter className="flex flex-row justify-between items-center mt-4">
                {isDesktop ? (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-sky-500 font-heebo text-white hover:bg-cyan-600 transition-colors duration-300 ease-in-out px-4 py-2 rounded-md">
                                פרטים נוספים
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] p-8" dir="rtl">
                            <Card>
                                <CardHeader className="flex flex-col items-center">
                                    <CardTitle className="text-center text-xl">{title}</CardTitle>
                                    <div className="flex gap-2">
                                        <Badge
                                            variant={"secondary"}
                                            className="text-sm font-medium bg-gray-100 text-gray-800 transform transition-colors duration-300 hover:bg-cyan-500 hover:text-white"
                                        >
                                            {chaptersNum} שיעורים
                                        </Badge>
                                        <Badge className="text-sm font-medium bg-sky-100 text-sky-800 transform transition-colors duration-300 hover:bg-cyan-500 hover:text-white"
                                        >
                                            בסיסי
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>{description}</CardDescription>
                                </CardContent>
                                <CardFooter>
                                    <ul className="list-disc list-inside">
                                        <Badge
                                            variant={"outline"}
                                            className="text-sm select-none border-gray-300 font-rubik font-normal text-gray-700"
                                        >
                                            {category}
                                        </Badge>
                                    </ul>
                                </CardFooter>
                            </Card>
                            <div className="flex flex-row gap-2 w-full">
                                <NavLink to="/" className="w-full">
                                    <Button className="bg-emerald-600 hover:bg-emerald-800">
                                        רכישת הקורס - {price} ש"ח
                                    </Button>
                                </NavLink>
                                <Button asChild className="w-1/2">
                                    <DialogClose>
                                        סגירה
                                    </DialogClose>
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                ) : (
                    <Drawer open={open} onOpenChange={setOpen}>
                        <DrawerTrigger asChild>
                            <Button className="bg-sky-500 font-heebo text-white hover:bg-cyan-600 transition-colors duration-300 ease-in-out px-4 py-2 rounded-md">
                                פרטים נוספים
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent className="p-6" dir="rtl">
                            <Card className="my-4">
                                <CardHeader className="flex flex-col items-center">
                                    <CardTitle className="text-center text-xl">{title}</CardTitle>
                                    <div className="flex gap-2">
                                        <Badge
                                            variant={"secondary"}
                                            className="text-sm font-medium bg-gray-100 text-gray-800 transform transition-colors duration-300 hover:bg-cyan-500 hover:text-white"
                                        >
                                            {chaptersNum} שיעורים
                                        </Badge>
                                        <Badge className="text-sm font-medium bg-sky-100 text-sky-800 transform transition-colors duration-300 hover:bg-cyan-500 hover:text-white"
                                        >
                                            בסיסי
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>{description}</CardDescription>
                                </CardContent>
                                <CardFooter>
                                    <ul className="list-disc list-inside">
                                        <Badge
                                            variant={"outline"}
                                            className="text-sm select-none border-gray-300 font-rubik font-normal text-gray-700"
                                        >
                                            {category}
                                        </Badge>
                                    </ul>
                                </CardFooter>
                            </Card>
                            <div className="flex flex-row gap-2 w-full">
                                <NavLink to="/" className="w-full">
                                    <Button className="bg-emerald-600 hover:bg-emerald-800 w-full">
                                        רכישת הקורס - {price} ש"ח
                                    </Button>
                                </NavLink>
                                <Button asChild className="w-full">
                                    <DrawerClose>
                                        סגירה
                                    </DrawerClose>
                                </Button>
                            </div>
                        </DrawerContent>
                    </Drawer>
                )}

            </CardFooter>
        </Card>
    );
}
