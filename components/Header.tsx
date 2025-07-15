'use client';

import { ClerkLoading, SignedIn, UserButton, useUser, OrganizationSwitcher } from '@clerk/nextjs';
import { GaugeCircle, Loader } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
    const { user } = useUser();
    return (
        <header className="p-4 shadow-md" dir='rtl'>
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold font-heebo hover:text-gray-300 transition-colors">
                    דוּכּס - דוחות כפרי סטודנטים
                </Link>
                <nav className="flex items-center space-x-4 gap-4">
                    <ClerkLoading>
                        <Loader className='animate animate-spin' />
                    </ClerkLoading>
                    <SignedIn>
                        {/* Organization Switcher for Multi-Tenant Support */}
                        <OrganizationSwitcher
                            appearance={{
                                elements: {
                                    organizationSwitcherTrigger: "border border-gray-300 rounded-md px-3 py-2 text-sm",
                                    organizationPreview: "gap-2"
                                }
                            }}
                            hidePersonal={true}
                            afterSelectOrganizationUrl={(org) => `https://${org.slug}.${window.location.hostname.replace(/^[^.]+\./, '')}`}
                            afterCreateOrganizationUrl={(org) => `https://${org.slug}.${window.location.hostname.replace(/^[^.]+\./, '')}`}
                        />
                        
                        <UserButton showName>
                            {user?.publicMetadata.role === "ADMIN" &&
                                <UserButton.MenuItems>
                                    <UserButton.Link href="/settings" label="הגדרות מערכת" labelIcon={<GaugeCircle size={14} />} />
                                </UserButton.MenuItems>}
                        </UserButton>
                    </SignedIn>
                </nav>
            </div>
        </header>
    );
}