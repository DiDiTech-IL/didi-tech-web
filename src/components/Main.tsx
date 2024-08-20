import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Airplay, FileText, Hammer } from "lucide-react";
import { forwardRef } from "react";

import { LegacyRef } from "react";

const Main = forwardRef((props, ref: LegacyRef<HTMLElement>) => {
    return (
        <section ref={ref} className="w-full py-12 md:py-24 lg:py-32 bg-muted">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold font-code tracking-tight sm:text-5xl">What we do?</h2>
                        <p className="max-w-[900px] p-4 text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            We offer a wide range of services to help developers and companies succeed.
                        </p>
                    </div>
                </div>
                <div className="mx-auto font-sans grid items-start gap-6 sm:max-w-4xl sm:grid-cols-2 md:gap-8 lg:max-w-5xl lg:grid-cols-3">
                   <Card className="h-[200px]">
                        <CardHeader>
                            <div className="flex flex-row items-center gap-2">
                                <Hammer size={20} />
                                <h3 className="text-lg font-bold font-code">The Developer's Toolbox</h3>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Graduates Bootcamp with comprehensive training programs to upskill your developers.
                            </p>
                        </CardContent>
                        <CardFooter className="flex flex-row justify-between">
                            <Badge className="w-fit" variant="default">In Progress</Badge>

                        </CardFooter>
                    </Card>
                   <Card className="h-[200px]">
                        <CardHeader>
                            <div className="flex flex-row items-center gap-2">
                                <FileText size={20} />
                                <h3 className="text-lg font-bold font-code">LinkedIn & CV Consulting</h3>
                            </div>

                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Sharpen your profile with a one-on-one meeting to help you reach your professional goals.
                            </p>
                        </CardContent>
                        <CardFooter className="flex flex-row justify-between">
                            <Badge className="w-fit" variant="secondary">Soon Available</Badge>
                        </CardFooter>
                    </Card>
                   <Card className="h-[200px]">
                        <CardHeader>
                            <div className="flex flex-row items-center gap-2">
                                <Airplay size={20} />
                                <h3 className="text-lg font-bold font-code">Online Courses</h3>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                A brand new platform with online courses which is now under construction.
                            </p>
                        </CardContent>
                        <CardFooter className="flex flex-row justify-between">
                            <Badge className="w-fit" variant="destructive">In Development</Badge>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </section>
    );
});

export default Main;
