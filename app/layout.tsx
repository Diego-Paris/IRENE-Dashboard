import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css'; //if using mantine date picker features
import 'mantine-react-table/styles.css'; //make sure MRT styles were imported in your app root (once)
import '../styles/global.css'; // Adjust the path according to your file structure

import React from 'react';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { getServerSession } from 'next-auth';

import { theme } from '../theme';
import { TanStackQuery } from '@/lib/providers/tanstack-query';
import SessionProvider from '@/lib/providers/session-provider';
import { authOptions } from './api/auth/[...nextauth]/route';
import { PermissionProvider } from '@/lib/providers/permission-provider';
import { inter } from '@/lib/utils/fonts';

export const metadata = {
  title: 'IReNE',
  description:
    "IReNE is a pioneering web application developed by University of Puerto Rico students to enhance the understanding and management of natural disaster impacts on Puerto Rico's infrastructure. It offers an intuitive platform for the creation, search, and modification of case studies, promoting documentation and collaboration under the RISE-UP initiative. Join our effort to build a resilient future for Puerto Rico through comprehensive case studies and shared knowledge.",
};

export default async function RootLayout({ children }: { children: any }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <head>
        <ColorSchemeScript forceColorScheme="light" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body className={inter.className}>
        <MantineProvider theme={theme} forceColorScheme="light">
          <SessionProvider session={session}>
            <Notifications />
            <TanStackQuery>
              <PermissionProvider />
              {children}
            </TanStackQuery>
          </SessionProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
