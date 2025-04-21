import { Inter, Jost } from "next/font/google";
// import { ColorSchemeScript } from '@mantine/core';
import "./globals.css";
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import Providers from "./providers";
import MainHeader from "@/components/header/MainHeader";
import { Grid, GridCol } from "@mantine/core";

const inter = Inter({ 
  variable: "--font-inter",
  subsets: ["latin"],
  // display: "swap",
  // adjustFontFallback: false,
});

const jost = Jost({ 
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300"]
});

export const metadata = {
  title: "MovieRecAI",
  description: "AI movie recommendation tool.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jost.variable}`}>
        <Providers>
          <MainHeader/>
          <Grid gutter={'0px'}>
            <GridCol span={{ base: 0, sm: 1, md: 1, lg: 1 }}/>
            <GridCol span={{ base: 12, sm: 10, md: 10, lg: 10 }}>
              {children}
            </GridCol>
            <GridCol span={{ base: 0, sm: 1, md: 1, lg: 1 }}/>
          </Grid>
        </Providers>
      </body>
    </html>
  );
}
