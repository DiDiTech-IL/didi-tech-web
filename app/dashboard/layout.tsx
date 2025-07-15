import { ClerkProvider } from '@clerk/nextjs';
import NavigationLayout from '@/components/NavigationLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        signIn: {
          elements: {
            headerTitle: {
              fontFamily: "rubik",

            },
            form: {
              fontFamily: "heebo",
            },
            headerSubtitle: {
              visibility: "hidden",
              display: "none",
              fontFamily: "assistant"
            },
            userButtonPopoverFooter: {
              display: "none",
              visibility: "hidden"
            },
            alternativeMethods: {
              font: "heebo"
            },
            footer: {
              display: "none"
            },
            footerActionLink: {
              font: "heebo"
            },
            buttonArrowIcon: {
              transform: "rotate(180deg)"
            }
          },
        },
        userProfile: {
          elements: {
            profileSectionContent__username: {
              cursor: "not-allowed",
              pointerEvents: "none"
            },
            profileSectionPrimaryButton__username: {
              display: "none"
            },
            profileSection__connectedAccounts: {
              display: "none"
            },
            navbar: {
              borderTopLeftRadius: "0px",
              borderTopRightRadius: "0px",
              borderBottomLeftRadius: "0px",
              borderBottomRightRadius: "0px",
            },
            scrollBox: {
              borderTopLeftRadius: "0px",
              borderTopRightRadius: "0px",
              borderBottomLeftRadius: "0px",
              borderBottomRightRadius: "0px",
            },
            navbarButton: {
              display: "flex",
              alignItems: "center",
            },
            navbarButtonIcon: {
              display: "flex",
              justifyItems: "center",
              alignItems: "center",
            }
          },
          variables: {
            fontFamily: "heebo",
            fontFamilyButtons: "rubik",
          }
        }, userButton: {
          variables: {
            fontFamily: "heebo",
            fontFamilyButtons: "rubik",
          }
        }
      }}
    >
      <NavigationLayout>
        {children}
      </NavigationLayout>
    </ClerkProvider>
  );
}
