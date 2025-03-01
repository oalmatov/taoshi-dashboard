// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import '@mantine/core/styles.css';
import './globals.css';

import { ColorSchemeScript, MantineProvider, createTheme, mantineHtmlProps } from '@mantine/core';

export const metadata = {
    title: 'My Mantine app',
    description: 'I have followed setup instructions carefully',
};

const theme = createTheme({
})

export default function RootLayout({
    children,
}: {
        children: React.ReactNode;
    }) {
    return (
        <html lang="en" {...mantineHtmlProps}>
            <head>
                <ColorSchemeScript />
            </head>
            <body>
                <MantineProvider theme={theme}>
                    {children}
                </MantineProvider>
            </body>
        </html>
    );
}
