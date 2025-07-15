'use client';

import { ClerkLoading, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { Clock10, DotIcon, Loader } from 'lucide-react';
import Link from 'next/link';

interface RoleBasedNavbarProps {
    userRole?: string; // or UserRole direct
}

const RoleBasedNavbar = ({ userRole }: RoleBasedNavbarProps) => {
    const getNavLinks = (role?: string) => {
        switch (role) {
            case 'admin':
                return (
                    <>
                        <Link href="/admin">דף הנהלה</Link>
                        <Link href="/admin/students">סטודנטים</Link>
                        <Link href="/admin/kfarim">כפרים</Link>
                        <Link href="/admin/milga">מלגה</Link>
                    </>
                );
            case 'rakaz':
                return (
                    <>
                        <Link href="/rakaz">דף רכז</Link>
                        <Link href="/rakaz/kfar">הכפר</Link>
                        <Link href="/rakaz/milga">דיווחים ושעות מלגה</Link>
                        <Link href="/rakaz/events">אירועים</Link>
                    </>
                );
            case 'student':
                return (
                    <>
                        <Link href="/student">דף סטודנט</Link>
                        <Link href="/student/schedules">{'לו"ז'}</Link>
                        <Link href="/student/volunteering">התנדבות</Link>
                    </>
                );
            default:
                return null; // Or a general public nav
        }
    };

    return (
        <header className="fixed top-2 z-50 w-[95%] lg:w-[90%] mt-0 lg:mt-4 backdrop-blur-sm bg-white/85 rounded-3xl shadow-lg" dir="rtl">
            <nav className="flex justify-between items-center text-lg font-rubik font-semibold mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 h-16">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/" className="flex gap-2 items-center text-xl font-bold"><Clock10 />דוכס</Link>
                    {/* דוכס - דוחות כפרי סטודנטים */}
                    <div className="space-x-4">
                        <ClerkLoading>
                            <Loader className='animate animate-spin' />
                        </ClerkLoading>
                        <SignedIn>
                            {getNavLinks(userRole)}
                            <UserButton showName>
                                {/* You can pass the content as a component */}
                                <UserButton.UserProfilePage label="Custom Page" url="custom" labelIcon={<DotIcon />}>
                                    <div>
                                        Hello
                                    </div>
                                </UserButton.UserProfilePage>
                            </UserButton>
                        </SignedIn>
                        <SignedOut>
                            <SignInButton mode="modal" >
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                                    Sign In
                                </button>
                            </SignInButton>
                            <Link href="/sign-up" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors">
                                Sign Up
                            </Link>
                        </SignedOut>

                    </div>
                </div>
            </nav>
        </header>
    );
};

export default RoleBasedNavbar;