import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";
import React, { forwardRef } from "react";
import { Button } from "./ui/button";

// Styles for the social link container
const socialLinkVariants = cva("flex items-center justify-around", {
  variants: {
    variant: {
      horizontal: "flex-row gap-4 md:gap-6 lg:gap-8",
      vertical: "flex-col gap-4 md:gap-6 lg:gap-8",
    },
    spacing: {
      small: "gap-2 md:gap-3 lg:gap-4",
      medium: "gap-4 md:gap-6 lg:gap-8",
      large: "gap-6 md:gap-8 lg:gap-10",
    },
    padding: {
      none: "p-0",
      small: "p-2 md:p-3 lg:p-4",
      medium: "p-4 md:p-6 lg:p-8",
      large: "p-6 md:p-8 lg:p-10",
    },
  },
  defaultVariants: {
    variant: "horizontal",
    spacing: "medium",
    padding: "none",
  },
});

// Type for individual social link
type SocialLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

// Props for the SocialLinks component
type SocialLinksProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
> &
  VariantProps<typeof socialLinkVariants> & {
    links: SocialLink[];
    buttonSize?: "default" | "sm" | "lg" | "icon";
    buttonVariant?:
      | "link"
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost";
  };

// Forward ref component
const SocialLinks = forwardRef<HTMLElement, SocialLinksProps>(
  (
    {
      variant,
      spacing,
      padding,
      buttonSize = "icon",
      buttonVariant = "link",
      className,
      links,
      ...props
    },
    ref
  ) => {
    return (
      <nav
        ref={ref}
        className={cn(
          socialLinkVariants({ variant, spacing, padding }),
          className
        )}
        {...props}
      >
        {links.map((link, index) => (
          <Button
            key={index}
            asChild
            variant={buttonVariant}
            size={buttonSize}
            className="text-foreground hover:text-primary"
          >
            <a href={link.href} className="text-white">
              {link.icon}
            </a>
          </Button>
        ))}
      </nav>
    );
  }
);

// Set display name for better debugging and readability
SocialLinks.displayName = "SocialLinks";

export default SocialLinks;