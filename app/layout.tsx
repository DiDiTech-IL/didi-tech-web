import { type Metadata } from 'next';
import { Assistant, Heebo, Inter, Rubik, Source_Code_Pro } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ["latin"] });
const heeboFont = Heebo({ variable: "--font-heebo", weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] });
const assistantFont = Assistant({ variable: "--font-assistant", weight: ['200', '300', '400', '500', '600', '700', '800'], subsets: ['latin'] });
const rubikFont = Rubik({ variable: "--font-rubik", weight: ['300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] });
const sourceCodeFont = Source_Code_Pro({ variable: "--font-code-mono", weight: '400', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'תכלס.Dev - פיתוח טכנולוגי בול בשבילך',
  description: 'חברת פיתוח אפליקציות ישראלית המתמחה בפתרונות מעשיים לעסקים. אפליקציות אינטרנט, מובייל ומערכות צד שרת.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    
      <html lang="he">
        <body dir="rtl" className={`${inter.className} ${heeboFont.variable} ${assistantFont.variable} ${rubikFont.variable} ${sourceCodeFont.variable} antialiased`}>
          {children}
        </body>
      </html>
   
  )
}