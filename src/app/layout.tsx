import React from "react";

import '@mantine/core/styles.css';
import './globals.css';

import { ColorSchemeScript, MantineProvider, createTheme, mantineHtmlProps } from '@mantine/core';

export const metadata = {
    title: 'Taoshi Dashboard - PLEASE HIRE ME',
    description: 'Please',
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
