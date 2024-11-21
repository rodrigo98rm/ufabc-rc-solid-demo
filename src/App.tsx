import React, { useEffect } from 'react';
import './App.css';

import {
  LoginButton,
  LogoutButton,
  useSession,
  CombinedDataProvider,
  Text,
} from '@inrupt/solid-ui-react';

import {
  getPodUrlAll,
  getSolidDataset,
  getThing,
  getUrlAll,
} from '@inrupt/solid-client';
import { getOrCreateDataset } from './utils';

function App() {
  const { session } = useSession();

  useEffect(() => {
    if (!session) return;

    const exec = async () => {
      const profileDataset = await getSolidDataset(session.info.webId!, {
        fetch: session.fetch,
      });

      console.log(profileDataset);

      const profileThing = getThing(profileDataset, session.info.webId!);

      console.log(profileThing);

      const podsUrls = getUrlAll(
        profileThing!,
        'http://www.w3.org/ns/pim/space#storage'
      );

      console.log(podsUrls);

      const pod = podsUrls[0];
      const containerUri = `${pod}todos`;
      const list = await getOrCreateDataset(containerUri, session.fetch);

      console.log('LIST');
      console.log(list);

      const profile = await getOrCreateDataset(`${pod}profile`, session.fetch);

      console.log('PROFILE');
      console.log(profile);

      // const result = await getPodUrlAll(session.info.webId!, {
      //   fetch: session.fetch,
      // });

      // console.log(JSON.stringify(result, null, 2));
    };

    exec();
  }, [session]);

  if (session.info.isLoggedIn) {
    return (
      <CombinedDataProvider
        // datasetUrl={session.info.webId!}
        // thingUrl={session.info.webId!}
        datasetUrl="https://storage.inrupt.com/dca57eb0-c90b-4b30-a681-c1318e85cd52/"
        thingUrl="https://storage.inrupt.com/dca57eb0-c90b-4b30-a681-c1318e85cd52/profile"
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span>Você está logado como:</span>
          <Text
            properties={[
              'http://www.w3.org/2006/vcard/ns#fn',
              'http://xmlns.com/foaf/0.1/name',
            ]}
          />
          <div style={{ marginTop: 32 }}>
            <LogoutButton />
          </div>
        </div>
      </CombinedDataProvider>
    );
  }

  return (
    <>
      <LoginButton
        oidcIssuer="https://login.inrupt.com/"
        redirectUrl={window.location.href}
        authOptions={{ clientName: 'UFABC SOLID Demo' }}
      />
    </>
  );
}

export default App;
